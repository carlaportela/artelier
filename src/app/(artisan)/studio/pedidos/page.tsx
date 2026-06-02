//Página de pedidos del estudio: muestra encargos personalizados recibidos por la artesana.

import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import PedidosView from "./PedidosView";

export const metadata: Metadata = { title: "Pedidos — Artelier" };

export default async function PedidosPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const requests = await db.customOrderRequest.findMany({
    where: { artisanId: session.user.id, deletedAt: null },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const processed = requests.filter((r) => r.status !== "PENDING");

  return (
    <main className="bg-[--bg]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 font-display text-xl font-bold text-[--text]">Pedidos</h1>
        <PedidosView pending={pending} processed={processed} />
      </div>
    </main>
  );
}
