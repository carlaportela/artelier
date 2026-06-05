//Página de búsqueda de productos para compradores registrados o no registrados.

import { Suspense } from "react";
import { db } from "~/server/db";
import SearchClient from "./SearchClient";

//Parámetros de búsqueda que se esperan en la URL: q (término de búsqueda), category (categoría del producto), locality (localidad del producto) y sealId (ID del sello de calidad).
type Props = {
    searchParams: Promise<{ //Desde Next.js 15 los params y searchParams van con Promise, por lo que hay que esperar a que se resuelvan para obtener los valores.
        q?: string;
        artisanQ?: string;
        category?: string;
        locality?: string;
        sealId?: string;
    }>;
};

//Función principal del componente de búsqueda. Se encarga de obtener los parámetros de búsqueda, realizar la consulta a la base de datos para obtener los productos que coinciden con los criterios de búsqueda y renderizar el componente SearchClient con los resultados.
export default async function SearchPage({ searchParams }: Props) {

    //Desestructuración de los parámteros de búsqueda obtenidos de la URL.
    const { q, artisanQ, category, locality, sealId } = await searchParams;

    //Validación de los parámetros de búsqueda para evitar consultas ineficientes a la base de datos. Si el término de búsqueda es demasiado largo, se asigna undefined para que no se aplique ese filtro en la consulta.
    const safeQ = q && q.length <= 100 ? q : undefined;
    const safeArtisanQ = artisanQ && artisanQ.length <= 100 ? artisanQ : undefined;

    const take = 20;

    //Construcción de la cláusula WHERE para la consulta de la base de datos.
    const where = {
        deletedAt: null,
        status: "ACTIVE" as const,
        ...(safeQ ? { name: { contains: safeQ, mode: "insensitive" as const } } : {}),
        ...(safeArtisanQ ? { artisan: { name: { contains: safeArtisanQ, mode: "insensitive" as const } } } : {}),
        ...(category ? { category } : {}),
        ...(locality ? { locality } : {}),
        ...(sealId ? { seals: { some: { sealId } } } : {}),
    };

    //Obtención de los sellos que coinciden con los criterios de búsqueda a partir de la base de datos, junto con los productos que coinciden con los criterios de búsqueda. Se utiliza Promise.all para realizar ambas consultas de manera concurrente.
    const [seals, products] = await Promise.all([
        db.seal.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        db.product.findMany({
            take: take + 1,
            orderBy: { createdAt: "desc" },
            where,
            select: {
                id: true,
                name: true,
                priceInCents: true,
                status: true,
                imageUrls: true,
                expiresAt: true,
                artisan: { select: { name: true, image: true } },
            },
        }),
    ]);

    const hasMore = products.length > take;
    const initialProducts = hasMore ? products.slice(0, take) : products;
    const initialNextCursor = hasMore ? initialProducts[initialProducts.length - 1]?.id : null;

    return (
        <main className="px-4 py-8">
            <h1 className="font-display text-center text-3xl font-bold text-[--text]">
                ¿Qué te interesa descubrir?
            </h1>
            <p className="mt-2 mb-6 text-center text-sm text-[--text-muted]">
                Establece los términos de búsqueda para encontrar productos que puedan interesarte
            </p>
            <Suspense fallback={<p className="py-20 text-center text-sm text-[--text-muted]">Cargando...</p>}>
                <SearchClient
                    key={`${q ?? ""}-${artisanQ ?? ""}-${category ?? ""}-${locality ?? ""}-${sealId ?? ""}`}
                    initialProducts={initialProducts}
                    initialNextCursor={initialNextCursor ?? null}
                    initialHasMore={hasMore}
                    seals={seals}
                    currentQ={safeQ ?? null}
                    currentArtisanQ={safeArtisanQ ?? null}
                    currentCategory={category ?? null}
                    currentLocality={locality ?? null}
                    currentSealId={sealId ?? null}
                />
            </Suspense>
        </main>
    );
}
