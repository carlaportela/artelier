//Esta página es para que la artesana pueda editar su perfil público (nombre, localidad, biografía, foto de perfil y portada)

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next"; //Para definir el título de la página en el navegador.

import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";
import ProfilePageClient from "./ProfilePageClient"; // Gestiona editor de perfil + botones de cuenta en una sola fila

//Metadata para definir el título de la página
export const metadata: Metadata = { title: "Mi perfil — Artelier" };

//Función principal de la página de perfil de estudio, que muestra el editor de perfil y las opciones de configuración.
export default async function StudioProfilePage() {
  const session = await requireArtisanSession();

  const [user, sealRequests, followersCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        bio: true,
        locality: true,
        image: true,
        bannerImage: true,
        email: true,
      },
    }),
    db.sealRequest.findMany({
      where: { artisanId: session.user.id, status: "APPROVED", productId: null, deletedAt: null },
      include: { seal: { select: { name: true, type: true } } },
    }),
    db.follow.count({ where: { followingId: session.user.id } }),
  ]);

  if (!user) redirect("/login");

  return (
    <main className="bg-[--bg]">
      {/* ── Título de sección ── */}
      <div className="flex items-center justify-between px-4 pt-8 pb-4">
        <h1 className="font-display text-xl font-bold text-[--text]">Mi perfil</h1>
        <Link
          href={`/artisan/${user.id}`}
          className="cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-1.5 text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#ccc8bc]/40"
        >
          Ver tu perfil público
        </Link>
      </div>

      {/* ── Seguidoras ── */}
      <div className="px-4 pb-4">
        <Link
          href="/studio/followers"
          className="text-sm font-medium text-[#3d5a4f] transition-colors hover:text-[#4a6b5e]"
        >
          {followersCount} {followersCount === 1 ? "seguidora" : "seguidoras"} →
        </Link>
      </div>

      {/* ── Editor de perfil + botones de cuenta ── */}
      <ProfilePageClient user={user} sealRequests={sealRequests} />
    </main>
  );
}
