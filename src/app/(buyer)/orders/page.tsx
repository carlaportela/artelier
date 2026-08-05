//Página de pedidos del comprador

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { ORDER_STATUS_DOT } from "~/lib/order-constants";

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

  const dateFormatter = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-6">
        <h1 className="font-display text-xl font-bold text-[--text] md:text-2xl">{t("myOrders")}</h1>

        {orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-[--text-muted]">
            {t("noOrders")}
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[--surface-2] sm:h-20 sm:w-20">
                  {order.product.imageUrls[0] ? (
                    <Image
                      src={order.product.imageUrls[0]}
                      alt={order.product.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 80px, 64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[10px] text-[--text-muted]">Sin foto</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-[--text-muted] sm:text-sm">
                    {dateFormatter.format(new Date(order.createdAt))}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[--text] sm:text-sm">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${ORDER_STATUS_DOT[order.status] ?? "bg-[#94a49e]"}`}
                    />
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </div>

                <div className="flex shrink-0 items-center">
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-full bg-[#3d5a4f] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#4a6b5e] sm:px-4 sm:text-sm"
                  >
                    Ver pedido
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
