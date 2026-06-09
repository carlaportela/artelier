//Endpoint de conversaciones entre compradoras y artesanas. Aquí se pueden crear nuevas conversaciones o listar las existentes del usuario actual.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

//Función POST de findOrCreate conversación entre compradora y artesana (para evitar duplicados). Si ya existe una conversación entre ambos, se devuelve esa conversación. Si no existe, se crea una nueva y se devuelve.
export async function POST(req: NextRequest) {

  //Se comprueba que el usuario esté autenticado, sino se reetorna un error.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Se obtiene el id del susuario autenticado.
  const userId = session.user.id;

  //Se obtiene el id de la artesana con la que se quiere iniciar la conversación; si no existe, se devuelve el error.
  const body = (await req.json()) as { artisanId?: unknown };
  if (!body.artisanId || typeof body.artisanId !== "string") {
    return NextResponse.json({ error: "artisanId required" }, { status: 400 });
  }

  //Se crea o se encuentra la conversación entre el usuario autenticado y la artesana indicada, y se devuelve el id de la conversación. Si ya existe una conversación entre ambos, se devuelve esa conversación. Si no existe, se crea una nueva y se devuelve.
  const { artisanId } = body;

  const conversation = await db.conversation.upsert({
    where: { buyerId_artisanId: { buyerId: userId, artisanId } },
    create: { buyerId: userId, artisanId },
    update: {},
    select: { id: true },
  });

  //Se devuelve el id de la conversación creada o encontrada.
  return NextResponse.json({ data: { conversationId: conversation.id } });
}

//Función GET que lista conversaciones del usuario actual
export async function GET() {

  //Se comprueba que el usuario esté autenticado, sino se retorna error.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  //Se obtienen las conversaciones del usuario autenticado, incluyendo información de la otra parte, el último mensaje y el conteo de mensajes no leidos. Se ordenan por fecha descendente.
  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { artisanId: userId }],
      deletedAt: null,
    },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      artisan: { select: { id: true, name: true, image: true } },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { senderId: { not: userId }, readAt: null, deletedAt: null },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  //Se devuelve la lista de conversaciones, la información de la otra parte, el último mensaje y el conteo de mensajes no leidos.
  return NextResponse.json({
    data: conversations.map((conv) => ({
      id: conv.id,
      otherUser: conv.buyerId === userId ? conv.artisan : conv.buyer,
      lastMessage: conv.messages[0] ?? null,
      unreadCount: conv._count.messages,
    })),
  });
}
