//Endpoint para búsqueda de productos con filtros y paginación. Se pueden filtrar por texto, categoría, localidad y sello de calidad. La respuesta incluye los productos encontrados, un cursor para la siguiente página y un indicador de si hay más resultados disponibles.

import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { CATEGORIES } from "~/lib/categories";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url); //Extraemos los parámetros de búsqueda de la URL.

    //Obtenemos los parámetros de búsqueda, asignando undefined si no están presentes.
    const q = searchParams.get("q") ?? undefined;
    const artisanQ = searchParams.get("artisanQ") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const locality = searchParams.get("locality") ?? undefined;
    const sealId = searchParams.get("sealId") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;

    //Validamos el parametro take para la paginación, sino se proporciona o es inválido se asigna un valor por defecto de 20.
    const rawTake = parseInt(searchParams.get("take") ?? "20", 10);
    const take = Number.isNaN(rawTake) || rawTake < 1 ? 20 : Math.min(rawTake, 20);

    //Validamos que los parámetros de búsqueda no sean demasiado largos o inválidos para evitar consultas ineficientes a la base de datos.
    if (q && q.length > 100) {
        return NextResponse.json({ error: { code: "QUERY_TOO_LONG" } }, { status: 400 });
    }
    if (artisanQ && artisanQ.length > 100) {
        return NextResponse.json({ error: { code: "QUERY_TOO_LONG" } }, { status: 400 });
    }
    if (category && !(CATEGORIES as readonly string[]).includes(category)) {
        return NextResponse.json({ error: { code: "INVALID_CATEGORY" } }, { status: 400 });
    }

    //Se contruye el where de la consulta a la base de datos dinámicamente con los filtros proporcionados.
    const where = {
        deletedAt: null,
        status: "ACTIVE" as const,
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
        ...(artisanQ ? { artisan: { name: { contains: artisanQ, mode: "insensitive" as const } } } : {}),
        ...(category ? { category } : {}),
        ...(locality ? { locality } : {}),
        ...(sealId ? { seals: { some: { sealId } } } : {}),
    };

    //Se realiza la consulta a la base de datos con los filtros y paginación.
    try {
        const products = await db.product.findMany({
            take: take + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
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
        });

        const hasMore = products.length > take;
        const items = hasMore ? products.slice(0, take) : products;
        const nextCursor = hasMore ? items[items.length - 1]?.id : null;

        return NextResponse.json({ data: { items, nextCursor, hasMore } });
    } catch (error) {
        const isInvalidCursor =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: string }).code === "P2025";

        if (isInvalidCursor) {
            return NextResponse.json(
                { error: { code: "INVALID_CURSOR" } },
                { status: 400 }
            );
        }
        console.error("[search] Error inesperado:", error);
        return NextResponse.json(
            { error: { code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
