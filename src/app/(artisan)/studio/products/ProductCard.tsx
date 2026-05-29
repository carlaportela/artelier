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
import { deleteProduct } from "./[id]/actions";

// ─── StatusPill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: "ACTIVE" | "SOLD" | "EXPIRED" }) {
  if (status === "ACTIVE") {
    return (
      <span className="rounded-full bg-[#c8ddd8] px-2 py-0.5 text-xs font-medium text-[#3d5a4f]">
        Disponible
      </span>
    );
  }
  if (status === "SOLD") {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
        Vendido
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
      Caducado
    </span>
  );
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    priceInCents: number;
    status: "ACTIVE" | "SOLD" | "EXPIRED";
    imageUrls: string[];
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
      <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-[--border] bg-[--surface] transition-colors hover:border-[#c4956a]/40">
        {/* Área imagen con hover */}
        <div className="relative aspect-square">
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

          {/* Overlay oscuro al pasar el ratón */}
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />

          {/* Botones de acción (arriba a la derecha, aparecen en hover) */}
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

          {/* Sellos verificados */}
          {product.seals.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
              {product.seals.map((ps) => (
                <SealBadge key={ps.seal.id} name={ps.seal.name} />
              ))}
            </div>
          )}
        </div>

        {/* Info (clickable → editar producto) */}
        <Link href={`/studio/products/${product.id}`} className="block p-3">
          <p className="truncate text-sm font-medium text-[--text]">{product.name}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-sm text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
            <StatusPill status={product.status} />
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
                className="flex-1 cursor-pointer rounded-full bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 cursor-pointer rounded-full border border-[--border] py-2 text-sm text-[--text] transition-colors hover:bg-[--surface-2]"
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
