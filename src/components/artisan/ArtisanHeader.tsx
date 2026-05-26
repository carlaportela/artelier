//Componente de encabezado del perfil del artesano.
//Muestra banner, avatar, nombre, localidad, biografía y sellos de calidad. También incluye el botón de seguir perfil.

"use client";//Se renderiza en cliente.

import Image from "next/image";
import { MapPin } from "lucide-react";
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
  const initial = artisan.name?.charAt(0).toUpperCase() ?? "A";
  const firstName = artisan.name?.split(" ")[0] ?? "artesana";

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

          {/* Avatar: izquierda en modo público, derecha en modo studio */}
          {!studioMode && (
            <PaletteAvatar src={artisan.image} name={artisan.name} className="h-20 w-20" />
          )}

          {studioMode ? (
            <PaletteAvatar src={artisan.image} name={artisan.name} className="h-20 w-20" />
          ) : (
            !isOwnProfile && canFollow && (
              <FollowButton artisanId={artisan.id} initialIsFollowing={isFollowing} />
            )
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
