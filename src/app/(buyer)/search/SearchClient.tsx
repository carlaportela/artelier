//Componente cliente para a página de búsqueda de productos. Se encarga de manejar la lógica de búsqueda, filtros y paginación en el lado del cliente, así como de renderizar los resultados utilizando el componente ProductCard.

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "~/components/ProductCard";
import LocalidadSelect from "~/components/LocalidadSelect";
import { CATEGORIES } from "~/lib/categories";

//Se define el tipo producto que se espera recibir de la base de datos
type Product = {
    id: string;
    name: string;
    priceInCents: number;
    status: "ACTIVE" | "SOLD" | "EXPIRED";
    imageUrls: string[];
    expiresAt: Date | null;
    artisan: { name: string | null; image: string | null };
};

//Se definen los argumentos que se esperan recibir del componente SearchClient
interface SearchClientProps {
    initialProducts: Product[];
    initialNextCursor: string | null;
    initialHasMore: boolean;
    seals: { id: string; name: string }[];
    currentQ: string | null;
    currentArtisanQ: string | null;
    currentCategory: string | null;
    currentLocality: string | null;
    currentSealId: string | null;
}

//Función principal que se encarga de buscar productos, aplicar filtros y manejar la paginación
export default function SearchClient({
    initialProducts,
    initialNextCursor,
    initialHasMore,
    seals,
    currentQ,
    currentArtisanQ,
    currentCategory,
    currentLocality,
    currentSealId,
}: SearchClientProps) {

    const router = useRouter(); //Hook de Next.js para manejar la navegación programática.
    const searchParams = useSearchParams(); //Hooke de Next.js para acceder a los parámetros de búsqueda de la URL.

    const [products, setProducts] = useState<Product[]>(
        initialProducts.map((item) => ({
            ...item,
            expiresAt: item.expiresAt ? new Date(item.expiresAt as unknown as string) : null,
        }))
    );
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [inputQ, setInputQ] = useState(currentQ ?? "");
    const [inputArtisanQ, setInputArtisanQ] = useState(currentArtisanQ ?? "");

    //Se definen las pestañas de búsqueda para indicar al usuario qué tipo de filtro está activo, si es que hay alguno. Si no hay ningún filtro activo, se resalta la pestaña de "nombre" para indicar que la búsqueda se está haciendo por el nombre del producto o del artesano.
    type Tab = "producto" | "artesano" | "categoria" | "localidad" | "sello";
    const TAB_LABELS: Record<Tab, string> = {
        producto: "Producto",
        artesano: "Artesana/o",
        categoria: "Categoría",
        localidad: "Localidad",
        sello: "Sello",
    };
    const [activeTab, setActiveTab] = useState<Tab>(
        currentArtisanQ ? "artesano" : currentCategory ? "categoria" : currentLocality ? "localidad" : currentSealId ? "sello" : "producto"
    );


    // Debounce: Debounce es una técnica que retrasa la ejecución de una función hasta que el usuario deja de hacer algo durante un tiempo determinado; en este caso, cuando la usuaria deja de escribir 300ms
    useEffect(() => {
        if (inputQ === (currentQ ?? "")) return;
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (inputQ) params.set("q", inputQ);
            else params.delete("q");
            router.push(`/search?${params.toString()}`);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputQ]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (inputArtisanQ === (currentArtisanQ ?? "")) return;
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (inputArtisanQ) params.set("artisanQ", inputArtisanQ);
            else params.delete("artisanQ");
            router.push(`/search?${params.toString()}`);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputArtisanQ]); // eslint-disable-line react-hooks/exhaustive-deps

    //Función para aplicar un filtro de búsqueda. Se actualizan los parámetros de la URL con el filtro seleccionado, lo que a su vez dispara una nueva búsqueda con los nuevos criterios.
    function applyFilter(key: string, value: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.push(`/search?${params.toString()}`);
    }

    //Función para cargar más productos cuando se hace click en el botón de "Cargar más".
    async function loadMore() {
        if (!nextCursor || isLoading) return;
        setIsLoading(true);
        setLoadError(false);
        try {
            const params = new URLSearchParams();
            params.set("cursor", nextCursor);
            if (currentQ) params.set("q", currentQ);
            if (currentArtisanQ) params.set("artisanQ", currentArtisanQ);
            if (currentCategory) params.set("category", currentCategory);
            if (currentLocality) params.set("locality", currentLocality);
            if (currentSealId) params.set("sealId", currentSealId);

            const res = await fetch(`/api/search?${params.toString()}`);
            if (!res.ok) throw new Error("Error al cargar más productos");

            const json = await res.json() as {
                data: { items: Product[]; nextCursor: string | null; hasMore: boolean };
            };

            setProducts((prev) => [
                ...prev,
                ...json.data.items.map((item) => ({
                    ...item,
                    expiresAt: item.expiresAt ? new Date(item.expiresAt as unknown as string) : null,
                })),
            ]);
            setNextCursor(json.data.nextCursor);
            setHasMore(json.data.hasMore);
        } catch {
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">

            {/* Chips de filtros activos */}
            {(currentQ ?? currentArtisanQ ?? currentCategory ?? currentLocality ?? currentSealId) && ( //Si hay algún filtro activo, se muestra el botón de "Limpiar filtros" y los chips de los filtros activos para que la usuaria pueda ver qué filtros tiene aplicados y quitarlos fácilmente si lo desea.
                <div className="flex flex-wrap gap-2">
                    {currentQ && ( 
                        <span className="flex items-center gap-1.5 rounded-full bg-[#3d5a4f]/55 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#3d5a4f]/40">
                            {currentQ}
                            <button type="button" onClick={() => applyFilter("q", null)} className="cursor-pointer leading-none">×</button>
                        </span>
                    )}
                    {currentArtisanQ && (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#3d5a4f]/55 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#3d5a4f]/40">
                            {currentArtisanQ}
                            <button type="button" onClick={() => applyFilter("artisanQ", null)} className="cursor-pointer leading-none">×</button>
                        </span>
                    )}
                    {currentCategory && (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#3d5a4f]/55 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#3d5a4f]/40">
                            {currentCategory}
                            <button type="button" onClick={() => applyFilter("category", null)} className="cursor-pointer leading-none">×</button>
                        </span>
                    )}
                    {currentLocality && (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#3d5a4f]/55 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#3d5a4f]/40">
                            {currentLocality}
                            <button type="button" onClick={() => applyFilter("locality", null)} className="cursor-pointer leading-none">×</button>
                        </span>
                    )}
                    {currentSealId && (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#3d5a4f]/55 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#3d5a4f]/40">
                            {seals.find((s) => s.id === currentSealId)?.name ?? "Sello"}
                            <button type="button" onClick={() => applyFilter("sealId", null)} className="cursor-pointer leading-none">×</button>
                        </span>
                    )}
                </div>
            )}

            {/* Pestañas de filtros */}
            <div>
                <div className="flex border-b border-[--border]">
                    {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`-mb-px flex-1 cursor-pointer border-b-[3px] pb-3 text-center text-sm font-medium transition-colors ${
                                activeTab === tab
                                    ? "border-[#3d5a4f] text-[#3d5a4f] font-semibold"
                                    : "border-transparent text-[--text-muted] hover:text-[#3d5a4f]/70"
                            }`}
                        >
                            {TAB_LABELS[tab]}
                        </button>
                    ))}
                </div>

                <div className="pt-4">
                    {activeTab === "producto" && (
                        <input
                            type="text"
                            value={inputQ}
                            onChange={(e) => setInputQ(e.target.value)}
                            placeholder="Buscar por nombre de producto..."
                            className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] outline-none focus-visible:border-[#3d5a4f]"
                        />
                    )}

                    {activeTab === "artesano" && (
                        <input
                            type="text"
                            value={inputArtisanQ}
                            onChange={(e) => setInputArtisanQ(e.target.value)}
                            placeholder="Buscar por nombre de artesana/o..."
                            className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] outline-none focus-visible:border-[#3d5a4f]"
                        />
                    )}

                    {activeTab === "categoria" && (
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => applyFilter("category", currentCategory === cat ? null : cat)}
                                    disabled={currentCategory === cat}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                        currentCategory === cat
                                            ? "cursor-not-allowed border border-[--border] bg-[#ccc8bc]/50 text-[--text]"
                                            : "cursor-pointer border border-[--border] text-[--text] hover:bg-[#ccc8bc]/50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === "localidad" && (
                        <LocalidadSelect
                            value={currentLocality ?? ""}
                            onChange={(value) => applyFilter("locality", value || null)}
                            placeholder="Buscar por localidad..."
                        />
                    )}

                    {activeTab === "sello" && (
                        <div className="flex flex-wrap gap-2">
                            {seals.length === 0 ? (
                                <p className="text-sm text-[--text-muted]">No hay sellos disponibles aún</p>
                            ) : (
                                seals.map((seal) => (
                                    <button
                                        key={seal.id}
                                        type="button"
                                        onClick={() => applyFilter("sealId", currentSealId === seal.id ? null : seal.id)}
                                        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            currentSealId === seal.id
                                                ? "bg-[#3d5a4f]/55 text-white hover:bg-[#3d5a4f]/40"
                                                : "border border-[--border] text-[--text] hover:bg-[#ccc8bc]/50"
                                        }`}
                                    >
                                        {seal.name}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Resultados */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <p className="text-sm text-[--text-muted]">No existen productos con estos términos de búsqueda</p>
                    {(currentQ ?? currentArtisanQ ?? currentCategory ?? currentLocality ?? currentSealId) && (
                        <button
                            type="button"
                            onClick={() => router.push("/search")}
                            className="cursor-pointer rounded-full bg-[#3d5a4f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={isLoading}
                                className="cursor-pointer rounded-full bg-[#3d5a4f]/55 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d5a4f]/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? "Cargando..." : "Cargar más"}
                            </button>
                            {loadError && (
                                <p className="text-xs text-red-600">No se pudieron cargar más productos. Inténtalo de nuevo.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
