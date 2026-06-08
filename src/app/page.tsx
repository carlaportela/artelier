// Página principal de Artelier.
// - Visitantes sin cuenta: catálogo público de productos (SSR, indexable por Google).
// - Compradora autenticada: redirige a /feed (feed personalizado).
// - Artesana autenticada: redirige a /studio/products.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import AppHeader from "~/components/AppHeader";
import AppFooter from "~/components/AppFooter";
import HomeGrid from "~/app/HomeGrid";

export const metadata: Metadata = {
  title: "Artelier — Artesanía hecha a mano",
  description:
    "Descubre productos únicos de artesanas locales. Cerámica, textil, joyería y mucho más, creados con cuidado y autenticidad.",
};

export default async function HomePage() {
  const session = await getServerSession();

  // Usuarios autenticados → sus respectivas áreas
  if (session?.user?.role === "ARTISAN") redirect("/studio/products");
  if (session?.user?.role === "BUYER") redirect("/feed");

  // Visitantes sin cuenta → catálogo público
  const products = await db.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      name: true,
      priceInCents: true,
      status: true,
      imageUrls: true,
      expiresAt: true,
      artisan: {
        select: { name: true, image: true },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-[--bg]">
      <AppHeader />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">

          {/* ── Bienvenida ── */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-[--text] sm:text-4xl">
              Tu mercado de artesanía local
            </h1>
            <p className="mt-2 text-sm text-[--text-muted]">
              Descubre productos únicos de artesanía cerca de ti
            </p>
          </div>

          {products.length === 0 ? (
            <p className="py-20 text-center text-sm text-[--text-muted]">
              Pronto habrá artesanas aquí.
            </p>
          ) : (
            <HomeGrid products={products} />
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
