//Página de cierre de sesión. Elimina la sesión del usuario y redirige a la página de login.

"use server"; //Se renderiza en el servidor.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/server/db";

//Función que se ejecuta al enviar el formularioo de cierre de sesión. Eliminamos la sesión del usuario y redirigimos a la página del usuario sin usar auth.js para evitar problemas con la invalidación de sesiones.
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

  cookieStore.delete(cookieName); //Eliminamos la cookie de sesión del navegador.
  redirect("/login"); //Redirigimos a login.
}
