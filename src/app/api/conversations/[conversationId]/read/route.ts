//Endpoint para marcar mensajes no leidos como leidos en una conversación específica. Solo el comprador o la artesana involucrados en la conversación pueden marcar los mensajes como leídos. Se actualizan todos los mensajes no leídos enviados por la otra parte en esa conversación, estableciendo la fecha de lectura.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

//Función PATCH (modifica parte de algo existente, en este caso readAt) para marcar mensajes no leidos como leidos.
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  //Se comprueba que el usuario esté autenticado, sino retorna error.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Se obtiene el id del usuario aitenticado.
  const userId = session.user.id;

  //Se obtiene el id de la conversación de los parámetros de la ruta. Si no existe, se devuelve error.
  const { conversationId } = await params;

  //Se realiza la consulta para verificar que la conversación existe. Si no existe el usuario comprador, ni el usuario artesano de esa conversación coincide con el usuario autenticado, se devuelve error.
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { buyerId: true, artisanId: true },
  });

  if (!conversation || (conversation.buyerId !== userId && conversation.artisanId !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  //Se actualizan los mensaje no leidos enviados por la otra parte de la conversación, estableciendo la fecha de lectura.
  const result = await db.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
      deletedAt: null,
    },
    data: { readAt: new Date() },
  });

  //Se devuelve el número de mensajes que se han marcado como leidos.
  return NextResponse.json({ data: { updated: result.count } });
}
