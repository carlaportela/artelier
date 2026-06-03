// Tarjeta de producto para el feed público y el catálogo de descubrimiento.
// Server Component — solo muestra, sin edición ni borrado.
// Diferente de src/app/(artisan)/studio/products/ProductCard.tsx (gestión del studio).

import Link from "next/link";
import Image from "next/image";

import PaletteAvatar from "~/components/PaletteAvatar";
import { getProductBadge } from "~/lib/product-badges";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PublicProductCardProps {
  product: {
    id: string;
    name: string;
    priceInCents: number;
    status: "ACTIVE" | "SOLD" | "EXPIRED";
    imageUrls: string[];
    expiresAt: Date | null;
    artisan: {
      name: string | null;
      image: string | null;
    };
  };
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ProductCard({ product }: PublicProductCardProps) {
  const badge = getProductBadge(product.status, product.expiresAt);

  return (
    <article>
      <Link
        href={`/product/${product.id}`}
        className="group block overflow-hidden rounded-xl border border-[--border] bg-[--surface] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        {/* Strip artesana */}
        <div className="flex items-center gap-2 bg-[#dedad2] px-2.5 py-2 md:px-3 md:py-2.5">
          <PaletteAvatar
            src={product.artisan.image}
            name={product.artisan.name}
            className="h-9 w-9 shrink-0 md:h-10 md:w-10"
          />
          <p className="truncate font-display text-base font-bold text-[--text] md:text-lg">
            {product.artisan.name ?? "Artesana"}
          </p>
        </div>

        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden">
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#dedad2]">
              <span className="text-xs text-[--text-muted]">Sin imagen</span>
            </div>
          )}

          {/* Badge de estado (solo si no está disponible sin más) */}
          {badge && (
            <span className={`absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="truncate font-display text-base font-bold text-[--text]">{product.name}</p>
          <p className="mt-0.5 text-xs font-medium text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
        </div>
      </Link>
    </article>
  );
}
