// Página de detalle de un producto — pública, SSR, indexable por Google.
// Muestra fotos, información completa, datos de la artesana y CTAs de compra/mensaje.
// Si el producto no existe o está eliminado → 404.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import BackButton from "~/components/BackButton";
import SendMessageButton from "~/components/SendMessageButton";

import { db } from "~/server/db";
import { getServerSession } from "~/server/auth/session";
import PaletteAvatar from "~/components/PaletteAvatar";
import { SealBadge } from "~/components/artisan/SealBadge";
import { getProductBadge } from "~/lib/product-badges";
import ImageCarousel from "./ImageCarousel";
import { TypeBadge } from "./TypeBadge";

type Props = { params: Promise<{ id: string }> };

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

const TYPE_BADGE: Record<string, { label: string; className: string; tooltip: string } | null> = {
  UNIQUE: {
    label: "Pieza única",
    className: "bg-[#4a9e8c]/15 text-[#4a9e8c]",
    tooltip: "Solo existe una unidad de este producto. Una vez vendido, no estará disponible.",
  },
  PERISHABLE: {
    label: "Por tiempo limitado",
    className: "bg-[#c4956a]/15 text-[#c4956a]",
    tooltip: "Este producto solo está disponible durante un período limitado.",
  },
  STANDARD: null,
};

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, deletedAt: null, status: "ACTIVE" },
    select: {
      name: true,
      description: true,
      imageUrls: true,
      artisan: { select: { name: true } },
    },
  });

  if (!product) return {};

  const desc = (product.description ?? "").slice(0, 160);
  return {
    title: `${product.name} — ${product.artisan.name ?? "Artesana"} | Artelier`,
    description: desc,
    openGraph: {
      title: product.name,
      description: desc,
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
  const isArtisan = session?.user?.role === "ARTISAN";
  const isOwner = isArtisan && session?.user?.id === product.artisan.id;
  const badge = getProductBadge(product.status, product.expiresAt);
  const typeBadge = TYPE_BADGE[product.type] ?? null;
  const nextParam = `/product/${id}`;

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-lg md:max-w-2xl">

        {/* ── Flecha volver ── */}
        <div className="mb-2">
          <BackButton label="Volver al catálogo" />
        </div>

        {/* ── Artesana (arriba del carrusel) ── */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-3">
          <PaletteAvatar
            src={product.artisan.image}
            name={product.artisan.name}
            className="h-12 w-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
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
          <Link
            href={`/artisan/${product.artisan.id}`}
            className="shrink-0 rounded-full bg-[#c4956a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#d4a87a]"
          >
            {isOwner ? "Ver tu perfil público" : "Ver perfil"}
          </Link>
        </div>

        {/* ── Carrusel de imágenes ── */}
        <ImageCarousel
          imageUrls={product.imageUrls}
          name={product.name}
          badge={badge}
        />

        {/* ── Info del producto ── */}
        <div className="mt-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-2xl font-bold text-[--text]">
              {product.name}
            </h1>
            <p className="shrink-0 text-xl font-bold text-[#3d5a4f]">
              {fmt(product.priceInCents)}
            </p>
          </div>

          {/* Badge de tipo con tooltip */}
          {typeBadge && (
            <TypeBadge
              label={typeBadge.label}
              className={typeBadge.className}
              tooltip={typeBadge.tooltip}
            />
          )}

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

        {/* ── CTAs — ocultos para artesanas (no pueden comprar/mensajear en su propio catálogo) ── */}
        {!isArtisan && (
          <div className="mt-6 flex gap-3">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
                  aria-label="Comprar producto"
                >
                  Comprar
                </button>
                <SendMessageButton artisanId={product.artisan.id} />
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
                  className="flex-1 rounded-full border border-[#3d5a4f] py-3 text-center text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#3d5a4f]/10"
                >
                  Enviar mensaje
                </Link>
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
