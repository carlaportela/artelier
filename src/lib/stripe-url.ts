//Helper con la url de base de Stripe.

import { env } from "~/env";

//Función que devuelve la URL de base.
export function getBaseUrl(): string {
  return (
    env.NEXTAUTH_URL ??
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000")
  );
}