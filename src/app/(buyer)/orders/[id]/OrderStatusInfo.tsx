"use client";

//Muestra el estado del pedido con su punto de color y, si hay una explicación asociada
//(p.ej. plazo de aceptación de la artesana), un icono de información que la despliega.

import { useState } from "react";
import { Info } from "lucide-react";
import { ORDER_STATUS_DOT } from "~/lib/order-constants";

interface Props {
  status: string;
  statusLabel: string;
  explanation?: string;
}

export default function OrderStatusInfo({ status, statusLabel, explanation }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <span className="flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${ORDER_STATUS_DOT[status] ?? "bg-neutral"}`}
          />
          {statusLabel}
        </span>
        {explanation && (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Ocultar información del estado" : "Ver información del estado"}
            className="cursor-pointer text-muted-foreground/35 transition-colors hover:text-primary"
          >
            <Info size={13} />
          </button>
        )}
      </span>
      {open && explanation && (
        <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground/55">
          {explanation}
        </p>
      )}
    </div>
  );
}
