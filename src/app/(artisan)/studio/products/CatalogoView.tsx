// Vista del catálogo con toggle de cuadrícula/lista.
// Client Component: gestiona la preferencia de vista y renderiza
// ProductCard (cuadrícula) o ProductListRow (lista horizontal).

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Grid3x3, Grid2x2, Rows3, LayoutList, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductCard } from "./ProductCard";
import { deleteProduct } from "./[id]/actions";

type View = "grid3" | "grid2" | "grid1" | "list";

type Product = {
  id: string;
  name: string;
  priceInCents: number;
  status: "ACTIVE" | "SOLD" | "EXPIRED";
  imageUrls: string[];
  seals: { seal: { id: string; name: string } }[];
};

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// ── StatusPill ────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: "ACTIVE" | "SOLD" | "EXPIRED" }) {
  if (status === "ACTIVE")
    return (
      <span className="rounded bg-[#8f9e94] px-1.5 py-0.5 text-xs font-medium text-white">
        En stock
      </span>
    );
  if (status === "SOLD")
    return (
      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
        Vendido
      </span>
    );
  return (
    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
      Caducado
    </span>
  );
}

// ── Fila de lista ─────────────────────────────────────────────────────────────

function ProductListRow({ product }: { product: Product }) {
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
      <div className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-2 transition-colors hover:border-[#c4956a]/40">
        {/* Miniatura */}
        <Link
          href={`/studio/products/${product.id}`}
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[--surface-2]"
          aria-label={`Editar ${product.name}`}
        >
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-[10px] text-[--text-muted]">Sin foto</span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[--text]">{product.name}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-xs text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
            <StatusPill status={product.status} />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 gap-1.5">
          <Link
            href={`/studio/products/${product.id}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[--border] text-[--text-muted] transition-colors hover:border-[#3d5a4f] hover:text-[#3d5a4f]"
            aria-label="Editar producto"
          >
            <Pencil size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isPending}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[--border] text-[--text-muted] transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
            aria-label="Eliminar producto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Confirmación de borrado */}
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

// ── Vista principal ───────────────────────────────────────────────────────────

const VIEWS: { v: View; icon: React.ReactNode; label: string }[] = [
  { v: "grid3", icon: <Grid3x3 size={18} />, label: "3 columnas" },
  { v: "grid2", icon: <Grid2x2 size={18} />, label: "2 columnas" },
  { v: "grid1", icon: <Rows3 size={18} />, label: "1 columna" },
  { v: "list",  icon: <LayoutList size={18} />, label: "Lista" },
];

export default function CatalogoView({ products }: { products: Product[] }) {
  const [view, setView] = useState<View>("grid3");

  useEffect(() => {
    const saved = localStorage.getItem("catalogo-view") as View | null;
    if (saved && ["grid3", "grid2", "grid1", "list"].includes(saved)) setView(saved);
  }, []);

  function switchView(v: View) {
    setView(v);
    localStorage.setItem("catalogo-view", v);
  }

  const gridClass =
    view === "grid3" ? "grid-cols-3" : view === "grid2" ? "grid-cols-2" : "grid-cols-1";

  return (
    <>
      {/* Toggle de vista + botón añadir en la misma fila */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1">
          {VIEWS.map(({ v, icon, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => switchView(v)}
              aria-label={label}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                view === v
                  ? "bg-[--surface-2] text-[#3d5a4f]"
                  : "text-[--text-muted] hover:bg-[#ccc8bc]/50 hover:text-[--text]"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        <Link
          href="/studio/products/new"
          className="rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
        >
          Añadir producto
        </Link>
      </div>

      {/* Cuadrícula */}
      {view !== "list" && (
        <div className={`grid ${gridClass} gap-3`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Lista */}
      {view === "list" && (
        <div className="space-y-2">
          {products.map((product) => (
            <ProductListRow key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
