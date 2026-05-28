//Página que muestra los productos del artesano en su estudio. Permite ver los productos publicados y acceder a la página de creación de nuevos productos. Solo accesible para usuarios con rol de Artesano

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

//Función principal que renderiza la página de productos del estudio del artesano. Verifica la sesión del usuario, renderiza los productos publicados por el artesano y muestra un enlace para crear nuevos productos. Si no hay productos, muestra un mensaje indicando que aún no se han publicado productos.
export default async function StudioProductsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const products = await db.product.findMany({
    where: {
      artisanId: session.user.id,
      deletedAt: null,
      status: { in: ["ACTIVE", "SOLD"] }, //Muestra solo productos activos o vendidos, no eliminados.
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      status: true,
      imageUrls: true,
    },
  });

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  return (
    <main className="bg-[--bg]">
      <div className="px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-[--text]">Mi catálogo</h1>
      </div>

      {products.length === 0 ? ( //Si no se han publicado productos muestra un mensaje indicándolo.
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-[--text-muted]">Aún no has publicado ninguna pieza.</p>
          <Link
            href="/studio/products/new"
            className="rounded-full bg-[#3d5a4f] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
          >
            Publica tu primera pieza
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-[--border] bg-[--surface]"
            >
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
                {product.status === "SOLD" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-[--text]">
                      Vendido
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-[--text]">{product.name}</p>
                <p className="text-sm text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
