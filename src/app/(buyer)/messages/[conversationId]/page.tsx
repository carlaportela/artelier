//Página de conversación individual, donde el comprador puede ver el historial de mensajes con una artesana específica y enviar nuevos mensajes.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "~/server/auth/session";
import { getConversationWithMessages } from "~/server/queries/conversations";
import PaletteAvatar from "~/components/PaletteAvatar";
import ConversationReadMarker from "~/components/ConversationReadMarker";
import MessageArea from "~/components/MessageArea";
import BackButton from "~/components/BackButton";

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

  //Se obtiene la conversación y los últimos 30 mensajes en paralelo.
  const { conversation, initialMessages } = await getConversationWithMessages(conversationId);

  if (
    !conversation ||
    (conversation.buyerId !== userId && conversation.artisanId !== userId)
  ) {
    notFound();
  }

  //Se determina cuál es el otro usuario de la conversación para mostrar su información en el encabezado.
  const otherUser =
    conversation.buyerId === userId ? conversation.artisan : conversation.buyer;

  const currentUser =
    conversation.buyerId === userId ? conversation.buyer : conversation.artisan;

  //Se determina el enlace al perfil del otro usuario (solo si se trata de un artesano) para mostrarlo en el encabezado.
  const otherProfileHref =
    conversation.artisanId !== userId
      ? `/artisan/${otherUser.id}`
      : undefined;

  return (
    <main className="fixed inset-x-0 bottom-0 top-14 flex flex-col bg-[--bg]">
      <div className="mx-auto flex h-full w-full min-h-0 max-w-lg flex-col md:max-w-2xl lg:max-w-4xl">
      <ConversationReadMarker conversationId={conversationId} />

      {/* Encabezado: en móvil fila simple a la izquierda; en md+ tres columnas con el perfil centrado */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[--border] bg-[--bg] px-4 py-3">
        <div className="md:flex-1">
          <BackButton href="/messages" label="Volver a mensajes" />
        </div>
        <div className="flex md:flex-1 md:justify-center">
          {otherProfileHref ? (
            <Link href={otherProfileHref} className="flex items-center gap-2">
              <PaletteAvatar src={otherUser.image} name={otherUser.name} className="h-9 w-9 shrink-0" fillColor="#4a9e8c" />
              <span className="font-display mt-1 text-lg font-bold leading-none text-[--text]">{otherUser.name ?? "Artesana"}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <PaletteAvatar src={otherUser.image} name={otherUser.name} className="h-9 w-9 shrink-0" fillColor="#c4956a" />
              <span className="font-display mt-1 text-lg font-bold leading-none text-[--text]">{otherUser.name ?? "Compradora"}</span>
            </div>
          )}
        </div>
        <div className="hidden md:block md:flex-1" />
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
