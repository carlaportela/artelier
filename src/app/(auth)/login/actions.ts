"use server";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/server/db";
import { loginSchema } from "~/lib/validations/auth";

export async function loginUser(data: unknown) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  if (!user?.password) {
    return {
      error: {
        code: "INVALID_CREDENTIALS" as const,
      },
    };
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return {
      error: {
        code: "INVALID_CREDENTIALS" as const,
      },
    };
  }

  // Auth.js v5 no permite Credentials + database sessions vía signIn().
  // Creamos la sesión directamente en BD y ponemos la cookie — Auth.js la leerá igual.
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  const isProduction = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set({
    name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
    value: sessionToken,
    expires,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  });

  redirect(user.role === "ARTISAN" ? "/studio/dashboard" : "/feed");
}
