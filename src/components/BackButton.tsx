"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[--text-muted] transition-colors hover:bg-[#3d5a4f]/10 hover:text-[#3d5a4f]"
    >
      <ArrowLeft size={16} />
      Volver
    </button>
  );
}
