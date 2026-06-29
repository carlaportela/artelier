//Endpoint de API de cancelación de pedido

import { NextResponse } from "next/server"; //Para enviar respuestas HTTP desde el servidor al cliente (por ejemplo, errores).
import { getServerSession } from "~/server/auth/session"; //Para comprobar si el usuarrio está autenticado.
import { db } from "~/server/db"; //Para realizar las consultas a la base de datos.
import { stripe } from "~/lib/stripe"; //Para realizar el pago y comprobar si esta configurada la cuenta de Stripe de la artesana.
import { CANCELLATION_WINDOW_MS } from "~/lib/order-constants"; //Constante de tiempo de ventana de cancelación de 24 horas para el comprador.
import { sendCancellationEmail } from "~/lib/resend"; //Función de envío de correo de cancelación de pedido.

//Función principal de cancelación de pedido por el comprador
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  //Se comprueba que el usuario esté autenticado y que su rol sea comprador.
  const session = await getServerSession();
  //const {user} = await getServerssion() ?? {};
  //if(!user) { 401 }
  //if(user.role !== "BUYER") { 403 }

  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 },
    );
  }

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

  //Extraemos orderId de Params. En el servidor los parámetros de URL se sacan del argumento params que de la función y no de searchParams().
  const { orderId } = await params;
  /*Destructuring - extraemos la propiedad orderId de un objeto. Equivale a:
    const resolvedParams = await params;
    const orderId = resolvedParams.orderId; 
  */

  //Buscamos el pedido en la base de datos verificando que comprador del pedido sea el usuario que autenticado de la sesión.
  const order = await db.order.findFirst({
    where: { id: orderId, buyerId: session.user.id, deletedAt: null },
  });

  //Si no existe el pedido, mandamos el correspondiente mensaje de error al servidor.
  if (order === null) {
    return NextResponse.json(
      { error: { code: "ORDER_NOT_FOUND", message: "Pedido no encontrado" } },
      { status: 404 },
    );
  }

  //Verificamos que el pedido esté confirmado
  if (order.status !== "CONFIRMED") {
    return NextResponse.json(
      {
        error: {
          code: "CANCELLATION_NOT_ALLOWED",
          message: "Este pedido no se puede cancelar",
        },
      },
      { status: 409 },
    );
  }

  //Se verifica que no hayan pasado más de 24 horas desde la creación del pedido (ventana de tiempo permitida para cancelación del pedido por el usuario).
  const windowExpired =
    Date.now() - order.createdAt.getTime() > CANCELLATION_WINDOW_MS;
  if (windowExpired) {
    return NextResponse.json(
      {
        error: {
          code: "CANCELLATION_WINDOW_CLOSED",
          message: "El plazo de cancelación de 24h ha expirado",
        },
      },
      { status: 409 },
    );
  }

  //Obtenemos la justificación del body de la petición
  const body = (await req.json()) as Record<string, unknown>;
  const reason = (typeof body.reason === "string" ? body.reason : "").trim();
  if (reason.length < 10) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REASON",
          message: "El motivo debe tener al menos 10 caracteres",
        },
      },
      { status: 422 },
    );
  }

  //Procedemos al reembolso de Stripe
  if (!stripe) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Servicio de pagos no disponible",
        },
      },
      { status: 503 },
    );
  }
  await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });

  //Cancelamos el pedido y reactivamos el producto. Ambas van en una transacción para que sean atómicas (todo o nada).
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancellationReason: reason },
    }),
    db.product.update({
      where: { id: order.productId },
      data: { status: "ACTIVE" },
    }),
  ]);

  //Se envía el correo de cancelación de pedido con control de errores
  void sendCancellationEmail(order).catch(console.error);

  //Se informa al servidor de que el pedido ha sido cancelado.
  return NextResponse.json({ data: { cancelled: true } });
}
