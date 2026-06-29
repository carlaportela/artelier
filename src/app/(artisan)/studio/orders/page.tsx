//Página de pedidos del estudio de la artesana.

import type { Metadata } from "next";
import { Package } from "lucide-react";
import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Pedidos — Artelier" };

export default async function PedidosPage() {
  //Comprobamos que el usuario está autenticado y tiene rol de artesano.
  const session = await requireArtisanSession();

  //Se obtienen los pedidos mediante una consulta a la base de datos.
  const orders = await db.order.findMany({
    where: { artisanId: session.user.id, status: { not: "CANCELLED" } },
    include: {
      product: { select: { name: true, imageUrls: true } },
      buyer: {
        select: {
          name: true,
          lastName: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const t = await getTranslations("account");

  return (
    <main className="bg-[--bg]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display mb-6 text-xl font-bold text-[--text]">
          {t("myOrders")}
        </h1>
        {orders.length === 0 ? ( //Si no existen pedidos muestra el mensaje correspondiente.
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3d5a4f]/10">
              <Package className="h-7 w-7 text-[#3d5a4f]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-base font-bold text-[--text]">
                Aún no tienes pedidos.
              </p>
              <p className="mt-2 max-w-xs text-sm text-[--text-muted]">
                Cuando una compradora realice un pedido desde tu perfil,
                aparecerá aquí con todos los detalles: producto, importe, estado
                y datos de envío.
              </p>
            </div>
          </div>
        ) : (
          //Si existen pedidos los muestra.
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="space-y-1 rounded-xl border border-[--border] bg-[--surface] p-4"
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
                  {order.buyer.name} {order.buyer.lastName} ·{" "}
                  {new Intl.DateTimeFormat("es-ES", {
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
                    href={`/studio/orders/${order.id}`}
                    className="text-xs font-medium text-[#3d5a4f] transition-colors hover:text-[#4a6b5e]"
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
