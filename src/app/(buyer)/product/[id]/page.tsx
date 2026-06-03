// Página de detalle de un producto — pública, SSR, indexable por Google.
// Muestra fotos, información completa, datos de la artesana y CTAs de compra/mensaje.
// Si el producto no existe o está eliminado → 404.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { db } from "~/server/db";
import { getServerSession } from "~/server/auth/session";
import PaletteAvatar from "~/components/PaletteAvatar";
import { SealBadge } from "~/components/artisan/SealBadge";
import { getProductBadge } from "~/lib/product-badges";

type Props = { params: Promise<{ id: string }> };

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

const TYPE_LABELS: Record<string, string> = {
  UNIQUE:    "Pieza única",
  PERISHABLE: "Por tiempo limitado",
  STANDARD:  "En stock",
};

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, deletedAt: null },
    select: {
      name: true,
      description: true,
      imageUrls: true,
      artisan: { select: { name: true } },
    },
  });

  if (!product) return {};

  return {
    title: `${product.name} — ${product.artisan.name ?? "Artesana"} | Artelier`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.imageUrls[0] ? [{ url: product.imageUrls[0] }] : [],
    },
  };
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const [product, session] = await Promise.all([
    db.product.findFirst({
      where: { id, deletedAt: null, status: "ACTIVE" },
      include: {
        artisan: {
          select: { id: true, name: true, image: true, locality: true },
        },
        seals: {
          include: { seal: { select: { name: true, type: true } } },
        },
      },
    }),
    getServerSession(),
  ]);

  if (!product) notFound();

  const isAuthenticated = !!session?.user;
  const badge = getProductBadge(product.status, product.expiresAt);
  const nextParam = `/product/${id}`;

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-lg md:max-w-2xl">

        {/* ── Galería de imágenes ── */}
        <div className="space-y-2">
          {/* Imagen principal */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[--surface]">
            {product.imageUrls[0] ? (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 672px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-sm text-[--text-muted]">Sin imagen</span>
              </div>
            )}
            {badge && (
              <span className={`absolute bottom-3 left-3 rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Miniaturas adicionales */}
          {product.imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.imageUrls.slice(1).map((url, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[--surface]"
                >
                  <Image
                    src={url}
                    alt={`${product.name} — foto ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info del producto ── */}
        <div className="mt-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-2xl font-bold text-[--text]">
              {product.name}
            </h1>
            <p className="shrink-0 font-display text-xl font-bold text-[#3d5a4f]">
              {fmt(product.priceInCents)}
            </p>
          </div>

          {/* Tipo de producto */}
          <p className="text-xs text-[--text-muted]">
            {TYPE_LABELS[product.type] ?? product.type}
          </p>

          {/* Descripción */}
          <p className="whitespace-pre-line text-sm leading-relaxed text-[--text-muted]">
            {product.description}
          </p>

          {/* Sellos */}
          {product.seals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.seals.map((ps) => (
                <SealBadge key={ps.seal.name} name={ps.seal.name} />
              ))}
            </div>
          )}
        </div>

        {/* ── CTAs ── */}
        <div className="mt-6 flex gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={undefined}
                className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
                aria-label="Comprar producto"
              >
                Comprar
              </button>
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-full border border-[#c4956a] py-3 text-sm font-medium text-[#c4956a] transition-colors hover:bg-[#c4956a]/10"
                aria-label="Enviar mensaje a la artesana"
              >
                Enviar mensaje
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/register?next=${encodeURIComponent(nextParam)}`}
                className="flex-1 rounded-full bg-[#3d5a4f] py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
              >
                Comprar
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent(nextParam)}`}
                className="flex-1 rounded-full border border-[#c4956a] py-3 text-center text-sm font-medium text-[#c4956a] transition-colors hover:bg-[#c4956a]/10"
              >
                Enviar mensaje
              </Link>
            </>
          )}
        </div>

        {/* ── Artesana ── */}
        <Link
          href={`/artisan/${product.artisan.id}`}
          className="mt-6 flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-3 transition-colors hover:border-[#c4956a]/40"
        >
          <PaletteAvatar
            src={product.artisan.image}
            name={product.artisan.name}
            className="h-12 w-12 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-[--text]">
              {product.artisan.name ?? "Artesana"}
            </p>
            {product.artisan.locality && (
              <p className="flex items-center gap-1 text-xs text-[--text-muted]">
                <MapPin size={10} />
                {product.artisan.locality}
              </p>
            )}
          </div>
          <span className="ml-auto text-xs text-[#c4956a]">Ver perfil →</span>
        </Link>

      </div>
    </main>
  );
}
