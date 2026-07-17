//Endpoint para invocar a Vercel Cron Job y comprobar todos los días a las 3 de la mañana si la artesana
//ha dejado sin aceptar un pedido nuevo dentro del plazo de 24 horas (Historia 6.2).
//Está protegido con CRON_SECRET para evitar invocaciones no autorizadas.
//
// NOTA: el plazo real es de 24h, pero este cron corre una vez al día — en el plan Hobby de Vercel
// los crons con frecuencia subdiaria no se ejecutan realmente con esa frecuencia (mismo límite ya
// documentado en /api/cron/send-message-notifications). Consecuencia: en el peor caso, un pedido no
// aceptado puede tardar hasta ~48h en cancelarse automáticamente en vez de 24h. Decisión aceptada
// conscientemente (H6.2, 2026-07-15) — no bloquea el lanzamiento.

import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  ACCEPTANCE_WINDOW_MS,
  PENALTY_AMOUNT_CENTS,
} from "~/lib/order-constants";
import {
  sendOrderCancelledBySystemEmail,
  sendOrderCancelledBySystemToArtisanEmail,
} from "~/lib/resend";
import { stripe } from "~/lib/stripe";
import { canReactivateProduct } from "~/lib/orders";

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

  //La fecha límite es hace 24 horas desde ahora, en milisegundos.
  const deadline = new Date(Date.now() - ACCEPTANCE_WINDOW_MS);

  //Se obtienen los pedidos que la artesana no haya aceptado ni rechazado en 24h.
  const expiredOrders = await db.order.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { lte: deadline }, //Comparador de prisma "less than or equal"
      deletedAt: null,
    },
    include: {
      product: { select: { type: true, expiresAt: true } },
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
      //1. Reclamamos el pedido, reactivamos el producto (si procede) y aplicamos la penalización en
      //una única transacción atómica: el "where" del updateMany exige que el pedido siga en
      //CONFIRMED en el momento exacto de la escritura, para no pisar una aceptación/rechazo de la
      //artesana que haya ocurrido justo entre la consulta de arriba y este punto. Al ir las tres
      //escrituras juntas, nunca queda el pedido cancelado sin penalización/reactivación (o
      //viceversa) si alguna falla a medias.
      const claimedCount = await db.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: "CONFIRMED" },
          data: {
            status: "CANCELLED",
            cancellationReason:
              "El sistema ha cancelado tu pedido porque la artesana no lo aceptó dentro del plazo de 24 horas. Se ha iniciado el reembolso.",
          },
        });
        if (claimed.count === 0) {
          return 0;
        }
        if (canReactivateProduct(order.product)) {
          await tx.product.update({
            where: { id: order.productId },
            data: { status: "ACTIVE" },
          });
        }
        await tx.user.update({
          where: { id: order.artisanId },
          data: { pendingPenaltyInCents: { increment: PENALTY_AMOUNT_CENTS } }, //Se acumula a penalizaciones anteriores
        });
        return claimed.count;
      });
      if (claimedCount === 0) {
        continue;
      }

      //2. El pedido ya es nuestro (reclamado, reactivado y penalizado atómicamente) — se realiza el
      //reembolso de Stripe.
      if (stripe) {
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });
      }

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
