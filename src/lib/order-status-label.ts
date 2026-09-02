//Clave de traducción para mostrar el estado de un pedido, con el caso especial de "Listo para
//recogida" cuando el método de envío es PICKUP. Sin dependencias de servidor — seguro para
//importar tanto desde Server Components como desde Client Components.

import type { OrderStatus, ShippingMethod } from "generated/prisma";

export function getOrderStatusLabelKey(
  status: OrderStatus,
  shippingMethod: ShippingMethod,
  namespace: "orderStatus" | "orderStatusExplanation" = "orderStatus",
): string {
  if (status === "READY" && shippingMethod === "PICKUP") {
    return `${namespace}.READY_PICKUP`;
  }
  return `${namespace}.${status}`;
}
