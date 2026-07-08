//Funcionalidades de resend para enviar correos de recuperación de contraseña y notificación de compra y pedidos.

import type { Order } from "generated/prisma";
import { Resend } from "resend";

import { env } from "~/env";
import { db } from "~/server/db";
import { PLATFORM_SHIPPING_COST } from "~/lib/fees";
import { SHIPPING_METHOD_LABELS } from "~/lib/order-constants";

import OrderConfirmationEmail from "~/lib/emails/OrderConfirmationEmail";
import NewSaleEmail from "~/lib/emails/NewSaleEmail";
import CancellationEmail from "~/lib/emails/CancellationEmail";
import OrderCancelledByBuyerEmail from "~/lib/emails/OrderCancelledByBuyerEmail";
import ShipmentConfirmedEmail from "~/lib/emails/ShipmentConfirmedEmail";
import OrderReadyForPickupEmail from "~/lib/emails/OrderReadyForPickupEmail";
import NewFollowerEmail from "~/lib/emails/NewFollowerEmail";
import NewProductEmail from "~/lib/emails/NewProductEmail";
import NewMessageEmail from "~/lib/emails/NewMessageEmail";

if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
  console.warn(
    "[Artelier] Resend no configurado: RESEND_API_KEY y/o RESEND_FROM_EMAIL ausentes. " +
      "Los emails transaccionales no funcionarán.",
  );
}

export const resend = new Resend(env.RESEND_API_KEY ?? "re_placeholder_dev");
export const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "noreply@artelier.es";

//Concatena nombre y apellido, omitiendo el que falte.
function fullName(name: string | null, lastName: string | null) {
  return [name, lastName].filter(Boolean).join(" ");
}

//Función de envío correo al comprador de confirmación de pedido.
export async function sendOrderConfirmation(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { name: true, imageUrls: true } },
      artisan: { select: { name: true, lastName: true } },
    },
  });
  if (!data?.buyer?.email) return; // guard: no email → no enviar

  //shippingCost e insuranceFee no se guardan por separado en Order, se reconstruyen aquí.
  const shippingCostInCents =
    data.shippingMethod === "PLATFORM" ? PLATFORM_SHIPPING_COST : 0;
  const insuranceFeeInCents =
    data.platformFeeInCents - data.stripeFeeInCents - shippingCostInCents;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.buyer.email,
    subject: "Tu pedido ha sido confirmado — Artelier",
    react: OrderConfirmationEmail({
      orderId: data.id,
      productName: data.product.name,
      productImageUrl: data.product.imageUrls[0] ?? null,
      artisanName: fullName(data.artisan.name, data.artisan.lastName),
      buyerName: data.buyer.name ?? "",
      priceInCents: data.priceInCents,
      shippingCostInCents,
      insuranceFeeInCents,
      stripeFeeInCents: data.stripeFeeInCents,
      totalInCents: data.totalInCents,
    }),
  });
}

//Función de envío de correo al artesano de nuevo pedido.
export async function sendNewSale(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      artisan: { select: { name: true, email: true } },
      product: { select: { name: true, imageUrls: true } },
      buyer: {
        select: {
          name: true,
          lastName: true,
          street: true,
          city: true,
          province: true,
          postalCode: true,
        },
      },
    },
  });
  if (!data?.artisan?.email) return;

  //platformFeeInCents ya incluye stripeFeeInCents (es la application_fee de Stripe Connect),
  //así que la ganancia neta de la artesana es simplemente total - platformFee.
  const netEarningsInCents = data.totalInCents - data.platformFeeInCents;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.artisan.email,
    subject: "¡Tienes un nuevo pedido! — Artelier",
    react: NewSaleEmail({
      artisanName: data.artisan.name ?? "",
      orderId: data.id,
      productName: data.product.name,
      productImageUrl: data.product.imageUrls[0] ?? null,
      buyerName: data.buyer.name ?? "",
      buyerLastName: data.buyer.lastName,
      street: data.buyer.street,
      city: data.buyer.city,
      province: data.buyer.province,
      postalCode: data.buyer.postalCode,
      shippingMethod: SHIPPING_METHOD_LABELS[data.shippingMethod] ?? data.shippingMethod,
      shippingLabelUrl: null,
      netEarningsInCents,
    }),
  });
}

//Función de envío de correo de cancelación de pedido a la compradora.
export async function sendCancellationEmail(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { name: true, imageUrls: true } },
    },
  });
  if (!data?.buyer?.email) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.buyer.email,
    subject: "Tu pedido ha sido cancelado — Artelier",
    react: CancellationEmail({
      buyerName: data.buyer.name ?? "",
      orderId: data.id,
      productName: data.product.name,
      productImageUrl: data.product.imageUrls[0] ?? null,
      cancellationReason: data.cancellationReason,
      totalInCents: data.totalInCents,
    }),
  });
}

//Función de envío de correo de cancelación de pedido por el sistema.
//El contenido que recibe la compradora es idéntico al de una cancelación manual
//(mismo template, mismo destinatario) — la diferencia ya está en cancellationReason.
export async function sendOrderCancelledBySystemEmail(order: Order) {
  await sendCancellationEmail(order);
}

