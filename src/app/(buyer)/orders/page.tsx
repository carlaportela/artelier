//Página de pedidos del comprador

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

export const metadata: Metadata = { title: "Mis pedidos — Artelier" };

//Función que renderiza la lista de pedidos.
export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  const t = await getTranslations("account");

  const orders = await db.order.findMany({
    where: { buyerId: session.user.id, deletedAt: null },
    include: { //Con include se obtiene el order completo y además los campos seleccionados de las tablas relacionadas con el pedido.
      product: { select: { name: true, imageUrls: true } },
      artisan: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-2xl font-bold text-[--text]">{t("myOrders")}</h1>

        {orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-[--text-muted]">
            {t("noOrders")}
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-[--border] bg-[--surface] p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold text-[--text]">
                    {order.product.name}
                  </p>
                  <span className="rounded-full bg-[--surface-2] px-2 py-0.5 text-xs text-[--text-muted]">
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </div>
                <p className="text-xs text-[--text-muted]">
                  {order.artisan.name} · {new Intl.DateTimeFormat("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(order.createdAt))}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[--text]">
                    {(order.totalInCents / 100).toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs text-[#3d5a4f] transition-colors hover:text-[#4a6b5e] font-medium"
                  >
                    Ver pedido →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
