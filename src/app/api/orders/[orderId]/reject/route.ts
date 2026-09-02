//Endpoint de API para que la artesana rechace un pedido nuevo dentro del plazo de 24 horas.

import { NextResponse } from "next/server";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { stripe } from "~/lib/stripe";
import { ACCEPTANCE_WINDOW_MS } from "~/lib/order-constants";
import { sendCancellationEmail } from "~/lib/resend";
import { claimAndCancelOrder } from "~/lib/orders";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  //Comprobamos que el usuario esté autenticado y tenga el rol de artesana.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 },
    );
  }
  if (session.user.role !== "ARTISAN") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Esta función sólo está disponible para artesanas",
        },
      },
      { status: 403 },
    );
  }

  //Extraemos orderId de Params y comprobamos que existe el pedido y que pertenece a esta artesana.
  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: { id: orderId, artisanId: session.user.id, deletedAt: null },
    include: { product: { select: { type: true, expiresAt: true } } },
  });
  if (!order) {
    return NextResponse.json(
      { error: { code: "ORDER_NOT_FOUND", message: "Pedido no encontrado" } },
      { status: 404 },
    );
  }

  //Solo se puede rechazar un pedido que esté recién confirmado (mismo estado que para aceptar).
  if (order.status !== "CONFIRMED") {
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_ACCEPTABLE",
          message: "Este pedido no se puede rechazar",
        },
      },
      { status: 409 },
    );
  }

  //Comprobamos que no hayan pasado más de 24 horas desde la confirmación del pago.
  const windowExpired =
    Date.now() - order.createdAt.getTime() > ACCEPTANCE_WINDOW_MS;
  if (windowExpired) {
    return NextResponse.json(
      {
        error: {
          code: "ACCEPTANCE_WINDOW_CLOSED",
          message: "El plazo de 24h para decidir sobre el pedido ha expirado",
        },
      },
      { status: 409 },
    );
  }

  //Obtenemos el motivo del rechazo del body de la petición — mismo mínimo de 10 caracteres que en cancel/route.ts.
  const body = (await req.json()) as Record<string, unknown>;
  const reason = (typeof body.reason === "string" ? body.reason : "").trim();
  if (reason.length < 10) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REASON",
          message: "El motivo debe tener al menos 10 caracteres",
        },
      },
      { status: 422 },
    );
  }

  //Comprobamos disponibilidad de Stripe antes de reclamar el pedido, para no cancelarlo si luego no
  //vamos a poder tramitar el reembolso.
  if (!stripe) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Servicio de pagos no disponible",
        },
      },
      { status: 503 },
    );
  }

  //Reclamamos el pedido y reactivamos el producto (si procede) de forma atómica, antes de tocar
  //Stripe: así no reembolsamos por error un pedido que la artesana ya aceptó o que el cron ya
  //canceló entre la comprobación de arriba y este punto (ver claimAndCancelOrder en ~/lib/orders).
  const claimed = await claimAndCancelOrder({
    orderId,
    cancellationReason: reason,
    cancelledBy: "ARTISAN",
    product: order.product,
    productId: order.productId,
  });
  if (!claimed) {
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_ACCEPTABLE",
          message: "Este pedido ya ha sido procesado",
        },
      },
      { status: 409 },
    );
  }

  //El pedido ya es nuestro (reclamado y el producto reactivado atómicamente) — procedemos al
  //reembolso íntegro. El rechazo voluntario no penaliza a la artesana.
  await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });

  //Se avisa a la compradora del rechazo y el motivo — reutilizamos la misma función y template que
  //ya usa la cancelación de H6.1, no hace falta un email nuevo para esto.
  void sendCancellationEmail(order).catch(console.error);

  return NextResponse.json({ data: { rejected: true } });
}
