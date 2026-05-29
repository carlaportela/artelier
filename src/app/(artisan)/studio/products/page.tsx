// Página que muestra los productos del artesano en su estudio.
// Permite ver los productos publicados (activos, vendidos y caducados) y acceder a edición.
// Solo accesible para usuarios con rol de Artesano.

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { SealBadge } from "~/components/artisan/SealBadge";

//Pill de estado del producto según su valor en DB.
function StatusPill({ status }: { status: "ACTIVE" | "SOLD" | "EXPIRED" }) {
  if (status === "ACTIVE") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
        Activo
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

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  return (
    <main className="bg-[--bg]">
      <div className="px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-[--text]">Mi catálogo</h1>
          <Link
            href="/studio/products/new"
            className="rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
          >
            + Nueva pieza
          </Link>
        </div>

        {products.length === 0 ? (
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
              <Link
                key={product.id}
                href={`/studio/products/${product.id}`}
                className="overflow-hidden rounded-xl border border-[--border] bg-[--surface] transition-colors hover:border-[#c4956a]/40"
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

                  {/* Sellos verificados asignados por el sistema */}
                  {product.seals.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                      {product.seals.map((ps: { seal: { id: string; name: string } }) => (
                        <SealBadge key={ps.seal.id} name={ps.seal.name} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-medium text-[--text]">{product.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-sm text-[#3d5a4f]">{fmt(product.priceInCents)}</p>
                    <StatusPill status={product.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
