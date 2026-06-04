//Página pública del artesano, acceso para compradores y para el propio artesano desde "Mi perfil público"

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { db } from "~/server/db";
import { getServerSession } from "~/server/auth/session";
import ArtisanHeader from "~/components/artisan/ArtisanHeader";
import ArtisanProfileTabs from "~/components/artisan/ArtisanProfileTabs";
import BackButton from "~/components/BackButton";

type Props = { params: Promise<{ id: string }> };

//Función para generar metadata dinámicamente según el artesano, útil para SEO y compartir en redes sociales.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const artisan = await db.user.findUnique({
    where: { id, role: "ARTISAN", deletedAt: null, suspended: false },
    select: { name: true, bio: true, image: true },
  });

  if (!artisan) return {};

  //Open Graph metada para mejorar la apariencia al compartir el perfil del artesano en redes sociales.
  return {
    title: `${artisan.name ?? "Artesana"} — Artelier`,
    description: artisan.bio ?? undefined,
    openGraph: {
      title: artisan.name ?? "Artesana",
      description: artisan.bio ?? undefined,
      images: artisan.image ? [{ url: artisan.image }] : [],
    },
  };
}

//Función principal que renderiza la página pública del artesano, mostrando su información, productos y actualizaciones.
export default async function ArtisanPublicPage({ params }: Props) {
  const { id } = await params;

  const [artisan, session] = await Promise.all([
    db.user.findUnique({
      where: { id, role: "ARTISAN", deletedAt: null, suspended: false },
      include: {
        products: {
          where: { status: { in: ["ACTIVE", "SOLD", "EXPIRED"] }, deletedAt: null },
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        },
        processUpdates: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        sealRequests: {
          where: { status: "APPROVED", productId: null, deletedAt: null },
          include: { seal: { select: { name: true, type: true } } },
        },
      },
    }),
    getServerSession(),
  ]);

  if (!artisan) notFound();

  const isAuthenticated = !!session?.user;
  const isOwnProfile = session?.user?.id === artisan.id;
  const isBuyer = session?.user?.role === "BUYER";

  // El botón "Seguir" se muestra a compradores autenticados Y a visitantes sin cuenta.
  // Los visitantes son redirigidos al registro conservando el destino.
  const canFollow = !isOwnProfile && (isBuyer || !isAuthenticated);
  const followRedirectTo = !isAuthenticated
    ? `/register?next=${encodeURIComponent(`/artisan/${id}`)}`
    : undefined;

  const follow = isBuyer && session?.user?.id
    ? await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: artisan.id,
          },
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-[--bg]">
      {isOwnProfile ? (
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <h1 className="font-display text-xl font-bold text-[--text]">Mi puesto de artesanía</h1>
          <Link
            href="/studio/profile"
            className="cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-1.5 text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#ccc8bc]/40"
          >
            Volver a mi perfil
          </Link>
        </div>
      ) : (
        <div className="px-4 py-3">
          <BackButton />
        </div>
      )}
      <ArtisanHeader
        artisan={artisan}
        isOwnProfile={isOwnProfile}
        isAuthenticated={isAuthenticated}
        isFollowing={!!follow}
        canFollow={canFollow}
        followRedirectTo={followRedirectTo}
        sealRequests={artisan.sealRequests}
      />

      <div className="mt-6 px-4 md:px-6">
        <ArtisanProfileTabs
          products={artisan.products}
          processUpdates={artisan.processUpdates}
          artisanName={artisan.name}
        />

      </div>
    </main>
  );
}
