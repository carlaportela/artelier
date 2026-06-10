//Página de conversación individual para la artesana en su studio.

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import PaletteAvatar from "~/components/PaletteAvatar";
import ConversationReadMarker from "~/components/ConversationReadMarker";
import MessageArea from "~/components/MessageArea";

type Props = { params: Promise<{ conversationId: string }> };

export default async function MensajeConversacionPage({ params }: Props) {
  const { conversationId } = await params;

  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const userId = session.user.id;

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId, deletedAt: null },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      artisan: { select: { id: true, name: true, image: true } },
    },
  });

  if (conversation?.artisanId !== userId) {
    notFound();
  }

  const otherUser = conversation.buyer;
  const currentUser = conversation.artisan;

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
    <main className="flex min-h-screen flex-col bg-[--bg]">
      <ConversationReadMarker conversationId={conversationId} />

      {/* Encabezado */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[--border] bg-[--bg] px-4 py-3">
        <Link href="/studio/mensajes" className="text-[--text-muted] transition-colors hover:text-[--text]">
          <ChevronLeft size={22} />
        </Link>
        <div className="flex items-center gap-2">
          <PaletteAvatar
            src={otherUser.image}
            name={otherUser.name}
            className="h-9 w-9 shrink-0"
            fillColor="#c4956a"
          />
          <span className="font-medium text-[--text]">{otherUser.name ?? "Compradora"}</span>
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
