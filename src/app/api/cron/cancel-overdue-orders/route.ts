//Endpoint para invocar a Vercel Cron Job y comprobar todos los días a las 3 de la mañana si se ha sobrepasado el tiempo ventana de confirmación de pedido de 5 días.
//Está protegido con CRON_SECRET para evitar invocaciones no autorizadas.

import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  SHIPPING_DEADLINE_MS,
  PENALTY_AMOUNT_CENTS,
} from "~/lib/order-constants";
import {
  sendOrderCancelledBySystemEmail,
  sendOrderCancelledBySystemToArtisanEmail,
} from "~/lib/resend";
import { stripe } from "~/lib/stripe";

export const dynamic = "force-dynamic"; // nunca cachear este endpoint

export async function GET(req: Request) {
  //Se verifica CRON_SECRET: si no está configurado o el token no coincide, rechazar
  const expectedToken = env.CRON_SECRET;
  if (!expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //La fecha límite es hace 120 horas desde ahora, en milisegundos.
  const deadline = new Date(Date.now() - SHIPPING_DEADLINE_MS);

  //Se obtienen los pedidos que no hayan sido confirmados en 120 h.
  const expiredOrders = await db.order.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { lte: deadline }, //Comparador de prisma "less than or equal"
      deletedAt: null,
    },
  });

  //Si no hay pedidos expirados por confirmar, se envía la respuesta correspondiente al servidor
  if (expiredOrders.length === 0) {
    return NextResponse.json({ data: { cancelled: 0 } });
  }

  //Mediante un bucle iteramos cada pedido para realizar los cambios necesarios.
  let cancelledCount = 0; //Contador para iterar en cada pedido expirado cancelado.

  for (const order of expiredOrders) {
    try {
      //1. Se reliza el reembolso de Stripe
      if (stripe) {
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });
      }
      //2. Se realiza la transaccion en la base de datos para caneclación de pedido, reactivas producto y penalizar a la artesana
      await db.$transaction([
        db.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancellationReason:
              "El sistema ha cancelado tu pedido porque no se ha confirmado el envío en el plazo establecido. Se ha iniciado el reembolso.",
          },
        }),
        db.product.update({
          where: { id: order.productId },
          data: { status: "ACTIVE" },
        }),
        db.user.update({
          where: { id: order.artisanId },
          data: { pendingPenaltyInCents: { increment: PENALTY_AMOUNT_CENTS } }, //Se acumula a penalizaciones anteriores
        }),
      ]);

      cancelledCount++; //Se aumenta el contador para continuar con la iteración de pedidos a cancelar.

      //3. Se envía el correo de cancelación de pedido a la compradora y a la artesana (con la penalización).
      void sendOrderCancelledBySystemEmail(order).catch(console.error);
      void sendOrderCancelledBySystemToArtisanEmail(order).catch(console.error);
    } catch (error) {
      //Se muestran los errores en consola.
      console.error(`Error procesando el pedido ${order.id}`, error);
      //Continua la iteración aunque una cancelación falle
    }
  }

  //Se envía la correspondiente respuesta al servidor sobre los pedidos cancelados por el sistema
  return NextResponse.json({ data: { cancelled: cancelledCount } });
}
