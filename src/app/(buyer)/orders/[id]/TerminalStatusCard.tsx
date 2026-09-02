"use client";

//Tarjeta de estado para pedidos fuera de la secuencia "feliz" del timeline (cancelado, reembolsado o
//en disputa). Mismo lenguaje visual que OrderStatusTimeline: círculos unidos por una línea, con icono
//de información con toggle por paso. Solo dos pasos: "Pagado" (siempre ocurrió) y el estado final.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import type { CancelledBy, OrderStatus, ShippingMethod } from "generated/prisma";
import { getOrderStatusLabelKey } from "~/lib/order-status-label";
import { ORDER_STATUS_DOT } from "~/lib/order-constants";

interface Props {
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  cancellationReason: string | null;
  cancelledBy: CancelledBy | null;
  //Quién ve esta tarjeta — el texto se redacta en primera persona ("Has cancelado...") cuando quien
  //canceló es la misma persona que la está viendo, y en tercera ("... ha sido cancelado por...") en
  //caso contrario. SYSTEM no tiene "lado", así que no depende de viewerRole más que en el destinatario.
  viewerRole: "BUYER" | "ARTISAN";
}

export default function TerminalStatusCard({
  status,
  shippingMethod,
  cancellationReason,
  cancelledBy,
  viewerRole,
}: Props) {
  const t = useTranslations("account");
  const [openStep, setOpenStep] = useState<OrderStatus | null>(null);

  const steps: OrderStatus[] = ["CONFIRMED", status];

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5">
      <p className="font-display mb-4 text-base font-bold text-[--text] md:text-lg">El pedido se encuentra</p>
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isOpen = openStep === step;

          const label = t(getOrderStatusLabelKey(step, shippingMethod));
          let explanation = t(getOrderStatusLabelKey(step, shippingMethod, "orderStatusExplanation"));
          //El estado CANCELLED por sí solo no distingue si canceló la compradora, la artesana (rechazo)
          //o el sistema — usamos cancelledBy junto con viewerRole (quién está mirando la tarjeta) para
          //dar el texto correcto en cada caso. El motivo solo se muestra cuando quien canceló es "el
          //otro lado": si cancelaste tú, mostrarte tu propio motivo es redundante; si fue el sistema,
          //la frase fija ya lo explica todo.
          if (isLast && step === "CANCELLED") {
            if (cancelledBy) {
              explanation = t(`cancellationExplanation.${cancelledBy}.${viewerRole}`);
              if (cancelledBy !== "SYSTEM" && cancelledBy !== viewerRole && cancellationReason) {
                explanation += ` Motivo: ${cancellationReason}`;
              }
            } else if (cancellationReason) {
              explanation += ` Motivo: ${cancellationReason}`;
            }
            //El reembolso siempre le llega a la compradora (Stripe se ejecuta en los 3 caminos de
            //cancelación: ella misma, rechazo de la artesana, o el sistema) — se lo indicamos solo
            //cuando es ella quien está viendo la tarjeta, nunca a la artesana.
            if (viewerRole === "BUYER") {
              explanation += ` ${t("cancellationRefundNote")}`;
            }
          }

          return (
            <li key={step} aria-current={isLast ? "step" : undefined} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    isLast ? (ORDER_STATUS_DOT[step] ?? "bg-[#3d5a4f]") : "bg-[#ccc8bc]"
                  }`}
                />
                {!isLast && <span className="w-px flex-1 bg-[#9a9088]" />}
              </div>
              <div className="pb-4">
                <span className="flex items-center gap-1.5">
                  <p className={`text-sm ${isLast ? "font-semibold text-[--text]" : "text-[--text]"}`}>
                    {label}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenStep((prev) => (prev === step ? null : step))}
                    aria-label={isOpen ? `Ocultar información de ${label}` : `Ver información de ${label}`}
                    className="cursor-pointer text-[--text-muted]/35 transition-colors hover:text-[#3d5a4f]"
                  >
                    <Info size={13} />
                  </button>
                </span>
                {isOpen && (
                  <p className="mt-1 rounded-lg bg-[--surface-2] px-3 py-2 text-xs text-[--text-muted]/55">
                    {explanation}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
