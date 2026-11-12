"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface TypeBadgeProps {
  label: string;
  className: string;
  tooltip: string;
}

export function TypeBadge({ label, className, tooltip }: TypeBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <span className="inline-flex items-center gap-1">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${className}`}>
          {label}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Más información"
          className="cursor-pointer text-muted-foreground/35 transition-colors hover:text-primary"
        >
          <Info size={13} />
        </button>
      </span>
      {open && (
        <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground/55">
          {tooltip}
        </p>
      )}
    </div>
  );
}
