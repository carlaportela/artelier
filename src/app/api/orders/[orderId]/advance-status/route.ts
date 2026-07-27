//Endpoint de API para que la artesana avance el estado de un pedido (En preparación → Listo → Enviado).

import { NextResponse } from "next/server";
import type { OrderStatus } from "generated/prisma";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH } from "~/lib/order-constants";
import {
  sendOrderReadyForPickupEmail,
  sendOrderPreparedEmail,
  sendShipmentConfirmedEmail,
} from "~/lib/resend";

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

  //Calculamos el siguiente estado a partir del estado actual y el método de envío — el cliente
  //nunca decide el estado destino, así se evita que se salte pasos de la secuencia.
  let nextStatus: OrderStatus;
  if (order.status === "IN_PREPARATION") {
    nextStatus = "READY";
  } else if (order.status === "READY" && order.shippingMethod !== "PICKUP") {
    nextStatus = "SHIPPED";
  } else {
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_ADVANCEABLE",
          message: "Este pedido no se puede avanzar de estado",
        },
      },
      { status: 409 },
    );
  }

  //Obtenemos el mensaje personal opcional y el número de seguimiento (solo si aplica) del body.
  const body = (await req.json()) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length > ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_MESSAGE",
          message: `El mensaje no puede superar los ${ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH} caracteres`,
        },
      },
      { status: 422 },
    );
  }

  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (nextStatus === "SHIPPED" && !trackingNumber) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TRACKING_NUMBER",
          message: "Número de seguimiento no encontrado",
        },
      },
      { status: 422 },
    );
  }

  //Reclamamos el pedido y creamos la entrada del historial en una única transacción atómica: el
  //"where" exige que el pedido siga en el estado esperado en el momento exacto de la escritura,
  //para no pisar una actualización concurrente (mismo patrón que claimAndCancelOrder, Historia 6.2).
  const claimed = await db.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: {
        status: nextStatus,
        ...(trackingNumber && { trackingNumber }),
      },
    });
    if (result.count === 0) {
      return false;
    }
    await tx.orderStatusUpdate.create({
      data: { orderId, status: nextStatus, message: message || null },
    });
    return true;
  });
  if (!claimed) {
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_ADVANCEABLE",
          message: "Este pedido ya ha sido procesado",
        },
      },
      { status: 409 },
    );
  }

  //Se avisa a la compradora del avance de estado con el email correspondiente.
  if (nextStatus === "READY" && order.shippingMethod === "PICKUP") {
    void sendOrderReadyForPickupEmail(order).catch(console.error);
  } else if (nextStatus === "READY") {
    void sendOrderPreparedEmail(order).catch(console.error);
  } else if (nextStatus === "SHIPPED") {
    void sendShipmentConfirmedEmail(order).catch(console.error);
  }

  return NextResponse.json({ data: { status: nextStatus } });
}
