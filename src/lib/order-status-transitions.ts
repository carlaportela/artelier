//Única fuente de verdad para la secuencia "En preparación → Listo → Enviado" (Historia 6.3). Sin
//dependencias de servidor — seguro para importar tanto desde el endpoint que aplica la transición
//como desde los componentes de cliente que solo necesitan saber si hay un siguiente paso o no.

import type { OrderStatus, ShippingMethod } from "generated/prisma";

//Calcula el siguiente estado al que puede avanzar un pedido, o null si no hay ningún avance
//disponible desde el estado y método de envío actuales (p. ej. un pedido de recogida ya en Listo,
//o cualquier estado fuera de En preparación/Listo).
export function getNextAdvanceableStatus(
  status: OrderStatus,
  shippingMethod: ShippingMethod,
): OrderStatus | null {
  if (status === "IN_PREPARATION") {
    return "READY";
  }
  if (status === "READY" && shippingMethod !== "PICKUP") {
    return "SHIPPED";
  }
  return null;
}
