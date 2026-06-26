//Endpoint de la API de Stripe para finalizar la compra y realizar el pago de la compradora a la artesana.

import { NextResponse } from "next/server"; //Para enviar respuestas HTTP desde el servidor al cliente (por ejemplo, errores).
import { getServerSession } from "~/server/auth/session"; //Para comprobar si el usuarrio está autenticado.
import { db } from "~/server/db"; //Para realizar las consultas a la base de datos.
import { stripe } from "~/lib/stripe"; //Para realizar el pago y comprobar si esta configurada la cuenta de Stripe de la artesana.
import { checkoutLimiter } from "~/lib/ratelimit"; //Para limitar el número de peticiones.
import { headers } from "next/headers"; //Función de Next.js que permite leer las cabeceras HTTP de la petición entrante dentro de Server Components y Route Handlers. En el contexto del rate limiting lo usamos para obtener la IP del cliente
import { calcFees } from "~/lib/fees"; //Se importa la funcionalidad para calcular comisiones y tipos de envío.
import { getBaseUrl } from "~/lib/stripe-url"; //Helper para construir base URL consistentemente
import { type ShippingMethod } from "~/lib/fees"; // ✅ Correcto
import { boolean } from "zod";

//El parámetro req es necesario para leer el cuerpo de la petición que envía CHeckoutForm.
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

  //Leemos del cuerpo de la petición de checkOutForm el id del producto y el método de envío.
  const body = (await req.json()) as Record<string, unknown>;

  // Validar tipos
  if (
    typeof body.productId !== "string" ||
    !body.productId.trim() ||
    typeof body.shippingMethod !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const productId = body.productId;
  const shippingMethodString = body.shippingMethod;

  //Comprobamos que el metodo de envío es válido en tiempo de ejecución
  const validMethods = ["PLATFORM", "ARTISAN_OWN", "PICKUP"] as const;
  if (!validMethods.includes(shippingMethodString as never)) {
    return NextResponse.json(
      { error: "Invalid shipping method" },
      { status: 400 },
    );
  }

  const shippingMethod = shippingMethodString as ShippingMethod;

  //Se realiza la consulta a la base de datos para verificar que el producto existe y esta disponible (estado activo y no se ha borrado), que la artesana cuenta con una cuenta de Stripe verificada.
  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      type: true,
      artisan: {
        select: {
          stripeAccountId: true,
          firstSaleCompleted: true,
          pendingPenaltyInCents: true,
        },
      },
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

  //Se calculan las comisiones para esta compra, teniendo en cuenta el precio del producto y el método de envío.
  const fees = calcFees(product.priceInCents, shippingMethod); //Retorna fees.total que es el total que va a pagar el comprador: precio de producto y comisiones a cargo del comprador (envío, plataforma y stripe).

  //Si se trata de la primera venta del artesano, no se cobra la insuranceFee
  if (!product.artisan.firstSaleCompleted) {
    fees.insuranceFee = 0;
  }

  //Se obtienen el total de las comisiones de la plataforma que va a retener (envío, seguro de la plataforma y transacción de Stripe).
  //La artesana va a recibir fees.total - applicationFee
  let applicationFee = fees.shippingCost + fees.insuranceFee + fees.stripeFee;
  let penaltyCollected = 0; // valor por defecto si no hay penalización

  //Si la artesana tiene penalización pendiente se suma al total de las comisiones de la plataforma.
  if (product.artisan.pendingPenaltyInCents > 0) {
    const baseFee = applicationFee; //Comisiones sin la penalización
    applicationFee += product.artisan.pendingPenaltyInCents; //Comisiones a cobrar con la penalización
    if (applicationFee > fees.total) {
      applicationFee = fees.total; // Las comisiones no pueden superar lo que paga el comprador
    }
    penaltyCollected = applicationFee - baseFee; // lo que realmente cobraremos
  }

  //Se crea la sesión de pago en Stripe y se devuelve la URL para redirigir a la compradora.
  const baseUrl = getBaseUrl();
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
    success_url: `${baseUrl}/checkout/success`, //Dirección de pago realizado
    cancel_url: `${baseUrl}/checkout?productId=${product.id}`, //Dirección de pago cancelado.
    metadata: {
      //Datos de la transacción: producto, artesano, método de envío, precio del producto, comisiones desglosadas.
      productId: product.id,
      buyerId: session.user.id,
      shippingMethod,
      priceInCents: String(product.priceInCents),
      platformFeeInCents: String(applicationFee),
      stripeFeeInCents: String(fees.stripeFee),
      totalInCents: String(fees.total),
      firstSaleFeeWaived: String(!product.artisan.firstSaleCompleted), //!false = true
      penaltyApplied: String(penaltyCollected),
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
