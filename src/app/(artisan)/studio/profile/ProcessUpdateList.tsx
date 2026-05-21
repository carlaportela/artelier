"use client";

import Image from "next/image";
import type { ProcessUpdate } from "generated/prisma";

interface ProcessUpdateListProps {
  updates: ProcessUpdate[];
}

export default function ProcessUpdateList({ updates }: ProcessUpdateListProps) {
  if (updates.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[--text-muted]">
        Aún no tienes actualizaciones de proceso.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <div key={update.id} className="space-y-2 rounded-lg border border-[--border] bg-[--surface] p-4">
          <p className="text-xs text-[--text-muted]">
            {new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(update.createdAt))}
          </p>
          <p className="text-sm text-[--text]">{update.content}</p>
          {update.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image src={update.imageUrl} alt="" fill className="object-cover" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
