//Funcionalidad para calcular las comisiones totales en referencia a un producto que se va a comprar.

export const PLATFORM_SHIPPING_COST = 490; //Comisión de envío de la plataforma. Precio fijo en céntimos.
export const INSURANCE_FEE_RATE = 0.02; //Porcentaje de comisión de seguro de la plataforma.
export const STRIPE_FEE_RATE = 0.015; //Porcentaje de comisión de transacción de Stripe.
export const STRIPE_FEE_FIXED = 25; //Comisión fija en céntimos por uso de Stripe

//Se definen los tipos de envío: de la plataforma, particular a cuenta del artesano y recogida en persona (sin envío).
export type ShippingMethod = "PLATFORM" | "ARTISAN_OWN" | "PICKUP";

//Función para calcular las comisiones totales. Se muestra en formulario de Stripe y en finalizar compra para enviar a checkout de Stripe.
export function calcFees(priceInCents: number, shipping: ShippingMethod) {
  const shippingCost = shipping === "PLATFORM" ? PLATFORM_SHIPPING_COST : 0;
  const subtotal = priceInCents + shippingCost;
  const insuranceFee = Math.round(subtotal * INSURANCE_FEE_RATE);
  const stripeFee = Math.round(subtotal * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
  const total = subtotal + insuranceFee + stripeFee;
  return { shippingCost, insuranceFee, stripeFee, total };
}
