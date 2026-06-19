//Funcionalidades de resend para enviar correos de recuperación de contraseña y notificación de compra y pedidos.

import type { Order } from "generated/prisma";
import { Resend } from "resend";

import { env } from "~/env";

if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
  console.warn(
    "[Artelier] Resend no configurado: RESEND_API_KEY y/o RESEND_FROM_EMAIL ausentes. " +
      "Los emails transaccionales no funcionarán.",
  );
}

export const resend = new Resend(env.RESEND_API_KEY ?? "re_placeholder_dev");
export const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "noreply@artelier.es";

export async function sendOrderConfirmation(order: Order) {
  // TODO H6.1: Enviar email de confirmación de orden al comprador
  console.log("TODO: sendOrderConfirmation", order.id);
}

export async function sendNewSale(order: Order) {
  // TODO H6.1: Enviar email de nueva venta al artesano
  console.log("TODO: sendNewSale", order.id);
}

