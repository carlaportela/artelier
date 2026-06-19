//webhook endpoint o mecanismo de push-based event notificaction por el cual un servidor externo (Stripe) notifica a la aplicación sobre eventos específicos (pago completado) mediante solicitud HTTP POST.

import { env } from "~/env";
import { NextResponse } from "next/server";
import { stripe } from "~/lib/stripe";
import { db } from "~/server/db";

export async function POST(req: Request) {
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
  } catch (error) {
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

    //Se extraen los datos del evento (pago completado) e idempotencia (cuando se recibe un evento de pago completado, se comprueba si el id del evento existe previamente; si existe no se hace nada y si es un nuevo evento se crea un nuevo pedidos) para evitar pedidos duplicados procedentes del mismo evento.
    const stripeEventId = event.id;
    const paymentIntentId = event.data.object.id;
    const metadata = (event.data.object.metadata ?? {}) as Record<string,string>; //Ponemos un type assertion para indicar que metadata se trata de un objeto (Record) con clave string y valor string. Si el objeto es undefined usa el objeto vacio

    const existingOrder = await db.order.findFirst({
      where: { stripeEventId },
    });

    /* En JavaScript/TypeScript, cuando la clave del objeto es igual al nombre de la variable, puedes usar la sintaxis corta:
        // Versión larga
        { stripeEventId: stripeEventId }

        // Versión corta (equivalente)
        { stripeEventId }
        Se llama property shorthand. */

    if (existingOrder) {
      //Se devuelve 200 OK a Stripe (Para confirmar que se recibe el evento).
      return NextResponse.json({ received: true }, { status: 200 });
    }

    //Se comprueba que los datos de matadata son válidos.
    // Validar que metadata existe
    if (
      metadata === null ||
      !metadata.priceInCents ||
      !metadata.platformFeeInCents ||
      !metadata.stripeFeeInCents ||
      !metadata.totalInCents
    ) {
      return NextResponse.json({ error: "Metadata inválida" }, { status: 400 });
    }

    //Se extraen los datos de metadata (mediante parseInt convertimos string en número entero)
    const productId = metadata.productId;
    const buyerId = metadata.buyerId;
    const shippingMethod = metadata.shippingMethod;
    const priceInCents = parseInt(metadata.priceInCents, 10);
    const platformFeeInCents = parseInt(metadata.platformFeeInCents, 10);
    const stripeFeeInCents = parseInt(metadata.stripeFeeInCents, 10);
    const totalInCents = parseInt(metadata.totalInCents, 10);

    //Comprobamos que el producto existe, está active y no está borrado.
    const product = await db.product.findFirst({
        where: {
            id : productId, 
            status :"ACTIVE",
            deletedAt : null
        },
        select: {
            id:true,
            status: true,
            artisanId: true,
            artisan: { select: {stripeAccountId: true}
            },

        }
    });
    if(product === null || product.artisan.stripeAccountId === null){
        return NextResponse.json({ error: "Producto o artesano no disponible"}, {status: 409},);
    }

    
  }
}
