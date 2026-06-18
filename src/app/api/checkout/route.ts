//Endpoint de la API de Stripe para finalizar la compra y realizar el pago de la compradora a la artesana.

import { NextResponse } from "next/server"; //Para enviar respuestas HTTP desde el servidor al cliente (por ejemplo, errores).
import { getServerSession } from "~/server/auth/session"; //Para comprobar si el usuario está autenticado.
import { db } from "~/server/db"; //Para realizar las consultas a la base de datos.
import { stripe } from "~/lib/stripe"; //Para realizar el pago y comprobar si esta configurada la cuenta de Stripe de la artesana.
import { checkoutLimiter } from "~/lib/ratelimit"; //Para limitar el número de peticiones.
import { headers } from "next/headers"; //Función de Next.js que permite leer las cabeceras HTTP de la petición entrante dentro de Server Components y Route Handlers. En el contexto del rate limiting lo usamos para obtener la IP del cliente
import { calcFees, type ShippingMethod } from "~/lib/fees"; //Se importa la funcionalidad para calcular comisiones y tipos de envío.

//El parámetro req es necesario para leer el cuerpo de la petición que envía CheckoutForm.
export async function POST(req: Request) {
  //Se comprueba que el usuario esté autenticado, sino se devuelve el mensaje de error correspondiente.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 },
    );
  }

  //Se comprueba que el usuario autenticado tiene el rol de comprador, sino se devuelve el mensaje correspondiente.
  if (session.user.role !== "BUYER") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Sólo los compradores pueden acceder a esta función",
        },
      },
      { status: 403 },
    );
  }

  //Se comprueba si Stripe está configurado, sino se lanza el error correspondiente.
  if (stripe === null) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Servicio de pagos no configurado",
        },
      },
      { status: 503 },
    );
  }

  //Se limita la cantidad de peticiones para evitar abuso del endpoint de polling.
  const ip = (await headers()).get("x-forwarded-for") ?? "anonymous"; //x-forwarded-for es la cabecera estándar que los proxies y Vercel añaden con la IP real del cliente. Si no existe (en local normalmente no existe), usamos "anonymous" como fallback.
  const { success } = await checkoutLimiter.limit(ip); //Se aplica el limiter a la ip obtenida, no globalmente.
  if (!success) {
    //Si se supera el límite de peticiones, se lanza el error correspondiente.
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" } },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  //Leemos del cuerpo de la petición de CheckoutForm el id del producto y el método de envío.
  const { productId, shippingMethod } = (await req.json()) as {
    productId: string;
    shippingMethod: ShippingMethod;
  };

  //Se valida que el cuerpo de la petición contiene los campos requeridos y con valores válidos.
  if (!productId || !["PLATFORM", "ARTISAN_OWN", "PICKUP"].includes(shippingMethod)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Datos inválidos en la petición" } },
      { status: 400 },
    );
  }

  //Se realiza la consulta a la base de datos para verificar que el producto existe y esta disponible (estado activo y no se ha borrado), que la artesana cuenta con una cuenta de Stripe verificada.
  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      type: true,
      artisan: { select: { stripeAccountId: true } },
    },
  });

  //Si el producto no está disponible se lanza el correspondiente error.
  if (product === null) {
    return NextResponse.json(
      {
        error: {
          code: "PRODUCT_UNAVAILABLE",
          message: "El producto no se encuentra disponible",
        },
      },
      { status: 409 },
    );
  }

  //Si el artesano no tiene configurada una cuenta de Stripe, muestra el error correspondiente.
  if (product.artisan.stripeAccountId === null) {
    return NextResponse.json(
      {
        error: {
          code: "CHECKOUT_UNAVAILABLE",
          message: "No se puede realizar el pago",
        },
      },
      { status: 409 },
    );
  }

  //Se calculan las comisiones para esta compra.
  const fees = calcFees(product.priceInCents, shippingMethod);
  const applicationFee = fees.shippingCost + fees.insuranceFee + fees.stripeFee;

  //Se crea la sesión de pago en Stripe y se devuelve la URL para redirigir a la compradora.
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment", //Tipo de pago, en este caso, pago directo, no suscripción.
    line_items: [
      //Datos del producto a comprar: moneda, comisiones, nombre del producto  y cantidad.
      {
        price_data: {
          currency: "eur",
          unit_amount: fees.total,
          product_data: { name: product.name },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      //Datos de pago: comisiones (de Stripe, de envío y seguro de plataforma) y cuenta de Stripe de destino (artesana).
      application_fee_amount: applicationFee,
      transfer_data: { destination: product.artisan.stripeAccountId },
    },
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success`, //Dirección de pago realizado
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout?productId=${product.id}`, //Dirección de pago cancelado.
    metadata: {
      //Datos de la transacción: producto, artesano, método de envío, precio del producto, comisiones desglosadas.
      productId: product.id,
      buyerId: session.user.id,
      shippingMethod,
      priceInCents: String(product.priceInCents),
      platformFeeInCents: String(applicationFee),
      stripeFeeInCents: String(fees.stripeFee),
      totalInCents: String(fees.total),
    },
  });

  if (stripeSession.url === null) {
    return NextResponse.json(
      {
        error: {
          code: "STRIPE_ERROR",
          message: "Error al crear la sesión de pago",
        },
      },
      { status: 500 },
    );
  }

  //Devuelve la URL de la sesión de Stripe del servidor.
  return NextResponse.json({ data: { url: stripeSession.url } });
}
