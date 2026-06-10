//Página de mensajes del estudio de la artesana — lista de conversaciones con compradoras.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import PaletteAvatar from "~/components/PaletteAvatar";

export const metadata: Metadata = { title: "Mensajes — Artelier" };

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return minutes <= 1 ? "ahora" : `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "ayer" : `hace ${days} días`;
}

export default async function MensajesPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const userId = session.user.id;

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

  const convList = conversations.map((conv) => ({
    id: conv.id,
    otherUser: conv.buyerId === userId ? conv.artisan : conv.buyer,
    lastMessage: conv.messages[0] ?? null,
    unreadCount: conv._count.messages,
  }));

  return (
    <main className="min-h-screen bg-[--bg]">
      <div className="px-4 py-6">
        <h1 className="mb-6 font-display text-xl font-bold text-[--text]">Mensajes</h1>

        {convList.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3d5a4f]/10">
              <MessageCircle size={24} className="text-[#3d5a4f]" />
            </div>
            <p className="text-sm text-[--text-muted]">
              Tus conversaciones con compradoras aparecerán aquí
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {convList.map((conv) => (
              <li key={conv.id}>
                <Link
                  href={`/studio/mensajes/${conv.id}`}
                  className="-mx-4 flex items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-black/5"
                >
                  <PaletteAvatar
                    src={conv.otherUser.image}
                    name={conv.otherUser.name}
                    className="h-11 w-11 shrink-0"
                    fillColor="#c4956a"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display truncate text-base font-bold text-[--text]">
                        {conv.otherUser.name ?? "Compradora"}
                      </span>
                      {conv.lastMessage && (
                        <span className="shrink-0 text-xs text-[--text-muted]">
                          {timeAgo(new Date(conv.lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 flex-1 text-xs text-[--text-muted]">
                        {conv.lastMessage?.content ?? "Sin mensajes aún"}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#3d5a4f]" />
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
