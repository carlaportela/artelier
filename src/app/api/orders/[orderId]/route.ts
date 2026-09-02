//Endpoint de API para consultar el estado de un pedido y su historial — usado por el polling de la compradora (y también accesible a la artesana).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { orderStatusLimiter } from "~/lib/ratelimit";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  //Se comprueba que usuario esté autenticado.
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  //Se limita la cantidad de peticiones para evitar abuso del endpoint de polling.
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await orderStatusLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" } },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  //El pedido solo es visible para su compradora o su artesana.
  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      deletedAt: null,
      //Si al menos una de las condiciones es cierta (o se trata de una compradora o de una artesana.)
      OR: [{ buyerId: session.user.id }, { artisanId: session.user.id }],
    },
    //Solo traemos lo que realmente se usa más abajo — mismo patrón que getParticipantOrError en
    //messages/[conversationId]/route.ts para este mismo tipo de comprobación en una ruta de polling.
    select: { status: true, trackingNumber: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  //Se comprueba que exista el parametro "since" y que sea una fecha válida para filtrar las actualizaciones de estado del pedido.
  //Si no hay since, se devuelve todo el historial de actualizaciones de estado del pedido.
  const sinceRaw = req.nextUrl.searchParams.get("since");
  const sinceDate = sinceRaw ? new Date(sinceRaw) : null;
  if (sinceDate && Number.isNaN(sinceDate.getTime())) {
    return NextResponse.json({ error: "Parámetro since inválido" }, { status: 400 });
  }

  //Si hay since válido, se filtran las actualizaciones de estado del pedido para devolver solo aquellas que sean posteriores a la fecha indicada.
  const statusUpdates = await db.orderStatusUpdate.findMany({
    where: { orderId, ...(sinceDate && { createdAt: { gt: sinceDate } }) }, //Siempre que createdAt sea greater than (mayor que) la fecha de sinceDate.
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    data: { status: order.status, trackingNumber: order.trackingNumber, statusUpdates },
  });
}
