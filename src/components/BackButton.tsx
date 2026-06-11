"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const CLASSES = "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[--border] px-3 py-1.5 text-sm text-[--text-muted] transition-colors hover:bg-[#3d5a4f]/10 hover:text-[#3d5a4f]";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href, label = "Volver" }: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className={CLASSES}>
        <ArrowLeft size={16} />
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className={CLASSES}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
