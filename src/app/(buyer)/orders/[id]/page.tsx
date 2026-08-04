//Página que muestra el detalle de un pedido concreto al comprador.

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { CANCELLATION_WINDOW_MS, SHIPPING_METHOD_LABELS } from "~/lib/order-constants";
import { getOrderStatusLabelKey } from "~/lib/order-status-label";
import CancelOrderDialog from "./CancelOrderDialog";
import OrderStatusPoller, { type StatusUpdateData } from "./OrderStatusPoller";

//Estados fuera de la secuencia "feliz" del timeline (Confirmado → ... → Aceptado) — para estos, el
//timeline no se muestra (la tarjeta de motivo de cancelación ya cubre la comunicación necesaria).
const TIMELINE_STATUSES = ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED", "DELIVERED", "ACCEPTED"];

export const metadata: Metadata = { title: "Detalle del pedido — Artelier" };

interface Props {
  params: Promise<{ id: string }>;
}

//Función para renderizar los detalles del pedido.
export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  const t = await getTranslations("account");

  const order = await db.order.findFirst({
    where: { id, buyerId: session.user.id, deletedAt: null },
    include: {
      product: {
        select: { name: true, imageUrls: true, type: true, expiresAt: true },
      },
      artisan: { select: { name: true, id: true } },
      statusUpdates: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  //El poller necesita las fechas como string (ISO) — un Date no cruza el límite servidor→cliente como instancia.
  const initialStatusUpdates: StatusUpdateData[] = order.statusUpdates.map((update) => ({
    id: update.id,
    status: update.status,
    message: update.message,
    createdAt: update.createdAt.toISOString(),
  }));

  //Variable en la que se comprueba si no ha expirado el período ventana para cancelación del pedido por parte de la compradora.
  const canCancel =
    order.status === "CONFIRMED" &&
    Date.now() - order.createdAt.getTime() < CANCELLATION_WINDOW_MS;

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.createdAt));

  const formatCents = (cents: number) =>
    (cents / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });

  const productImage = order.product.imageUrls[0] ?? null;

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Volver */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-[--text-muted] transition-colors hover:text-[--text]"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("myOrders")}
        </Link>

        <h1 className="font-display text-2xl font-bold text-[--text]">
          {t("orderDetail")}
        </h1>

        {/* Tarjeta del producto */}
        <div className="flex items-center gap-4 rounded-xl border border-[--border] bg-[--surface] p-4">
          {productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={productImage}
              alt={order.product.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[--surface-2]">
              <Package
                className="h-7 w-7 text-[--text-muted]"
                strokeWidth={1.5}
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-[--text]">
              {order.product.name}
            </p>
            <p className="text-sm text-[--text-muted]">
              <Link
                href={`/artisan/${order.artisan.id}`}
                className="transition-colors hover:text-[--text]"
              >
                {order.artisan.name}
              </Link>
            </p>
            <p className="mt-1 text-xs text-[--text-muted]">{formattedDate}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-[--surface-2] px-2.5 py-1 text-xs text-[--text-muted]">
            {t(getOrderStatusLabelKey(order.status, order.shippingMethod))}
          </span>
        </div>

        {/* Timeline de estados, con actualización en tiempo real — solo para pedidos en la
        secuencia normal; un pedido cancelado/reembolsado/en disputa ya tiene su propia tarjeta
        de motivo más abajo, y el timeline no representa bien esos estados terminales. */}
        {TIMELINE_STATUSES.includes(order.status) && (
          <OrderStatusPoller
            orderId={order.id}
            initialStatus={order.status}
            shippingMethod={order.shippingMethod}
            initialStatusUpdates={initialStatusUpdates}
            initialTrackingNumber={order.trackingNumber}
          />
        )}

        {/* Desglose de costes */}
        <div className="space-y-2 rounded-xl border border-[--border] bg-[--surface] p-4">
          <div className="flex justify-between text-sm">
            <span className="text-[--text-muted]">Producto</span>
            <span className="text-[--text]">
              {formatCents(order.priceInCents)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[--text-muted]">Método de envío</span>
            <span className="text-[--text]">
              {SHIPPING_METHOD_LABELS[order.shippingMethod]}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[--text-muted]">
              Gastos de envío y comisión
            </span>
            <span className="text-[--text]">
              {formatCents(order.totalInCents - order.priceInCents)}
            </span>
          </div>
          <div className="flex justify-between border-t border-[--border] pt-2 text-sm font-semibold">
            <span className="text-[--text]">Total</span>
            <span className="text-[--text]">
              {formatCents(order.totalInCents)}
            </span>
          </div>
        </div>

        {/* Motivo de cancelación */}
        {order.cancellationReason && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-medium text-red-600">
              Motivo de cancelación
            </p>
            <p className="mt-1 text-sm text-red-700">
              {order.cancellationReason}
            </p>
          </div>
        )}

        {/* Botón cancelar */}
        {canCancel && <CancelOrderDialog orderId={order.id} />}
      </div>
    </main>
  );
}
