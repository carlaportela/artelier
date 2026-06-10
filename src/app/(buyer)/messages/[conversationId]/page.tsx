//Página de conversación individual, donde el comprador puede ver el historial de mensajes con una artesana específica y enviar nuevos mensajes.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import PaletteAvatar from "~/components/PaletteAvatar";
import ConversationReadMarker from "~/components/ConversationReadMarker";
import MessageArea from "~/components/MessageArea";

type Props = { params: Promise<{ conversationId: string }> };

//Función que representa la página de conversación individual.
export default async function ConversationPage({ params }: Props) {

  //Se obtiene el id de la conversación de los parámteros de la ruta.
  const { conversationId } = await params;

  //Se comprueba que el usuario esté autenticado sino se redirige a la página de login.
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  //Se obtiene el id del usuario autenticado.
  const userId = session.user.id;

  //Se obtiene la conversación con la información del otro usuario para el encabezado.
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId, deletedAt: null },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      artisan: { select: { id: true, name: true, image: true } },
    },
  });

  if (
    !conversation ||
    (conversation.buyerId !== userId && conversation.artisanId !== userId)
  ) {
    notFound();
  }

  //Se determina cuál es el otro usuario de la conversación para mostrar su información en el encabrzado.
  const otherUser =
    conversation.buyerId === userId ? conversation.artisan : conversation.buyer;

  const currentUser =
    conversation.buyerId === userId ? conversation.buyer : conversation.artisan;

  //Se determina el enlace al perfil del otro usuario (solo si se trata de un artesano) para mostrarlo en el encabezado.
  const otherProfileHref =
    conversation.artisanId !== userId
      ? `/artisan/${otherUser.id}`
      : undefined;

  //Últimos 30 mensajes en orden cronológico para la carga inicial.
  const initialMessages = (
    await db.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { sender: { select: { id: true, name: true, image: true } } },
    })
  ).reverse();

  return (
    <main className="flex h-[calc(100dvh-3.5rem)] flex-col bg-[--bg]">
      <div className="mx-auto flex h-full w-full min-h-0 max-w-lg flex-col md:max-w-2xl lg:max-w-4xl">
      <ConversationReadMarker conversationId={conversationId} />

      {/* Encabezado */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[--border] bg-[--bg] px-4 py-3">
        <Link href="/messages" className="inline-flex items-center justify-center rounded-full p-1 text-[--text-muted] transition-colors hover:bg-black/10 hover:text-[--text]">
          <ChevronLeft size={22} />
        </Link>
        {otherProfileHref ? (
          <Link href={otherProfileHref} className="flex items-center gap-2">
            <PaletteAvatar
              src={otherUser.image}
              name={otherUser.name}
              className="h-9 w-9 shrink-0"
              fillColor="#4a9e8c"
            />
            <span className="font-display ml-1 mt-1 text-lg font-bold leading-none text-[--text]">{otherUser.name ?? "Artesana"}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <PaletteAvatar
              src={otherUser.image}
              name={otherUser.name}
              className="h-9 w-9 shrink-0"
              fillColor="#c4956a"
            />
            <span className="font-display ml-1 mt-1 text-lg font-bold leading-none text-[--text]">{otherUser.name ?? "Compradora"}</span>
          </div>
        )}
      </div>

      <MessageArea
        conversationId={conversationId}
        userId={userId}
        currentUser={currentUser}
        initialMessages={initialMessages}
      />
      </div>
    </main>
  );
}
