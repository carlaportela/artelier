//Página de checkout para finalizar la compra de un producto.

import { redirect } from "next/navigation"; //Para redirigir a la página de login si no hay sesión.
import Link from "next/link"; //Para el enlace de volver a catálogo en caso de error.
import { getServerSession } from "~/server/auth/session"; //Para comprobar si el usuario está autenticado y determinar su sesión.
import { db } from "~/server/db"; //Para las consultas a la base de datos.
import CheckoutForm from "./CheckoutForm"; //Para el componente de formulario de finalizar compra.

//Función principal de finalizar compra.
export default async function CheckoutPage({
  searchParams, //Prop de Next.js que pasa automáticamente a los Server Components de la página, para los parámetros GET de a URL.
}: {
  searchParams: Promise<{ productId?: string }>; //El id del producto se pasa por GETen la url
}) {
  const { productId } = await searchParams;

  //Se obtiene la información de sesión y si el usuario no está autenticado se redirige a iniciar sesión.
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  //Si no existe el id de producto se redirige al feed
  if (!productId) redirect("/feed");

  //Se realiza la consulta a la base de datos del id del producto para comprobar que este activo y no se haya borrado.
  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      type: true,
      artisan: { select: { stripeAccountId: true} },
    },
  });

  //Si el producto no existe o no existe una cuenta de Stripe asociada al artesano que creo el producto se lanza un mensaje de advertencia de que el producto no está disponible y se muestra un enlace para volver al catálogo.
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (product === null || product.artisan.stripeAccountId === null) {
    return (
      <main className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-lg font-medium text-[--text]">
          Este producto no está disponible
        </p>
        <Link href="/feed" className="text-sm text-[--text-muted] underline">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  //Sino se muestra el formulario para finalizar compra (Usuario autenticado y producto disponible con cuenta de Stripe de artesano asociada).
  return <CheckoutForm product = {product} />;
}
