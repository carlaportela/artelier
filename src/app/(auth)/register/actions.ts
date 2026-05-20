"use server";

import { hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "generated/prisma";

import { db } from "~/server/db";
import { registerSchema } from "~/lib/validations/auth";

export async function registerUser(data: unknown) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { email, password, locality, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: {
        code: "EMAIL_EXISTS" as const,
        field: "email",
        message: "Este email ya está registrado",
      },
    };
  }

  const hashedPassword = await hash(password, 12);

  // Auth.js v5 no permite Credentials + database sessions vía signIn().
  // Creamos la sesión directamente en BD y ponemos la cookie — Auth.js la leerá igual.
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, password: hashedPassword, role, locality },
      });
      await tx.session.create({
        data: { sessionToken, userId: newUser.id, expires },
      });
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: {
          code: "EMAIL_EXISTS" as const,
          field: "email",
          message: "Este email ya está registrado",
        },
      };
    }
    throw e;
  }

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

  redirect(role === "ARTISAN" ? "/studio/dashboard" : "/feed");
}
