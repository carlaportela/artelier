"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  imageUrls: string[];
  name: string;
  badge: { label: string; className: string } | null;
}

export default function ImageCarousel({ imageUrls, name, badge }: ImageCarouselProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-2">
      {/* Imagen principal */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[--surface]">
        {imageUrls[selected] ? (
          <Image
            src={imageUrls[selected]!}
            alt={name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 672px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-[--text-muted]">Sin imagen</span>
          </div>
        )}
        {badge && (
          <span className={`absolute bottom-3 left-3 rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Miniaturas clicables */}
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[--surface] transition-all duration-200 ${
                i === selected
                  ? "ring-2 ring-[#3d5a4f] ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <Image
                src={url}
                alt={`${name} — foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
