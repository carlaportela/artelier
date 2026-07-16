//Constantes de negocio para la ventana de cancelación, envío y penalización de los pedidos realizados.

export const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos para que el comprador pueda cancelar el pedido.
export const ACCEPTANCE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos para que la artesana acepte o rechace un pedido nuevo.
export const SHIPPING_DEADLINE_MS = 120 * 60 * 60 * 1000; // 120 horas en milisegundos para confirmar el envío del pedido (a contar desde que la artesana acepta, no desde la creación del pedido — ver Historia 6.3).
export const PENALTY_AMOUNT_CENTS = 500; // 5 euros en céntimos de penalización en caso de que la vendedora no envíe el pedido dentro del plazo y este se cancele.
export const MESSAGE_NOTIFICATION_DELAY_MS = 5 * 60 * 1000; // 5 minutos en milisegundos antes de notificar por email un mensaje no leído, para el cron.

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  PLATFORM: "Envío a través de la plataforma",
  ARTISAN_OWN: "Envío particular por el artesano",
  PICKUP: "Recogida en persona",
};
