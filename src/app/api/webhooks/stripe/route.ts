//webhook endpoint o mecanismo de push-based event notificaction por el cual un servidor externo (Stripe) notifica a la aplicación sobre eventos específicos (pago completado) mediante solicitud HTTP POST.

import { env } from "~/env";
import { NextResponse } from "next/server";
import { stripe } from "~/lib/stripe";
import { db } from "~/server/db";
import { type ShippingMethod } from "~/lib/fees";
import { sendOrderConfirmation, sendNewSale } from "~/lib/resend";

// TODO H6.1: Uncomment when Sentry is installed
// import * as Sentry from "@sentry/nextjs";

// Helper function for Sentry integration (H6.1: will use actual Sentry when installed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function captureException(error: any, context?: Record<string, unknown>) {
  console.error("Sentry capture:", { error, context });
  // TODO H6.1: Replace with actual Sentry.captureException(error, { contexts: { webhook: context } })
}

export async function POST(req: Request) {
  try {
    //Obtiene el secret del webhook de Stripe en env.
    const secret = env.STRIPE_WEBHOOK_SECRET;

    //Lee el raw body
    const body = await req.text();

    //Obtiene la firma de la cabecera
    const signature = req.headers.get("stripe-signature");

    //Se comprueba que existan todas las variables necesarias sino se manda los correspondientes mensajes y códgios de error a Stripe.
    if (!secret || !stripe) {
      return NextResponse.json(
        { error: "Servicio no disponible" },
        { status: 503 },
      );
    }
    if (signature === null) {
      return NextResponse.json(
        { error: "No existe la firma de Stripe" },
        { status: 400 },
      );
    }

    //Se define una variable que contendrá los datos de pago y se comprueba si la firma es válida
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch {
      // Si la firma es inválida → error
      return NextResponse.json(
        { error: "Firma de Stripe inválida" },
        { status: 400 },
      );
    }

    // Si llegamos aquí, la firma es válida ✅
    /* event contiene los datos del pago en el siguiente formato:
            {
                id: "evt_...",           // stripeEventId
                type: "payment_intent.succeeded",  // tipo de evento
                data: {
                    object: {   // datos del pago
                        id: "pi_abcdef",                  // ← stripePaymentIntentId
                        metadata: {                       // ← Datos que NOSOTROS guardamos en H5.2
                            productId: "prod_123",
                            buyerId: "user_456",
                            shippingMethod: "PLATFORM",
                            priceInCents: "5000",
                            platformFeeInCents: "490",
                            stripeFeeInCents: "100",
                            totalInCents: "5590"
                        }
                    }        
                }
            }   
        */

    //Se extrae el tipo de evento y solo se procesan los tipos "payment_intent.succeded" o pago completado
    if (event.type === "payment_intent.succeeded") {
      console.log("Pago completado:", event.id); //Se usa console.log para debugging.

      //Se extraen los datos del evento
      const stripeEventId = event.id;
      const paymentIntentId = event.data.object.id;

      //T2.1: Validar que metadata existe y es objeto válido
      const metadata = event.data.object.metadata;
      if (!metadata || typeof metadata !== "object") {
        return NextResponse.json(
          { error: "Metadata missing or invalid" },
          { status: 400 },
        );
      }

      //Se comprueba que los campos de metadata necesarios existen
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (
        !metadata.buyerId ||
        !metadata.productId ||
        !metadata.priceInCents ||
        !metadata.platformFeeInCents ||
        !metadata.stripeFeeInCents ||
        !metadata.totalInCents ||
        !metadata.shippingMethod
      ) {
        return NextResponse.json(
          { error: "Metadata missing required fields" },
          { status: 400 },
        );
      }

      //Se extraen los datos de metadata (mediante parseInt convertimos string en número entero)
      const productId = metadata.productId;
      const buyerId = metadata.buyerId;
      const shippingMethod = metadata.shippingMethod;

      //PATCH 10: Validar que parseInt no devuelve NaN
      const priceInCents = parseInt(metadata.priceInCents, 10);
      const platformFeeInCents = parseInt(metadata.platformFeeInCents, 10);
      const stripeFeeInCents = parseInt(metadata.stripeFeeInCents, 10);
      const totalInCents = parseInt(metadata.totalInCents, 10);

      if (
        isNaN(priceInCents) ||
        isNaN(platformFeeInCents) ||
        isNaN(stripeFeeInCents) ||
        isNaN(totalInCents)
      ) {
        return NextResponse.json(
          { error: "Invalid numeric values in metadata" },
          { status: 400 },
        );
      }

      //PATCH 5: Validar que shippingMethod es valor válido
      const validShippingMethods = [
        "PLATFORM",
        "ARTISAN_OWN",
        "PICKUP",
      ] as const;
      if (!validShippingMethods.includes(shippingMethod as never)) {
        return NextResponse.json(
          { error: "Invalid shipping method" },
          { status: 400 },
        );
      }

      //Se comprueba que el producto existe, está active y no está borrado.
      const product = await db.product.findFirst({
        where: {
          id: productId,
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          id: true,
          type: true,
          status: true,
          artisanId: true,
          artisan: { select: { stripeAccountId: true } },
        },
      });

      //Si no existe el producto o no hay una cuenta de stripe configurada, mandamos respuesta a Stripe con error y código.
      if (
        product === null ||
        !product.artisan?.stripeAccountId
      ) {
        return NextResponse.json(
          { error: "Producto o artesano no disponible" },
          { status: 409 },
        );
      }

      //Se emplea transacción para que en caso de que se produzca algún error al realizar los pasos, todo se revierta.
      const order = await db.$transaction(async (tx) => {
        //PATCH 1: T2.2 - Idempotencia movida dentro de transacción para evitar race condition
        const existingOrder = await tx.order.findFirst({
          where: { stripeEventId },
        });

        if (existingOrder) {
          return existingOrder;
        }

        //PATCH 3: Validar que Product sigue activo dentro de transacción
        const activeProduct = await tx.product.findFirst({
          where: {
            id: productId,
            status: "ACTIVE",
            deletedAt: null,
          },
          select: {
            id: true,
            type: true,
            artisanId: true,
          },
        });

        if (!activeProduct) {
          throw new Error("PRODUCT_NO_LONGER_ACTIVE");
        }

        //1. Se crea el pedido
        const orderCreated = await tx.order.create({
          data: {
            buyerId,
            artisanId: activeProduct.artisanId,
            productId,
            status: "CONFIRMED",
            shippingMethod: shippingMethod as ShippingMethod,
            priceInCents,
            platformFeeInCents,
            stripeFeeInCents,
            totalInCents,
            stripePaymentIntentId: paymentIntentId,
            stripeEventId,
          },
        });

        //2. Se actualiza el estado del producto a vendido, si el producto no es perecedero (Se gestionan en H5.4)
        if (activeProduct.type !== "PERISHABLE") {
          await tx.product.update({
            where: { id: productId },
            data: { status: "SOLD" },
          });
        }

        //3. Se marca primera venta como completada
        //PATCH 2: Buscar ACCEPTED en lugar de CONFIRMED (primera venta COMPLETADA, no solo creada)
        const previousOrders = await tx.order.findFirst({
          where: {
            artisanId: activeProduct.artisanId,
            status: "ACCEPTED",
            NOT: { id: orderCreated.id },
          },
        });

        if (!previousOrders) {
          await tx.user.update({
            where: { id: activeProduct.artisanId },
            data: { firstSaleCompleted: true },
          });
        }

        return orderCreated;
      });

      //Se notifica al comprador y al artesano de la venta completada.
      // T4: Enviar emails (fire-and-forget, no rompen el webhook si fallan)
      try {
        await sendOrderConfirmation(order);
        await sendNewSale(order);
      } catch (error) {
        console.error(
          "Error enviando emails de notificación de venta completada:",
          error,
        );
        captureException(error, {
          orderId: order.id,
          buyerId: order.buyerId,
          artisanId: order.artisanId,
        });
      }

      // Devolver 200 OK a Stripe igual (el webhook se procesó)
      return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Error en webhook de Stripe:", error);

    /* En producción: captureException(error); Integración de Sentry en H6.
    En producción (Vercel) los errores no son visibles en consola sino en un servidor remoto que no se ve, por que se necesita Sentry para capturar errores y alertar automáticamente.
    Sentry es un servicio de monitoreo de errores en tiempo real
    Ejemplo en código:

        import * as Sentry from "@sentry/nextjs";

        try {
        // código
        } catch (error) {
        Sentry.captureException(error);  // ← Sentry lo registra
        return NextResponse.json({ error: "..." }, { status: 500 });

    } */

    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
