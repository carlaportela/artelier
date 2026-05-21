"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/server/db";

export async function logoutUser() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const sessionToken = cookieStore.get(cookieName)?.value;

  if (sessionToken) {
    try {
      await db.session.delete({ where: { sessionToken } });
    } catch {
      // Sesión ya eliminada o no encontrada — ignorar
    }
  }

  cookieStore.delete(cookieName);
  redirect("/login");
}
