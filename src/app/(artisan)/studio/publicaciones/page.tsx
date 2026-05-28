import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import PublicacionesView from "./PublicacionesView";

export const metadata: Metadata = { title: "Publicaciones — Artelier" };

export default async function PublicacionesPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const posts = await db.processUpdate.findMany({
    where: { artisanId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="bg-[--bg]">
      <div className="space-y-6 px-4 py-8">
        <h1 className="font-display text-xl font-bold text-[--text]">Mis novedades</h1>
        <PublicacionesView posts={posts} />
      </div>
    </main>
  );
}
