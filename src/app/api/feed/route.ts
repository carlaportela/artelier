//Endpoiint del feed de productos de compradores, realiza peticiones asíncronas a la base de datos para obtener los productos con paginación basada en cursor, que devuelve los productos activos de los artesanos que el comprador sigue, ordenados por fecha de creación descendente. Si el usuario no está autenticado o no tiene el rol de "BUYER", devuelve un error de autorización.
//Cuando se hace una petición GET al servidor, se obtienen los datos en formato JSON, incluyendo los productos, el cursor para la siguiente paginación y un indicador de si hay más productos disponibles.
import { NextResponse } from "next/server";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

export async function GET(req: Request) {

    //Se obtiene la sesión del usuario. Sino está autenticado o no tiene el rol de comprador se devuelve un error de autorización.
    const session = await getServerSession();

    if (!session?.user || session?.user.role !== "BUYER") {
        return NextResponse.json(
        { error: { code: "UNAUTHORIZED" } },
        { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url); //req.url es la URL completa de la petición y searchParams la parsea para obtener los parámetros de búsqueda (en este caso el cursor de la paginación)
    const cursor = searchParams.get("cursor") ?? undefined; //Si no hay cursor en la URL devuelve null y el ?? undefined lo convierte en undefined que es lo que Prisma espera si no hay cursor.
    const take = 20; //Cantidad de productos a obtener por página.

    const products = await db.product.findMany({
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
        where: {
        deletedAt: null,
        status: "ACTIVE",
        artisan: {
            followers: {
            some: { followerId: session.user.id },
            },
        },
        },
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

    const hasMore = products.length > take; //Se se obtienen más productos de los que se necesitan, significa que hay más productos disponibles para la paginación (devuelve true).
    const items = hasMore ? products.slice(0, take) : products; //Si hay más productos disponibles, se devuelve solo la cantidad solicitada, sino se devuelven todos los productos obtenidos.
    const nextCursor = hasMore ? items[items.length - 1]?.id : null; //Si hay más productos disponibles, se establece el cursor para la siguiente paginación.

    //Se devuelve la respuesta en formato JSON: productos, cursor para la siguiente paginación y si hay más prductos disponibles (true o false).
    return NextResponse.json({ data: { items, nextCursor, hasMore } });
}
