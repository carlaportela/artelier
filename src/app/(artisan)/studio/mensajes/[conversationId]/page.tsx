//Página de conversación individual para la artesana en su studio.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requireArtisanSession } from "~/server/auth/guards";
import { getConversationWithMessages } from "~/server/queries/conversations";
import PaletteAvatar from "~/components/PaletteAvatar";
import ConversationReadMarker from "~/components/ConversationReadMarker";
import MessageArea from "~/components/MessageArea";

type Props = { params: Promise<{ conversationId: string }> };

export default async function MensajeConversacionPage({ params }: Props) {
  const { conversationId } = await params;

  const session = await requireArtisanSession();

  const userId = session.user.id;

  //Se obtiene la conversación y los últimos 30 mensajes en paralelo.
  const { conversation, initialMessages } = await getConversationWithMessages(conversationId);

  if (conversation?.artisanId !== userId) {
    notFound();
  }

  const otherUser = conversation.buyer;
  const currentUser = conversation.artisan;

  return (
    <main className="flex h-[calc(100vh-3.5rem-6rem)] flex-col bg-[--bg]">
      <ConversationReadMarker conversationId={conversationId} />

      {/* Encabezado */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[--border] bg-[--bg] px-4 py-3">
        <Link href="/studio/mensajes" className="inline-flex items-center justify-center rounded-full p-1 text-[--text-muted] transition-colors hover:bg-black/10 hover:text-[--text]">
          <ChevronLeft size={22} />
        </Link>
        <div className="flex items-center gap-2">
          <PaletteAvatar
            src={otherUser.image}
            name={otherUser.name}
            className="h-9 w-9 shrink-0"
            fillColor="#c4956a"
          />
          <span className="font-display ml-1 mt-1 text-lg font-bold leading-none text-[--text]">{otherUser.name ?? "Compradora"}</span>
        </div>
      </div>

      <MessageArea
        conversationId={conversationId}
        userId={userId}
        currentUser={currentUser}
        initialMessages={initialMessages}
      />
    </main>
  );
}
