//Página a la que llama Stripe cuando el enlace de onboarding ha expirado para generar un nuevo enlace y redirigir a la artesana sin que ella note nada.

import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { stripe } from "~/lib/stripe";
import { getBaseUrl } from "~/lib/stripe-url";


//Función principal
export default async function StripeRefreshPage() {
  //Comprueba si el usuario está autenticado y sino lo redirige a la página de login para iniciar sesión.
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  //Realiza la consulta a la base de datos con el id del usuario y toma el id de la cuenta de Stripe.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true },
  });

  //Si no tiene cuenta de Stripe lo redirige a /studio/products/new (no hay nada que refrescar)
  if (!user?.stripeAccountId) redirect("/studio/products/new");

  //Si tiene cuenta genera un nuevo AccountLink con la cuenta existente
  const accountId = user.stripeAccountId;
  const base = getBaseUrl(); //Obtenemos la URL de base de Stripe mediante el helper.

  //comprueba que stripe no es null sino redirigimos a la artesana.
  if (stripe === null) redirect("/studio/products/new");

  //Crea un nuevo enlace de AccountLink que es un enlace temporal y seguro que genera Stripe para llevar a la artesana a su propio formulario de onboarding — donde ella introduce su IBAN, datos fiscales, etc.
  //Ese formulario no se muestra directamente en la app sino que Stripe nos da una URL única que caduca en unos minutos y se redirige a la artesana ahí, donde gestiona todo el proceso seguro y cuando termina se devuelve a return-url.
  //La página refresh_url existe precisamente porque ese enlace caduca. Si la artesana tarda mucho o cierra el navegador a medias, Stripe la manda a refresh_url, y esta página genera un enlace nuevo y la redirige de nuevo sin que tenga que hacer nada.
  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: `${base}/studio/stripe-onboarding`,
    refresh_url: `${base}/studio/stripe-onboarding/refresh`,
    type: "account_onboarding",
  });

  //Redirige a la artesana al onboarding de Stripe
  redirect(link.url);
}
