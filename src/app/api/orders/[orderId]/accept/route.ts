//Endpoint de API para que la artesana acepte un pedido nuevo dentro del plazo de 24 horas.

import { NextResponse } from "next/server";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { ACCEPTANCE_WINDOW_MS } from "~/lib/order-constants";
import { sendOrderAcceptedEmail } from "~/lib/resend";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  //Comprobamos que el usuario esté autenticado y tenga el rol de artesana.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 },
    );
  }
  if (session.user.role !== "ARTISAN") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Esta función sólo está disponible para artesanas",
        },
      },
      { status: 403 },
    );
  }

  //Extraemos orderId de Params y comprobamos que existe el pedido y que pertenece a esta artesana.
  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: { id: orderId, artisanId: session.user.id, deletedAt: null },
  });
  if (!order) {
    return NextResponse.json(
      { error: { code: "ORDER_NOT_FOUND", message: "Pedido no encontrado" } },
      { status: 404 },
    );
  }

  //Solo se puede aceptar un pedido que esté recién confirmado (pago hecho, aún sin decisión de la artesana).
  if (order.status !== "CONFIRMED") {
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_ACCEPTABLE",
          message: "Este pedido no se puede aceptar",
        },
      },
      { status: 409 },
    );
  }

  //Comprobamos que no hayan pasado más de 24 horas desde la confirmación del pago.
  const windowExpired =
    Date.now() - order.createdAt.getTime() > ACCEPTANCE_WINDOW_MS;
  if (windowExpired) {
    return NextResponse.json(
      {
        error: {
          code: "ACCEPTANCE_WINDOW_CLOSED",
          message: "El plazo de 24h para aceptar el pedido ha expirado",
        },
      },
      { status: 409 },
    );
  }

  //Reclamamos el pedido de forma atómica: el "where" exige que siga en CONFIRMED en el momento
  //exacto de la escritura, para no pisar una decisión concurrente (p.ej. el cron cancelándolo
  //justo entre la comprobación de arriba y este punto). Si count es 0, ya lo procesó otra petición.
  const claimed = await db.order.updateMany({
    where: { id: orderId, status: "CONFIRMED" },
    data: { status: "IN_PREPARATION" },
  });
  if (claimed.count === 0) {
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_ACCEPTABLE",
          message: "Este pedido ya ha sido procesado",
        },
      },
      { status: 409 },
    );
  }

  //Se avisa a la compradora de que su pedido ha sido aceptado.
  void sendOrderAcceptedEmail(order).catch(console.error);

  return NextResponse.json({ data: { accepted: true } });
}
