"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
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
    <Button
      variant={isFollowing ? "outline" : "default"}
      className="rounded-full px-6"
      onClick={handleClick}
      disabled={isPending}
    >
      {isFollowing ? t("following") : t("follow")}
    </Button>
  );
}
