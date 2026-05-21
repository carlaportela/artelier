import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import ArtisanHeader from "~/components/artisan/ArtisanHeader";
import ArtisanProfileTabs from "~/components/artisan/ArtisanProfileTabs";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const artisan = await db.user.findUnique({
    where: { id },
    select: { name: true, bio: true, image: true },
  });

  if (!artisan) return {};

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

export default async function ArtisanPublicPage({ params }: Props) {
  const { id } = await params;

  const [artisan, session] = await Promise.all([
    db.user.findUnique({
      where: { id, role: "ARTISAN", deletedAt: null, suspended: false },
      include: {
        products: {
          where: { status: "ACTIVE", deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        processUpdates: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    auth(),
  ]);

  if (!artisan) notFound();

  const isOwnProfile = session?.user?.id === artisan.id;

  return (
    <main className="min-h-screen bg-[--bg]">
      <ArtisanHeader artisan={artisan} isOwnProfile={isOwnProfile} />

      <div className="mt-6 px-4">
        <ArtisanProfileTabs
          products={artisan.products}
          processUpdates={artisan.processUpdates}
          artisanName={artisan.name}
        />
      </div>
    </main>
  );
}
