"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  artisanId: string;
  /** Clases extra para adaptar el tamaño según el contexto (producto vs perfil). */
  className?: string;
  /** "outline" (por defecto, para ir junto al botón "Comprar") o "primary" (verde sólido, para el perfil público). */
  variant?: "outline" | "primary";
}

export default function SendMessageButton({
  artisanId,
  className = "flex-1 py-3",
  variant = "outline",
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId }),
      });
      if (res.ok) {
        const json = (await res.json()) as { data: { conversationId: string } };
        router.push(`/messages/${json.data.conversationId}`);
      } else {
        toast.error("No se pudo abrir el mensaje. Inténtalo de nuevo.");
      }
    } catch {
      toast.error("No se pudo abrir el mensaje. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const variantClass =
    variant === "primary"
      ? "bg-[#3d5a4f] text-white hover:bg-[#4a6b5e]"
      : "border border-[#3d5a4f] text-[#3d5a4f] hover:bg-[#3d5a4f]/10";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`cursor-pointer rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${variantClass} ${className}`}
      aria-label="Enviar mensaje a la artesana"
    >
      {loading ? "Abriendo..." : "Enviar mensaje"}
    </button>
  );
}