//Función de envío de correo a la artesana cuando la compradora cancela el pedido.
export async function sendOrderCancelledByBuyerEmail(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      artisan: { select: { name: true, email: true } },
      buyer: { select: { name: true } },
      product: { select: { name: true, imageUrls: true } },
    },
  });
  if (!data?.artisan?.email) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.artisan.email,
    subject: "La compradora ha cancelado el pedido — Artelier",
    react: OrderCancelledByBuyerEmail({
      artisanName: data.artisan.name ?? "",
      orderId: data.id,
      productName: data.product.name,
      productImageUrl: data.product.imageUrls[0] ?? null,
      buyerName: data.buyer.name ?? "",
      cancellationReason: data.cancellationReason,
    }),
  });
}

//Función de envío de correo de confirmación de envío de pedido (PLATFORM / ARTISAN_OWN).
export async function sendShipmentConfirmedEmail(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { name: true, imageUrls: true } },
      artisan: { select: { name: true, lastName: true } },
    },
  });
  if (!data?.buyer?.email) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.buyer.email,
    subject: "Tu pedido está en camino — Artelier",
    react: ShipmentConfirmedEmail({
      buyerName: data.buyer.name ?? "",
      orderId: data.id,
      productName: data.product.name,
      productImageUrl: data.product.imageUrls[0] ?? null,
      artisanName: fullName(data.artisan.name, data.artisan.lastName),
      shippingMethod: SHIPPING_METHOD_LABELS[data.shippingMethod] ?? data.shippingMethod,
      estimatedDelivery: null,
      trackingNumber: data.trackingNumber,
    }),
  });
}

//Función de envío de correo de pedido listo para recogida (método PICKUP).
export async function sendOrderReadyForPickupEmail(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { name: true, imageUrls: true } },
      artisan: {
        select: {
          name: true,
          lastName: true,
          street: true,
          city: true,
          province: true,
        },
      },
    },
  });
  if (!data?.buyer?.email) return;

  const pickupAddress =
    [data.artisan.street, data.artisan.city, data.artisan.province]
      .filter(Boolean)
      .join(", ") || "Consulta la dirección con la artesana en el chat";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.buyer.email,
    subject: "Tu pedido está listo para recoger — Artelier",
    react: OrderReadyForPickupEmail({
      buyerName: data.buyer.name ?? "",
      orderId: data.id,
      productName: data.product.name,
      productImageUrl: data.product.imageUrls[0] ?? null,
      artisanName: fullName(data.artisan.name, data.artisan.lastName),
      pickupAddress,
      pickupSchedule: null,
    }),
  });
}

//Función de envío de correo a la artesana de nueva seguidora.
export async function sendNewFollowerEmail(followerId: string, artisanId: string) {
  const [follower, artisan] = await Promise.all([
    db.user.findUnique({ where: { id: followerId }, select: { name: true } }),
    db.user.findUnique({ where: { id: artisanId }, select: { name: true, email: true } }),
  ]);
  if (!artisan?.email) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: artisan.email,
    subject: "¡Tienes una nueva seguidora! — Artelier",
    react: NewFollowerEmail({
      artisanName: artisan.name ?? "",
      followerName: follower?.name ?? "Alguien",
    }),
  });
}

//Función de envío de correo de notificación de mensaje no leído.
export async function sendNewMessageEmail(messageId: string) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          buyer: { select: { id: true, email: true, name: true } },
          artisan: { select: { id: true, email: true, name: true } },
        },
      },
      sender: { select: { name: true, image: true } },
    },
  });
  if (!message) return;

  //El destinatario es siempre el otro participante de la conversación (no quien envía el mensaje).
  const senderIsBuyer = message.senderId === message.conversation.buyerId;
  const recipient = senderIsBuyer
    ? message.conversation.artisan
    : message.conversation.buyer;
  if (!recipient.email) return;

  const conversationUrl = senderIsBuyer
    ? `https://artelier.es/studio/messages/${message.conversationId}`
    : `https://artelier.es/messages/${message.conversationId}`;

  const messagePreview =
    message.content.length > 100
      ? `${message.content.slice(0, 100)}…`
      : message.content;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: recipient.email,
    subject: "Tienes un nuevo mensaje — Artelier",
    react: NewMessageEmail({
      recipientName: recipient.name ?? "",
      senderName: message.sender.name ?? "",
      senderAvatarUrl: message.sender.image,
      messagePreview,
      conversationUrl,
    }),
  });
}

//Función de envío de correo a las seguidoras de nuevo producto publicado.
export async function sendNewProductEmail(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      artisan: {
        select: {
          name: true,
          followers: {
            include: { follower: { select: { email: true, name: true } } },
          },
        },
      },
    },
  });
  if (!product) return;

  //Promise.allSettled: si el email de una seguidora falla, no bloquea el envío al resto.
  await Promise.allSettled(
    product.artisan.followers
      .filter((f): f is typeof f & { follower: { email: string; name: string | null } } => !!f.follower.email)
      .map(({ follower }) =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: follower.email,
          subject: `${product.artisan.name ?? "Una artesana"} tiene algo nuevo para ti — Artelier`,
          react: NewProductEmail({
            followerName: follower.name ?? "",
            artisanName: product.artisan.name ?? "",
            productName: product.name,
            productImageUrl: product.imageUrls[0] ?? null,
            productUrl: `https://artelier.es/product/${product.id}`,
            productDescription: product.description,
            priceInCents: product.priceInCents,
          }),
        }),
      ),
  );
}
