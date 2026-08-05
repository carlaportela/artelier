// Tarjeta de producto en el catálogo del studio.
// Client Component: gestiona el hover overlay, los botones de editar/borrar y el dialog de confirmación de borrado.

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SealBadge } from "~/components/artisan/SealBadge";
import { getProductBadge } from "~/lib/product-badges";
import { deleteProduct } from "./[id]/actions";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    priceInCents: number;
    status: "ACTIVE" | "SOLD" | "EXPIRED";
    imageUrls: string[];
    expiresAt: Date | null;
    seals: { seal: { id: string; name: string } }[];
  };
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// ─── Componente ──────────────────────────────────────────────────────────────

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if ("success" in result) {
        toast.success("Producto eliminado");
        router.refresh();
      } else {
        if (result.error.code === "HAS_ACTIVE_ORDERS") {
          toast.error("No puedes eliminar un producto con pedidos activos");
        } else {
          toast.error("No se pudo eliminar el producto. Inténtalo de nuevo.");
        }
      }
    });
    setShowConfirm(false);
  }

  return (
    <>
      <div className={`group relative overflow-hidden rounded-xl border border-[--border] bg-[--surface] transition-colors ${product.status !== "EXPIRED" ? "hover:border-[#c4956a]/40" : "opacity-75"}`}>
        {/* Imagen — Link que navega a editar al hacer clic en cualquier punto de la foto */}
        <Link href={`/studio/products/${product.id}`} className="relative block aspect-square" aria-label={`Editar ${product.name}`}>
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 50vw, 256px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[--surface-2]">
              <span className="text-xs text-[--text-muted]">Sin imagen</span>
            </div>
          )}

          {/* Overlay: oscuro permanente si expirado, hover si no */}
          <div className={`pointer-events-none absolute inset-0 transition-colors duration-200 ${
            product.status === "EXPIRED"
              ? "bg-black/45"
              : "bg-black/0 group-hover:bg-black/30"
          }`} />

          {/* Sellos + badge de estado — todos en el mismo contenedor bottom-left */}
          <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
            {product.seals.map((ps) => (
              <SealBadge key={ps.seal.id} name={ps.seal.name} />
            ))}
            {(() => {
              const badge = getProductBadge(product.status, product.expiresAt);
              return badge ? (
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              ) : null;
            })()}
          </div>
        </Link>

        {/* Botones de acción — fuera del Link, posicionados encima de la imagen con absolute */}
        <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Link
            href={`/studio/products/${product.id}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="Editar producto"
          >
            <Pencil size={13} />
          </Link>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isPending}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80 disabled:opacity-60"
            aria-label="Eliminar producto"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Info (clickable → editar producto) */}
        <Link href={`/studio/products/${product.id}`} className="block p-3">
          <p className={`truncate font-display text-base ${product.status === "EXPIRED" ? "text-[--text-muted]" : "text-[--text]"}`}>{product.name}</p>
          <div className="mt-1">
            <p className="text-xs text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
          </div>
        </Link>
      </div>

      {/* Dialog de confirmación de borrado */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 font-display text-base font-semibold text-[--text]">
              ¿Eliminar este producto?
            </h2>
            <p className="mb-5 text-sm text-[--text-muted]">
              El producto desaparecerá de tu catálogo. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 cursor-pointer rounded-full bg-red-700 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 cursor-pointer rounded-full border border-[#ccc8bc] py-2 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
