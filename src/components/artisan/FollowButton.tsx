"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { followArtisan, unfollowArtisan } from "~/app/(buyer)/artisan/[id]/actions";

interface FollowButtonProps {
  artisanId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ artisanId, initialIsFollowing }: FollowButtonProps) {
  const t = useTranslations("profile");
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const previous = isFollowing;
    setIsFollowing(!isFollowing);

    const result = isFollowing
      ? await unfollowArtisan(artisanId)
      : await followArtisan(artisanId);

    if (result?.error) setIsFollowing(previous);
    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        isFollowing
          ? "border border-[#c4956a] bg-transparent text-[#c4956a] hover:bg-[#c4956a]/10"
          : "bg-[#c4956a] text-white hover:bg-[#b5894e] active:scale-95"
      }`}
    >
      {isFollowing ? t("following") : t("follow")}
    </button>
  );
}
