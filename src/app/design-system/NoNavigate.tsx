"use client";

//Envuelve una ficha que contiene un <Link> real (p. ej. ProductCard) para que, en esta hoja
//de referencia, el clic no navegue a una URL de mentira (el producto de la ficha no existe
//en la base de datos). onClickCapture corta el evento antes de que el <Link> de Next lo reciba.

import type { ReactNode } from "react";

export function NoNavigate({ children }: { children: ReactNode }) {
  return (
    <div
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
