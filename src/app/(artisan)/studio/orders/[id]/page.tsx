//Página de detalle de pedido del estudio del artesano.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";
import PaletteAvatar from "~/components/PaletteAvatar";
import { SHIPPING_METHOD_LABELS } from "~/lib/order-constants";
import ConfirmShipmentForm from "./ConfirmShipmentForm";
import AcceptOrRejectOrderCard from "./AcceptOrRejectOrderCard";


export const metadata: Metadata = { title: "Detalle del pedido — Artelier" };

interface Props {
  params: Promise<{ id: string }>;
}

//Función para renderizar los detalles del pedido.
export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await requireArtisanSession();

  const t = await getTranslations("account");

  const order = await db.order.findFirst({
    where: { id, artisanId: session.user.id, status: { not: "CANCELLED" } },
    include: {
      product: {
        select: { name: true, imageUrls: true, type: true, expiresAt: true },
      },
      buyer: {
        select: {
          name: true,
          lastName: true,
          image: true,
          street: true,
          postalCode: true,
          city: true,
          province: true,
        },
      },
    },
  });

  if (!order) notFound();

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
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Volver */}
        <Link
          href="/studio/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("myOrders")}
        </Link>

        <h1 className="font-display text-2xl font-bold text-foreground">
          {t("orderDetail")}
        </h1>

        {/* Tarjeta del producto */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          {productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={productImage}
              alt={order.product.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Package
                className="h-7 w-7 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-foreground">
              {order.product.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {t(`orderStatus.${order.status}`)}
          </span>
        </div>

        {/* Número de seguimiento */}
        {order.trackingNumber && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
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
        {/* Comprador */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Datos del comprador
          </p>
          <div className="flex items-center gap-3">
            <PaletteAvatar
              src={order.buyer.image}
              name={order.buyer.name}
              className="h-9 w-9 shrink-0"
              fillColor="var(--brand-accent)"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {order.buyer.name} {order.buyer.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.buyer.street}, {order.buyer.postalCode}{" "}
                {order.buyer.city}, {order.buyer.province}
              </p>
            </div>
          </div>
        </div>

        {/* Desglose de costes */}
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Producto</span>
            <span className="text-foreground">
              {formatCents(order.priceInCents)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Método de envío</span>
            <span className="text-foreground">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Gastos de envío y comisión
            </span>
            <span className="text-foreground">
              {formatCents(order.totalInCents - order.priceInCents)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">
              {formatCents(order.totalInCents)}
            </span>
          </div>
        </div>
        {order.status === "CONFIRMED" && (
          <AcceptOrRejectOrderCard
            orderId={order.id}
            createdAt={order.createdAt.toISOString()}
          />
        )}
        {order.status === "IN_PREPARATION" && (
          <ConfirmShipmentForm orderId={order.id} shippingMethod={order.shippingMethod} />
        )}
      </div>
    </main>
  );
}
