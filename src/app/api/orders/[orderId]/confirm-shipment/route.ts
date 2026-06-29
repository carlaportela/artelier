//Endpoint de la API para marcar como enviado un pedido por la artesana

import { getServerSession } from "~/server/auth/session";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendShipmentConfirmedEmail } from "~/lib/resend";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  //Comprobamos que el usuario esté autenticado y tenga el rol de artesana
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 },
    );
  }

  if (session?.user.role !== "ARTISAN") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Esta función sólo está disponible para artesanos",
        },
      },
      { status: 403 },
    );
  }

  //Extraemos orderId de Params y comprobamos que existe al pedido correspondiente al artesano autenticado.
  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: { id: orderId, artisanId: session?.user.id, deletedAt: null },
  });
  if (!order) {
    return NextResponse.json(
      { error: { code: "ORDER_NOT_FOUND", message: "Pedido no encontrado" } },
      { status: 404 },
    );
  }
  if (!["CONFIRMED", "IN_PREPARATION", "READY"].includes(order.status)){
    return NextResponse.json(
      {
        error: {
          code: "ORDER_NOT_CONFIRMABLE",
          message: "El pedido aún no ha sido confirmado, no se ha preparado o no está listo",
        },
      },
      { status: 409 },
    );
  }

  //Confirmamos el envío del pedido dependiendo del tipo de envío.
  if (
    order.shippingMethod === "PLATFORM" ||
    order.shippingMethod === "ARTISAN_OWN"
  ) {
    //El número de seguimiento del envío lo leemos del cuerpo de la petición
    const body = (await req.json()) as Record<string, unknown>;
    const trackingNumber = (typeof body.trackingNumber === "string" ? body.trackingNumber : "").trim();

    //Si no existe número de seguimiento lanzamos el error correspondiente.
    if (!trackingNumber) {
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
    await db.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED", trackingNumber: trackingNumber },
    });
  }
  if (order.shippingMethod === "PICKUP") {
    await db.order.update({
      where: { id: orderId },
      data: { status: "READY" },
    });
  }

  //Se envía el correo de confirmación de envío al comprador
  void sendShipmentConfirmedEmail(order).catch(console.error);

  return NextResponse.json({ data: { confirmed: true } });
}
