//webhook endpoint o mecanismo de push-based event notificaction por el cual un servidor externo (Stripe) notifica a la aplicación sobre eventos específicos (pago completado) mediante solicitud HTTP POST.

import { env } from "~/env";
import { NextResponse } from "next/server";
import { stripe } from "~/lib/stripe";

export async function POST(req: Request) {
  //Obtiene el secret del webhook de Stripe en env.
  const secret = env.STRIPE_WEBHOOK_SECRET;

  //Lee el raw body
  const body = await req.text();

  //Obtiene la firma de la cabecera
  const signature = req.headers.get("stripe-signature");

  //Se comprueba que existan todas las variables necesarias
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
            object: { ... }        // datos del pago
        }
    }   
  */

  //Se extrae el tipo de evento y solo se procesan los tipos "payment_intent.succeded" o pago completado
  if (event.type === "payment_intent.succeeded") {
    // Aquí irá el código de procesar el pago (T2, T3, T4, T5)
    console.log("Pago completado:", event.id);
  }
  //Se devuelve 200 OK a Stripe (Para confirmar que se recibe el evento).
  return NextResponse.json(
    {received : true},
    { status : 200}
  );
}
