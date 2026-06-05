//Componente que renderiza la lista de productos del feed del comprador.

"use client";

import { useState } from "react"; //Utiliza los estados para manejar la lista de productos, el cursor para la paginación y el estado de carga.
import ProductCard from "~/components/ProductCard"; //Utiliza el componente ProductCard para mostrar cada producto.

//Define el tipo Producto que se va a recibir del servidor, con sus respectivos campos y tipos de datos.
type Product = {
  id: string;
  name: string;
  priceInCents: number;
  status: "ACTIVE" | "SOLD" | "EXPIRED";
  imageUrls: string[];
  expiresAt: Date | null;
  artisan: { name: string | null; image: string | null };
};

//Define la interfaz de los argumentos que recibe el componente FeedClient, con el tipo de datos de cada uno de ellos: un array de productos, un cursor que puede ser de tipo string o null y un booleano.
interface FeedClientProps {
  initialProducts: Product[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}

//Función principal que recibe los argumentos definidos en la interfaz.
export default function FeedClient({
    initialProducts,
    initialNextCursor,
    initialHasMore,
    }: FeedClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    
    //Función asíncrona que se encarga de cargar más productos cuando el usuario hace clic en el botón de "Cargar más".
    async function loadMore() {

        //Si no hay cursor o si ya se está cargando, no hace nada. Sino establece el estado de carga a true para indicar que se está cargando
        if (!nextCursor || isLoading) return;
        setIsLoading(true);

        //Hace petición al servidor para obtener más productos, pasando el cursor como parámetro. Luego actualiza el estado de productos, el cursor y el indicador de si hay más productos o no. Finalmente, establece el estado de carga a false para indicar que ya se ha terminado de cargar.
        try {
        const res = await fetch(`/api/feed?cursor=${nextCursor}`);
        if (!res.ok) {
            throw new Error("Error al cargar más productos");
        }
        const json = await res.json() as {
            data: { items: Product[]; nextCursor: string | null; hasMore: boolean };
        };

        //Operador de propagación (spread operator) para crear un nuevo array de productos que incluye los anteriores y los nuevos productos obtenidos del servidor en formato JSON (desempaqueta todos los elementos dentro del array, para no introducir un array dentro de un array)..
        //"=>" es una función flecha que se utiliza para definir una función anónima de manera más concisa. En este caso se utiliza para que la función que se pasa a setProducts reciba el estado anterior (prev) y retorne un nuevo array que combine el estado anterior con los nuevos productos obtenidos del servidor.
        setProducts((prev) => [
            ...prev, 
            ...json.data.items.map((item) => ({
                ...item,
                expiresAt: item.expiresAt ? new Date(item.expiresAt) : null, //Convierte la fecha que recibe del JSON en formato string a Date que el tipo de dato que espera el producto. Si expiresAt es null, se mantiene como null.
            })),
        ]);
        
        /*Forma larga (función normal):
            setProducts(function(prev) {
            return [...prev, ...json.data.items];
            });

            // Forma corta (función flecha):
            setProducts((prev) => [...prev, ...json.data.items]);
        */ 
       
        setNextCursor(json.data.nextCursor);
        setHasMore(json.data.hasMore);
        } finally {
        setIsLoading(false);
        }
    }

    //Renderiza la lista de productos. Si hay más productos para cargar, muestra el botón de "Cargar más" o deactiva el botón si está cargando.
    return (
        <div className="space-y-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {products.map((product) => (
            <ProductCard key={product.id} product={product} />
            ))}
        </div>

        {hasMore && (
            <div className="flex justify-center">
            <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="cursor-pointer rounded-full bg-[#3d5a4f]/55 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d5a4f]/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoading ? "Cargando..." : "Cargar más"}
            </button>
            </div>
        )}
        </div>
    );
}
