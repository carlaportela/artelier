import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { messageLimiter } from "~/lib/ratelimit";

type Params = { params: Promise<{ conversationId: string }> };

//Función validar que existan ambos participantes (artesana y comprador) en una conversación activa. Si no existe la conversación o alguno de los dos participantes devuelve null, sino devuelve el id de los participantes. Se usa en la función de polling
async function getParticipantOrError(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId, deletedAt: null },
    select: { buyerId: true, artisanId: true },
  });
  if (!conversation || (conversation.buyerId !== userId && conversation.artisanId !== userId)) {
    return null;
  }
  return conversation;
}

//Función GET de polling de mensajes. Si se pasa el query param ?since, devuelve los mensajes nuevos desde ese timestamp. Si no se pasa, devuelve los últimos 30 mensajes para la carga inicial del cliente.
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  //Se limita la cantidad de peticiones para evitar abuso del endpoint de polling.
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await messageLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" } },
      { status: 429, headers: { "Retry-After": "60" } },
    );  
  }

  const { conversationId } = await params;
  const conversation = await getParticipantOrError(conversationId, userId);
  if (!conversation) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const since = req.nextUrl.searchParams.get("since");

  //Si existe el parametro since se cargan mensajes nuevos desde ese timestamp (polling), sino, se cargan los últimos 30 mensajes (carga inicial de cliente)
  const messages = since
    ? await db.message.findMany({
        where: {
          conversationId,
          deletedAt: null,
          createdAt: { gt: new Date(since) },
        },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, image: true } } },
      })
    : (
        await db.message.findMany({
          where: { conversationId, deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { sender: { select: { id: true, name: true, image: true } } },
        })
      ).reverse();

  return NextResponse.json({ data: messages });
}

// POST /api/messages/[conversationId]
// Crea un mensaje y actualiza updatedAt de la conversación para mantener el orden de la lista
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await messageLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" } },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { conversationId } = await params;
  const conversation = await getParticipantOrError(conversationId, userId);
  if (!conversation) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { content?: unknown };
  if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }
  const content = body.content.trim();

  const [message] = await Promise.all([
    db.message.create({
      data: { conversationId, senderId: userId, content },
      include: { sender: { select: { id: true, name: true, image: true } } },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ data: message }, { status: 201 });
}
