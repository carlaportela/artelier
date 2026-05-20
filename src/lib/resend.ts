import { Resend } from "resend";

import { env } from "~/env";

if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
  console.warn(
    "[Artelier] Resend no configurado: RESEND_API_KEY y/o RESEND_FROM_EMAIL ausentes. " +
      "Los emails transaccionales no funcionarán.",
  );
}

export const resend = new Resend(env.RESEND_API_KEY);
export const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "noreply@artelier.es";
