//Página para crear un nuevo producto desde el estudio del artesano. Sólo accesible para usuarios con rol Artesano.

import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth/session";
import NewProductWizard from "./NewProductWizard";
import { db } from "~/server/db";
import StripeConnectPrompt from "~/components/StripeConnectPrompt";

//Función principal que muestra el formulario para añadir un nuevo producto pero antes comprueba si existe una cuenta de Stripe del artesano para poder empezar a vender los productos.
export default async function NewProductPage() {
  //Se comprueba si el usuario está autenticado, y en caso de estarlo si su rol es de artesano; sino los redirige a la páginas correspondientes.
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  //Se comprueba si el artesano tiene cuenta en Stripe (stripeAccountId) y sino la tiene se renderiza el componente <StripeConnectPrompt /> que contiene el botón para iniciar el onboarding de Stripe.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true },
  });
  if (!user?.stripeAccountId) {
    return <StripeConnectPrompt />;
  }

  //Si ya existe la cuenta de Stripe muestra el formulario para añadir un nuevo producto.
  return (
    <main className="bg-[--bg]">
      <NewProductWizard />
    </main>
  );
}
