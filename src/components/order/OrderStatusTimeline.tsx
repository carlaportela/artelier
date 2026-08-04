"use client";

//COmplemento que muestra una línea de tiempo visual del estado de un pedido: Confirmado → En preparación → Listo → Enviado →
//Entregado → Aceptado. Se usa tanto en la vista de la artesana como en la de la compradora.
import { useTranslations } from "next-intl";
import type { OrderStatus, ShippingMethod } from "generated/prisma";
import { getOrderStatusLabelKey } from "~/lib/order-status-label";

interface Props {
  status: OrderStatus;
  shippingMethod: ShippingMethod;
}

const STEPS: OrderStatus[] = ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED", "DELIVERED", "ACCEPTED"];

export default function OrderStatusTimeline({ status, shippingMethod }: Props) {
  const t = useTranslations("account");

  //Los pedidos de recogida en persona nunca pasan por "Enviado" — se omite ese paso.
  const steps = shippingMethod === "PICKUP" ? STEPS.filter((step) => step !== "SHIPPED") : STEPS; //.filter() recorre el array y se queda solo con los elementos para los que la función que le pasas devuelve true; en este caso, se queda con todos los pasos excepto "SHIPPED" si el método de envío es PICKUP.
  const currentIndex = steps.indexOf(status);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        //Encontramos el índice del paso actual y determinamos si cada paso es el actual, si ya se ha completado o si es el último paso.
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        const isLast = index === steps.length - 1;

        const label = t(getOrderStatusLabelKey(step, shippingMethod));

        //Renderizamos cada paso como un elemento de lista con un círculo que indica si estás completado (verde), actual (gris oscuro) o pendiente (gris claro), y una línea que conecta los pasos completados. El texto del paso también cambia de estilo según su estado.
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${
                  isDone || isCurrent ? "bg-[#3d5a4f]" : "bg-[--border]"
                }`}
              />
              {!isLast && (
                <span className={`w-px flex-1 ${isDone ? "bg-[#3d5a4f]" : "bg-[--border]"}`} />
              )}
            </div>
            <p
              className={`pb-4 text-sm ${
                isCurrent
                  ? "font-semibold text-[--text]"
                  : isDone
                    ? "text-[--text]"
                    : "text-[--text-muted]"
              }`}
            >
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
