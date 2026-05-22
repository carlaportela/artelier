"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import FollowButton from "~/components/artisan/FollowButton";

const SEAL_CLASS: Record<string, string> = {
  mano:      "seal-mano",
  eco:       "seal-eco",
  reciclado: "seal-reciclado",
  galicia:   "seal-galicia",
  km0:       "seal-km0",
};

interface ArtisanHeaderProps {
  artisan: {
    id: string;
    name: string | null;
    image: string | null;
    bannerImage: string | null;
    locality: string | null;
    bio: string | null;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
  canFollow: boolean;
  sealRequests: Array<{ id: string; seal: { name: string; type: string } }>;
}

export default function ArtisanHeader({ artisan, isOwnProfile, isFollowing, canFollow, sealRequests }: ArtisanHeaderProps) {
  const initial = artisan.name?.charAt(0).toUpperCase() ?? "A";

  return (
    <div className="relative">
      {/* Banner con logo de Artelier centrado — como una artesana en el mercado */}
      <div className="relative h-[100px] w-full overflow-hidden bg-[--surface] md:h-[120px]">
        {artisan.bannerImage && (
          <Image
            src={artisan.bannerImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Avatar superpuesto */}
      <div className="mx-auto max-w-lg px-4">
        <div className="relative -mt-8 flex items-end justify-between">

          {/* Avatar: foto → circular; sin foto → forma paleta de pintar */}
          {artisan.image ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-full">
              <Image
                src={artisan.image}
                alt={artisan.name ?? "Artesana"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-20 w-20"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={artisan.name ?? "Artesana"}
            >
              {/* Forma de paleta de Lucide sin los puntitos de pintura */}
              <path
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
                fill="#3d5a4f"
                fillOpacity={0.55}
              />
              {/* Inicial centrada en el cuerpo circular de la paleta */}
              <text
                x="12"
                y="12"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#3d5a4f"
                fontSize="7"
                fontFamily="The Girl Next Door, cursive"
              >
                {initial}
              </text>
            </svg>
          )}

          {!isOwnProfile && canFollow && (
            <FollowButton artisanId={artisan.id} initialIsFollowing={isFollowing} />
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <h1 className="font-display text-xl font-bold text-[--text]">
            {artisan.name ?? "Artesana"}
          </h1>
          {artisan.locality && (
            <p className="flex items-center gap-1 text-base font-medium text-[#3d5a4f]">
              <MapPin size={12} />
              {artisan.locality}
            </p>
          )}
          {sealRequests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sealRequests.map((sr) => (
                <span
                  key={sr.id}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SEAL_CLASS[sr.seal.type] ?? "bg-[--surface] text-[--text-muted]"}`}
                >
                  {sr.seal.name}
                </span>
              ))}
            </div>
          )}
          {artisan.bio && (
            <p className="mt-2 line-clamp-3 text-sm text-[--text-muted]">{artisan.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
