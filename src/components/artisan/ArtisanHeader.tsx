//Componente de encabezado del perfil del artesano.
//Muestra banner, avatar, nombre, localidad, biografía y sellos de calidad. También incluye el botón de seguir perfil.

"use client";//Se renderiza en cliente.

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";
import FollowButton from "~/components/artisan/FollowButton";
import PaletteAvatar from "~/components/PaletteAvatar";

//Clases de estilo para los diferentes tipos de sellos de perfil.
const SEAL_CLASS: Record<string, string> = {
  mano:      "seal-mano",
  eco:       "seal-eco",
  reciclado: "seal-reciclado",
  galicia:   "seal-galicia",
  km0:       "seal-km0",
};

//Argumentos que recibe la función del componente.
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
  studioMode?: boolean;
}

//Función del componente que renderiza el encabezado del perfil del artesano.
export default function ArtisanHeader({ artisan, isOwnProfile, isFollowing, canFollow, sealRequests, studioMode = false }: ArtisanHeaderProps) {

  return (
    <div className="relative">
      {/* ── Banner ── */}
      <div className="relative h-[155px] w-full overflow-hidden bg-[--surface] md:h-[175px]">
        {artisan.bannerImage && (
          <Image
            src={artisan.bannerImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Fondo de textura si no hay imagen */}
        {!artisan.bannerImage && <div className="banner-lino h-full w-full" />}
      </div>

      {/* ── Avatar + FollowButton ── */}
      <div className="px-2">
        <div className="relative -mt-[79px] flex items-end justify-between">
          {/* Avatar: izquierda en modo público */}
          {!studioMode && (
            <PaletteAvatar
              src={artisan.image}
              name={artisan.name}
              className="h-40 w-40"
            />
          )}

          {studioMode ? (
            <PaletteAvatar
              src={artisan.image}
              name={artisan.name}
              className="h-40 w-40"
            />
          ) : isOwnProfile ? (
            <Link
              href="/studio/profile"
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ccc8bc] px-4 py-1.5 text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#ccc8bc]/40"
            >
              <ArrowLeft size={13} />
              Volver a mi perfil
            </Link>
          ) : (
            canFollow && (
              <FollowButton artisanId={artisan.id} initialIsFollowing={isFollowing} />
            )
          )}
        </div>

        {/* ── Info ── */}
        <div className="mt-4 w-full space-y-2 pl-3">
          <h1 className="font-display text-xl font-bold text-[--text]">
            {artisan.name ?? "Artesana"}
          </h1>
          {artisan.locality && (
            <p className="flex items-center gap-1 text-sm font-medium text-[#3d5a4f]">
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
            <p className="line-clamp-3 text-sm text-[--text-muted]">{artisan.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
