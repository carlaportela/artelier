//Página que tras el onboarding de Stripe mostrará un mensaje de éxito o de error a la artesana.

import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import StripeConnectButton from "~/components/StripeConnectButton";

//Función principal que renderiza la página.
export default async function StripeOnboardingPage() {
  //Comprueba que el usuario esté autenticado y sino lo redirige a login para que inicie sesión.
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  //Realiza la consulta a la base de datos con el id del usuario y toma el id de la cuenta de Stripe.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true },
  });

  //Si no tiene cuenta de Stripe muestra el resultado y un botón para volver a realizar el onboarding
  if (!user?.stripeAccountId) {
    return (
      <main className="flex flex-col items-center gap-4 p-8">
        <p>El proceso está pendiente. Vuelve a intentarlo.</p>
        <StripeConnectButton />
      </main>
    );
  }

  //Si tiene cuenta muestra el mensaje de éxito y el enlace para volver a su catálogo de productos.
  return (
    <main className="flex flex-col items-center gap-4 p-8">
      <p>Tu cuenta bancaria está conectada. Ya puedes vender.</p>
      <Link href="/studio/products">Ir a mis productos</Link>
    </main>
  );
}
