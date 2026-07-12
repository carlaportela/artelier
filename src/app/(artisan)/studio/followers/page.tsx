//Página de seguidoras del estudio de la artesana.

import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";
import PaletteAvatar from "~/components/PaletteAvatar";

export const metadata: Metadata = { title: "Seguidoras — Artelier" };

export default async function FollowersPage() {
  const session = await requireArtisanSession();

  //Se obtienen las seguidoras mediante una consulta a la base de datos.
  const follows = await db.follow.findMany({
    where: { followingId: session.user.id },
    include: {
      follower: { select: { name: true, lastName: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="bg-[--bg]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display mb-6 text-xl font-bold text-[--text]">
          Seguidoras
        </h1>
        {follows.length === 0 ? ( //Si no existen seguidoras muestra el mensaje correspondiente.
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3d5a4f]/10">
              <Heart className="h-7 w-7 text-[#3d5a4f]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-base font-bold text-[--text]">
                Aún no tienes seguidoras.
              </p>
              <p className="mt-2 max-w-xs text-sm text-[--text-muted]">
                Cuando alguien empiece a seguirte, aparecerá aquí.
              </p>
            </div>
          </div>
        ) : (
          //Si existen seguidoras las muestra.
          <div className="space-y-3">
            {follows.map(({ id, follower }) => (
              <div
                key={id}
                className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-4"
              >
                <PaletteAvatar
                  src={follower.image}
                  name={follower.name}
                  className="h-11 w-11 shrink-0"
                  fillColor="#c4956a"
                />
                <p className="text-sm font-medium text-[--text]">
                  {follower.name} {follower.lastName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
