"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Square, Grid2x2, Grid3x3, Rows3 } from "lucide-react";

import ProductCard from "~/components/ProductCard";
import PaletteAvatar from "~/components/PaletteAvatar";

type View = "single" | "standard" | "compact" | "rows";

type Product = {
  id: string;
  name: string;
  priceInCents: number;
  status: "ACTIVE" | "SOLD" | "EXPIRED";
  imageUrls: string[];
  expiresAt: Date | null;
  artisan: { name: string | null; image: string | null };
};

// Botones visibles por breakpoint:
//   móvil (<sm)  → single, rows
//   sm  (640px+) → standard, single, rows
//   md+ (768px+) → compact, standard, single, rows
const VIEWS: { v: View; icon: React.ReactNode; label: string; btnClass: string }[] = [
  { v: "compact",  icon: <Grid3x3 size={18} />, label: "3 columnas",      btnClass: "hidden md:flex" },
  { v: "standard", icon: <Grid2x2 size={18} />, label: "2 columnas",      btnClass: "hidden sm:flex" },
  { v: "single",   icon: <Square size={18} />,  label: "1 columna",       btnClass: "flex" },
  { v: "rows",     icon: <Rows3 size={18} />,   label: "Vista en líneas", btnClass: "flex" },
];

// Cuando el usuario elige una vista manualmente, estas clases fijas se aplican.
// El botón compact solo es visible en md+, standard en sm+, así que nunca
// se puede seleccionar un grid demasiado grande para la pantalla actual.
const MANUAL_GRID: Record<Exclude<View, "rows">, string> = {
  compact:  "grid-cols-3",
  standard: "grid-cols-2",
  single:   "grid-cols-1",
};

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// ── Fila horizontal ───────────────────────────────────────────────────────────

function ProductRow({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[--surface-2]">
        {product.imageUrls[0] ? (
          <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] text-[--text-muted]">Sin foto</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <PaletteAvatar src={product.artisan.image} name={product.artisan.name} className="h-5 w-5 shrink-0" />
            <p className="truncate text-sm text-[--text-muted]">{product.artisan.name ?? "Artesana"}</p>
          </div>
          <p className="shrink-0 text-sm font-medium text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
        </div>
        <p className="mt-1 truncate font-display text-base font-bold text-[--text]">{product.name}</p>
      </div>
    </Link>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────

export default function HomeGrid({ products }: { products: Product[] }) {
  // null = sin elección manual → el CSS responsive controla el grid
  const [manualView, setManualView] = useState<View | null>(null);

  // Solo para resaltar el botón activo; no afecta al grid en sí
  const [activeBtn, setActiveBtn] = useState<View>("single");

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) setActiveBtn("compact");
    else if (window.matchMedia("(min-width: 640px)").matches) setActiveBtn("standard");
    else setActiveBtn("single");
  }, []);

  function switchView(v: View) {
    setManualView(v);
    setActiveBtn(v);
  }

  // Sin elección manual: CSS responsive puro (1 col móvil, 2 sm, 3 md+)
  // Con elección manual: clase fija según lo que eligió el usuario
  const gridClass =
    manualView === null || manualView === "rows"
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : MANUAL_GRID[manualView];

  const isRows = manualView === "rows";

  return (
    <>
      <div className="mb-4 flex gap-1">
        {VIEWS.map(({ v, icon, label, btnClass }) => (
          <button
            key={v}
            type="button"
            onClick={() => switchView(v)}
            aria-label={label}
            className={`${btnClass} h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              activeBtn === v
                ? "bg-[--surface-2] text-[#3d5a4f]"
                : "text-[--text-muted] hover:bg-[#ccc8bc]/50 hover:text-[--text]"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {!isRows ? (
        <div className={`grid ${gridClass} gap-3`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
