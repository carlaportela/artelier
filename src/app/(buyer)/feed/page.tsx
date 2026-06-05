//Página de feed para compradores, muestra los productos de los artesanos que siguen, con paginación y manejo de estados para cuando no siguen a nadie o no hay productos publicados.

import { redirect } from "next/navigation"; //Redirige a la página de inicio si el usuario no está autenticado o si es un artesano, ya que esta página es solo para compradores.
import { getServerSession } from "~/server/auth/session"; //Obtiene la sesión de usuario para verificar si está o no autenticado y su rol.
import { db } from "~/server/db"; //Importa la instancia de la base de datos para realizar consultas a los productos y seguidores.
import FeedClient from "./FeedClient";
import Link from "next/link";


export default async function FeedPage() {

    //Verifica la sesión del usurio
    const session = await getServerSession();

    //Si no hay sesión lo redirige al catálogo público y si es de rol artesano lo redirige a su página de productos.
    if (!session?.user) redirect("/");
    if (session.user.role === "ARTISAN") redirect("/studio/products");

    //Cuenta cuantos artesanos sigue el usuario, sino sigue a ninguno muestra un mensaje invitándolo a descubrir artesanos y si sigue a alguno pero no tiene productos publicados, muestra el mensaje correspondiente.
    const followCount = await db.follow.count({
        where: { followerId: session.user.id },
    });

    if (followCount === 0) {
        return (
        <main className="px-4 py-8">
            <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-[--text]">Todavía no sigues a ninguna artesana o artesano</p>
            <Link
                href="/search"
                className="rounded-full bg-[#3d5a4f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
            >
                Descubrir cerca de mí
            </Link>
            </div>
        </main>
        );
    }

    //Si se sigue a algún usuario consulta los productos de los artesanos que sigue el usuario y obtiene 20 productos para mostrar en la primera carga en orden descendente por fecha de creación.
    const take = 20;
    const products = await db.product.findMany({
        take: take + 1,
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

    //Determina si hay más productos para cargar y si es asi, prepara los productos iniciales y el cursor para la paginación. Si no hay más productos simplemente muestra los que se cargaron.
    const hasMore = products.length > take;
    const initialProducts = hasMore ? products.slice(0, take) : products;
    const initialNextCursor = hasMore ? initialProducts[initialProducts.length - 1]?.id : null;

    if (initialProducts.length === 0) {
        return (
        <main className="px-4 py-8">
            <p className="py-20 text-center text-sm text-[--text-muted]">
            Las artesanas y artesanos que sigues aún no tienen productos publicados
            </p>
        </main>
        );
    }

    return (
        <main className="px-4 py-8">
            <h1 className="font-display text-center text-3xl font-bold text-[--text]">
                ¿Qué es lo último?
            </h1>
            <p className="mt-1 text-sm text-[--text-muted] text-center mb-6">
                Novedades de las artesanas y artesanos que te gustan
            </p>
        <FeedClient
            initialProducts={initialProducts}
            initialNextCursor={initialNextCursor ?? null}
            initialHasMore={hasMore}
        />
        </main>
    );
}
