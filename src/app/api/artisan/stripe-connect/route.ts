//Endpoint que inicia el onboarding de Stripe Connect de los artesanos.
//El onboarding es el proceso de crear cuenta en Stripe, verificar la identidad y vincular la cuenta de la artesana a la cuenta de STripe. La aplicación inicia el proceso y Stripe lo gestiona.

import { NextResponse } from "next/server";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { stripe } from "~/lib/stripe";
import { getBaseUrl } from "~/lib/stripe-url";
import { stripeConnectLimiter } from "~/lib/ratelimit";

//Lista blanca de páginas a las que se puede volver tras el onboarding — nunca se usa un valor
//recibido del cliente sin validar contra esta lista, para evitar un redirect abierto.
const ALLOWED_RETURN_PATHS = ["/studio/orders", "/studio/profile"];

export async function POST(req: Request) {
  //Se comprueba que el usuario esté autenticado, sino se devuelve el mensaje de error correspondiente.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión" } },
      { status: 401 },
    );
  }

  //Se limita el número de peticiones por usuario para no agotar la cuota de la API de Stripe.
  const { success } = await stripeConnectLimiter.limit(session.user.id);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" } },
      { status: 429, headers: { "Retry-After": "300" } },
    );
  }

  //Se comprueba que el usuario autenticado tiene el rol de artesana, sino se devuelve el mensaje correspondiente.
  if (session.user.role !== "ARTISAN") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message:
            "Sólo las artesanas y artesanos pueden acceder a esta función",
        },
      },
      { status: 403 },
    );
  }

  //Se comrpueba si Stripe está configurado, sino se lanza el error correspondiente.
  if (stripe === null) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Servicio de pagos no configurado",
        },
      },
      { status: 503 },
    );
  }

  //Se guarda el id del usuario.
  const userId = session.user.id;

  //Se obtienen el id de la cuenta de Stripe y el correo del usuario de la base de datos.
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true, email: true },
  });

  //Si id de la cuenta de Stripe es null o undefined (el usuario no tiene cuenta de Stripe) crea una nueva, sino toma el id de la cuenta existente.
  const accountId =
    user?.stripeAccountId ??
    (
      await stripe.accounts.create({
        type: "express",
        country: "ES",
        email: user?.email ?? undefined,
      })
    ).id;

  //Se comprueba si existe id de cuenta de Stripe guardada y sino la había la guarda (solo guarda el id en base de datos en cuentas recién creadas)
  if (!user?.stripeAccountId) {
    await db.user.update({
      where: { id: userId },
      data: { stripeAccountId: accountId },
    });
  }

  //Se comprueba a qué página quiere volver la artesana tras conectar — solo se acepta si está en
  //la lista blanca, sino se usa la página genérica de siempre por defecto.
  const body = (await req.json().catch(() => ({}))) as { returnTo?: unknown };
  const returnTo =
    typeof body.returnTo === "string" && ALLOWED_RETURN_PATHS.includes(body.returnTo)
      ? body.returnTo
      : "/studio/stripe-onboarding";

  //Se genera AccountLink para redirigir a la artesana al onboarding de Stripe
  const base = getBaseUrl(); //Obtenemos la base URL del helper.

  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: `${base}${returnTo}?stripeConnected=1`,
    refresh_url: `${base}/studio/stripe-onboarding/refresh`,
    type: "account_onboarding",
  });

  //Se devuelve el la url de la cuenta de Stripe
  return NextResponse.json({ data: { url: link.url } });
}
