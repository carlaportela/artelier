import { db } from "~/server/db";

export async function getConversationWithMessages(conversationId: string) {
  const [conversation, messages] = await Promise.all([
    db.conversation.findUnique({
      where: { id: conversationId, deletedAt: null },
      include: {
        buyer: { select: { id: true, name: true, image: true } },
        artisan: { select: { id: true, name: true, image: true } },
      },
    }),
    db.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { sender: { select: { id: true, name: true, image: true } } },
    }),
  ]);

  return { conversation, initialMessages: messages.reverse() };
}
