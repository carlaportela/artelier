// Página que muestra los productos del artesano en su estudio.
// Permite ver los productos publicados (activos, vendidos y caducados) y acceder a edición.
// Solo accesible para usuarios con rol de Artesano.

import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { ProductCard } from "./ProductCard";

export default async function StudioProductsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  // Incluimos todos los estados (ACTIVE, SOLD, EXPIRED) — solo excluimos soft-deleted.
  const products = await db.product.findMany({
    where: {
      artisanId: session.user.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      status: true,
      imageUrls: true,
      seals: {
        select: {
          seal: { select: { id: true, name: true } },
        },
      },
    },
  });

  return (
    <main className="bg-[--bg]">
      <div className="px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-[--text]">Mi catálogo</h1>
          <Link
            href="/studio/products/new"
            className="rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
          >
            Añadir producto
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <p className="text-[--text-muted]">Aún no has publicado ningún producto.</p>
            <Link
              href="/studio/products/new"
              className="rounded-full bg-[#3d5a4f] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
            >
              Publica tu primer producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
