"use client";

import Image from "next/image";
import FollowButton from "~/components/artisan/FollowButton";

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
}

export default function ArtisanHeader({ artisan, isOwnProfile, isFollowing, canFollow }: ArtisanHeaderProps) {

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

          {!isOwnProfile && canFollow && (
            <FollowButton artisanId={artisan.id} initialIsFollowing={isFollowing} />
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
            <p className="line-clamp-3 text-sm text-[--text]">{artisan.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
