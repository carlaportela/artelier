//Componente de botón para seguir o dejar de seguir a un artesano. Cambia su apariencia y funcionalidad según el estado de seguimiento actual.

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { followArtisan, unfollowArtisan } from "~/app/(buyer)/artisan/[id]/actions";

interface FollowButtonProps {
  artisanId: string;
  initialIsFollowing: boolean;
  /** Si se pasa, el clic redirige aquí en lugar de llamar al servidor (para visitantes sin cuenta). */
  redirectTo?: string;
}

export default function FollowButton({ artisanId, initialIsFollowing, redirectTo }: FollowButtonProps) {
  const t = useTranslations("profile");
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    // Visitante sin cuenta → llevar al registro conservando destino
    if (redirectTo) {
      window.location.href = redirectTo;
      return;
    }

    setIsPending(true);
    const previous = isFollowing;
    setIsFollowing(!isFollowing);

    const result = isFollowing
      ? await unfollowArtisan(artisanId)
      : await followArtisan(artisanId);

    if (result?.error) setIsFollowing(previous);
    setIsPending(false);
  }

  // Visitantes sin cuenta siempre ven "Seguir" (nunca "Siguiendo")
  const label = redirectTo ? t("follow") : isFollowing ? t("following") : t("follow");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        !redirectTo && isFollowing
          ? "border border-[#c4956a] bg-transparent text-[#c4956a] hover:bg-[#c4956a]/10"
          : "bg-[#c4956a] text-white hover:bg-[#d4a87a] active:scale-95"
      }`}
    >
      {label}
    </button>
  );
}
