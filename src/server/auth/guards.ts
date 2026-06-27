import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";

// Guard para acciones del estudio: exige sesión y rol ARTISAN.
// Redirige (no devuelve error) para encajar con el flujo de los server actions
// de /studio, que asumen una sesión de artesana ya presente. Devuelve la sesión
// ya estrechada (session.user garantizado) para usarla a continuación.
export async function requireArtisanSession() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/");
  return session;
}
