// Página principal de Artelier.
// - Visitantes sin cuenta: catálogo público de productos (SSR, indexable por Google).
// - Compradora autenticada: redirige a /feed (feed personalizado).
// - Artesana autenticada: redirige a /studio/products.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import ProductCard from "~/components/ProductCard";

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
    <main className="min-h-screen bg-[--bg] px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-[--text]">
        Artesanía hecha a mano
      </h1>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-[--text-muted]">
          Pronto habrá artesanas aquí.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
