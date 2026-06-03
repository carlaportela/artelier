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
          className="cursor-pointer text-[#9a9088] transition-colors hover:text-[#5a5648]"
        >
          <Info size={13} />
        </button>
      </span>
      {open && (
        <p className="mt-2 text-xs" style={{ color: "#5a5648" }}>
          {tooltip}
        </p>
      )}
    </div>
  );
}
