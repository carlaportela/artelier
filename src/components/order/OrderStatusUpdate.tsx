"use client";

//Entrada del historial de un pedido: el paso de estado al que avanzó la artesana, con su mensaje
//personal (si escribió uno) y cuándo ocurrió.
import { useTranslations } from "next-intl";
import type { OrderStatus, ShippingMethod } from "generated/prisma";
import { formatTime } from "~/lib/date";
import { getOrderStatusLabelKey } from "~/lib/order-status-label";

interface Props {
  status: OrderStatus;
  message: string | null;
  createdAt: Date | string;
  shippingMethod: ShippingMethod;
}

export default function OrderStatusUpdate({ status, message, createdAt, shippingMethod }: Props) {
  const t = useTranslations("account");
  const label = t(getOrderStatusLabelKey(status, shippingMethod));

  return (
    <li className="rounded-xl border border-[--border] bg-[--surface] p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[--text]">{label}</p>
        <time dateTime={new Date(createdAt).toISOString()} className="text-xs text-[--text-muted]">
          {formatTime(createdAt)}
        </time>
      </div>
      {message && <p className="mt-1 text-sm text-[--text-muted]">{message}</p>}
    </li>
  );
}
