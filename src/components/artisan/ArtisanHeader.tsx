"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";

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
}

export default function ArtisanHeader({ artisan, isOwnProfile }: ArtisanHeaderProps) {
  const t = useTranslations("profile");

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-[100px] w-full overflow-hidden bg-[--surface] md:h-[120px]">
        {artisan.bannerImage ? (
          <Image
            src={artisan.bannerImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-[--surface]" />
        )}
      </div>

      {/* Avatar superpuesto */}
      <div className="px-4">
        <div className="relative -mt-8 flex items-end justify-between">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-[--surface]">
            {artisan.image ? (
              <Image
                src={artisan.image}
                alt={artisan.name ?? "Artesana"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[--surface] font-display text-xl text-[--text-muted]">
                {artisan.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
            )}
          </div>

          {!isOwnProfile && (
            <Button
              variant="default"
              className="rounded-full px-6"
              disabled
            >
              {t("follow")}
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <h1 className="font-display text-xl text-[--text]">
            {artisan.name ?? "Artesana"}
          </h1>
          {artisan.locality && (
            <p className="text-sm text-[--text-muted]">{artisan.locality}</p>
          )}
          {artisan.bio && (
            <p className="text-sm text-[--text]">{artisan.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
