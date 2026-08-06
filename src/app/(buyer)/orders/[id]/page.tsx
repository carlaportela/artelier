//Página que muestra el detalle de un pedido concreto al comprador.

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import {
  ACCEPTANCE_WINDOW_MS,
  CANCELLATION_WINDOW_MS,
  SHIPPING_METHOD_LABELS,
} from "~/lib/order-constants";
import { PLATFORM_SHIPPING_COST } from "~/lib/fees";
import { getOrderStatusLabelKey } from "~/lib/order-status-label";
import CancelOrderDialog from "./CancelOrderDialog";
import OrderStatusInfo from "./OrderStatusInfo";
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

  //Fecha límite para que la artesana acepte o rechace el pedido — se muestra como explicación del estado "Pagado".
  const acceptanceDeadline = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(order.createdAt.getTime() + ACCEPTANCE_WINDOW_MS));

  const formatCents = (cents: number) =>
    (cents / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });

  const productImage = order.product.imageUrls[0] ?? null;

  //El coste de envío no se guarda como campo propio en el pedido — se deriva del método,
  //igual que en el checkout: solo el envío de la plataforma tiene coste para la compradora.
  const shippingCostInCents =
    order.shippingMethod === "PLATFORM" ? PLATFORM_SHIPPING_COST : 0;
  const commissionsInCents =
    order.totalInCents - order.priceInCents - shippingCostInCents;

  const statusExplanation =
    order.status === "CONFIRMED"
      ? `Tu pedido está pagado y a la espera de que la artesana lo acepte. Tiene de plazo hasta el ${acceptanceDeadline} — si no responde a tiempo, el pedido se cancelará automáticamente y se te reembolsará.`
      : undefined;

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-6">
        <h1 className="font-display flex flex-wrap items-baseline gap-2 text-xl font-bold text-[--text] md:text-2xl">
          {t("orderDetail")}
          <span className="text-[#3d5a4f]">{order.id}</span>
        </h1>

        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Tarjeta del pedido */}
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5">
          <p className="font-display mb-4 text-base font-bold text-[--text] md:text-lg">Lo que has comprado</p>
          <div className="flex gap-4">
            {productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImage}
                alt={order.product.name}
                className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[--surface-2] sm:h-24 sm:w-24">
                <Package
                  className="h-7 w-7 text-[--text-muted]"
                  strokeWidth={1.5}
                />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1.5 text-sm">
              <p>
                <span className="text-[--text-muted]">Producto: </span>
                <span className="font-medium text-[--text]">{order.product.name}</span>
              </p>
              <p>
                <span className="text-[--text-muted]">Artesano: </span>
                <Link
                  href={`/artisan/${order.artisan.id}`}
                  className="text-[--text] transition-colors hover:text-[#3d5a4f]"
                >
                  {order.artisan.name}
                </Link>
              </p>
              <p>
                <span className="text-[--text-muted]">Fecha: </span>
                <span className="text-[--text]">{formattedDate}</span>
              </p>
              <p>
                <span className="text-[--text-muted]">Método de envío: </span>
                <span className="text-[--text]">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Desglose de costes */}
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5">
          <p className="font-display mb-4 text-base font-bold text-[--text] md:text-lg">Lo que has pagado</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[--text-muted]">Precio</span>
              <span className="text-[--text]">
                {formatCents(order.priceInCents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[--text-muted]">Envío</span>
              <span className="text-[--text]">
                {formatCents(shippingCostInCents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[--text-muted]">Comisiones</span>
              <span className="text-[--text]">
                {formatCents(commissionsInCents)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[--border] pt-2 text-sm font-semibold">
              <span className="text-[--text]">Total</span>
              <span className="text-[--text]">
                {formatCents(order.totalInCents)}
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* Estado */}
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5">
          <p className="font-display mb-4 text-base font-bold text-[--text] md:text-lg">El estado en el que se encuentra</p>
          <OrderStatusInfo
            status={order.status}
            statusLabel={t(getOrderStatusLabelKey(order.status, order.shippingMethod))}
            explanation={statusExplanation}
          />
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

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Volver a mis pedidos */}
          <Link
            href="/orders"
            className="block w-full rounded-full bg-[#3d5a4f] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] sm:flex-1"
          >
            Volver a mis pedidos
          </Link>

          {/* Botón cancelar */}
          {canCancel && (
            <div className="sm:flex-1">
              <CancelOrderDialog orderId={order.id} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
