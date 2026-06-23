//Constantes de negocio para la ventana de cancelación, envío y penalización de los pedidos realizados.

export const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos para que el comprador pueda cancelar el pedido.
export const SHIPPING_DEADLINE_MS = 120 * 60 * 60 * 1000; // 120 horas en milisegundos para confirmar el envío del pedido.
export const PENALTY_AMOUNT_CENTS = 500; // 5 euros en céntimos de penalización en caso de que la vendedora no envíe el pedido dentro del plazo y este se cancele.
