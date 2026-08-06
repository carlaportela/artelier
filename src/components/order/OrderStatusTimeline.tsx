"use client";

//Complemento que muestra una línea de tiempo visual del estado de un pedido: Confirmado → En preparación → Listo → Enviado →
//Entregado → Completado. Se usa tanto en la vista de la artesana como en la de la compradora.
//Cada paso tiene un icono de información con un toggle que explica qué significa ese estado —
//solo uno puede estar abierto a la vez, a modo de acordeón.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import type { OrderStatus, ShippingMethod } from "generated/prisma";
import { getOrderStatusLabelKey } from "~/lib/order-status-label";
import { ACCEPTANCE_WINDOW_MS, ORDER_STATUS_DOT } from "~/lib/order-constants";

interface Props {
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  orderCreatedAt: string;
}

const STEPS: OrderStatus[] = ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED", "DELIVERED", "ACCEPTED"];

export default function OrderStatusTimeline({ status, shippingMethod, orderCreatedAt }: Props) {
  const t = useTranslations("account");
  const [openStep, setOpenStep] = useState<OrderStatus | null>(null);

  //Los pedidos de recogida en persona nunca pasan por "Enviado" — se omite ese paso.
  const steps = shippingMethod === "PICKUP" ? STEPS.filter((step) => step !== "SHIPPED") : STEPS; //.filter() recorre el array y se queda solo con los elementos para los que la función que le pasas devuelve true; en este caso, se queda con todos los pasos excepto "SHIPPED" si el método de envío es PICKUP.
  const currentIndex = steps.indexOf(status);

  //Plazo de aceptación de la artesana — solo relevante como aclaración extra del paso "Pagado".
  const acceptanceDeadline = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(new Date(orderCreatedAt).getTime() + ACCEPTANCE_WINDOW_MS));

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        //Encontramos el índice del paso actual y determinamos si cada paso es el actual, si ya se ha completado o si es el último paso.
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        const isLast = index === steps.length - 1;
        const isOpen = openStep === step;

        const label = t(getOrderStatusLabelKey(step, shippingMethod));
        let explanation = t(getOrderStatusLabelKey(step, shippingMethod, "orderStatusExplanation"));
        if (step === "CONFIRMED") {
          explanation += ` Tiene de plazo hasta el ${acceptanceDeadline}.`;
        }

        //Renderizamos cada paso como un elemento de lista con un círculo que indica si estás completado (gris claro), actual (color del estado) o pendiente (vacío/hueco), y una línea que conecta los pasos. El texto del paso también cambia de estilo según su estado.
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${
                  isCurrent
                    ? (ORDER_STATUS_DOT[step] ?? "bg-[#3d5a4f]")
                    : isDone
                      ? "bg-[#ccc8bc]"
                      : "border border-[#9a9088] bg-transparent"
                }`}
              />
              {!isLast && <span className="w-px flex-1 bg-[#9a9088]" />}
            </div>
            <div className="pb-4">
              <span className="flex items-center gap-1.5">
                <p
                  className={`text-sm ${
                    isCurrent
                      ? "font-semibold text-[--text]"
                      : isDone
                        ? "text-[--text]"
                        : "text-[--text-muted]"
                  }`}
                >
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
  );
}
