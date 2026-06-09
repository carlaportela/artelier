"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  artisanId: string;
  /** Clases extra para adaptar el tamaño según el contexto (producto vs perfil). */
  className?: string;
}

export default function SendMessageButton({
  artisanId,
  className = "flex-1 py-3",
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanId }),
    });
    if (res.ok) {
      const json = (await res.json()) as { data: { conversationId: string } };
      router.push(`/messages/${json.data.conversationId}`);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`cursor-pointer rounded-full border border-[#3d5a4f] text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#3d5a4f]/10 disabled:opacity-50 ${className}`}
      aria-label="Enviar mensaje a la artesana"
    >
      {loading ? "Abriendo..." : "Enviar mensaje"}
    </button>
  );
}
