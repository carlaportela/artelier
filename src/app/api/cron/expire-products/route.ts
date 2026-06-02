// Endpoint invocado diariamente por Vercel Cron Job.
// Marca como EXPIRED los productos perecederos cuya fecha de caducidad ha vencido.
// Protegido con CRON_SECRET para evitar invocaciones no autorizadas.

import { NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";

export const dynamic = "force-dynamic"; // nunca cachear este endpoint

export async function GET(req: Request) {
  // AC2 — Verificar CRON_SECRET: si no está configurado o el token no coincide, rechazar
  const expectedToken = env.CRON_SECRET;
  if (!expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // AC1 + AC3 — Buscar candidatos a expirar
  const expiredCandidates = await db.product.findMany({
    where: { expiresAt: { lte: now }, status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });

  if (expiredCandidates.length === 0) {
    return NextResponse.json({ data: { expired: 0 } });
  }

  const candidateIds = expiredCandidates.map((p) => p.id);

  // AC4 — Excluir productos con pedidos activos (ni CANCELLED ni REFUNDED)
  const withActiveOrders = await db.order.findMany({
    where: {
      productId: { in: candidateIds },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    select: { productId: true },
  });

  const protectedIds = new Set(withActiveOrders.map((o) => o.productId));

  if (protectedIds.size > 0) {
    console.warn(
      `[cron/expire-products] ${protectedIds.size} producto(s) con pedidos activos omitidos:`,
      [...protectedIds],
    );
  }

  const toExpireIds = candidateIds.filter((id) => !protectedIds.has(id));

  if (toExpireIds.length === 0) {
    return NextResponse.json({ data: { expired: 0 } });
  }

  const { count } = await db.product.updateMany({
    where: { id: { in: toExpireIds } },
    data: { status: "EXPIRED" },
  });

  console.log(`[cron/expire-products] ${count} producto(s) marcados como EXPIRED`);
  return NextResponse.json({ data: { expired: count } });
}
