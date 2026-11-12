//Página que muestra el detalle de un pedido concreto al comprador.

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Package, Truck } from "lucide-react";
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
import CancelOrderDialog from "./CancelOrderDialog";
import OrderStatusInfo from "./OrderStatusInfo";

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
    },
  });

  if (!order) notFound();

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
    <main className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-6">
        <h1 className="font-display flex flex-wrap items-baseline gap-2 text-xl font-bold text-foreground md:text-2xl">
          {t("orderDetail")}
          <span className="text-primary">{order.id}</span>
        </h1>

        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Tarjeta del pedido */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="font-display mb-4 text-base font-bold text-foreground md:text-lg">Lo que has comprado</p>
          <div className="flex gap-4">
            {productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImage}
                alt={order.product.name}
                className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-24 sm:w-24">
                <Package
                  className="h-7 w-7 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1.5 text-sm">
              <p>
                <span className="text-muted-foreground">Producto: </span>
                <span className="font-medium text-foreground">{order.product.name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Artesano: </span>
                <Link
                  href={`/artisan/${order.artisan.id}`}
                  className="text-foreground transition-colors hover:text-primary"
                >
                  {order.artisan.name}
                </Link>
              </p>
              <p>
                <span className="text-muted-foreground">Fecha: </span>
                <span className="text-foreground">{formattedDate}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Método de envío: </span>
                <span className="text-foreground">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Desglose de costes */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="font-display mb-4 text-base font-bold text-foreground md:text-lg">Lo que has pagado</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio</span>
              <span className="text-foreground">
                {formatCents(order.priceInCents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-foreground">
                {formatCents(shippingCostInCents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Comisiones</span>
              <span className="text-foreground">
                {formatCents(commissionsInCents)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">
                {formatCents(order.totalInCents)}
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* Estado */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="font-display mb-4 text-base font-bold text-foreground md:text-lg">El estado en el que se encuentra</p>
          <OrderStatusInfo
            status={order.status}
            statusLabel={t(`orderStatus.${order.status}`)}
            explanation={statusExplanation}
          />
        </div>

        {/* Número de seguimiento */}
        {order.trackingNumber && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
            <Truck
              className="h-5 w-5 shrink-0 text-primary"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("trackingNumber")}
              </p>
              <p className="font-mono text-sm font-medium text-foreground">
                {order.trackingNumber}
              </p>
            </div>
          </div>
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
            className="block w-full rounded-full bg-primary py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:flex-1"
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
