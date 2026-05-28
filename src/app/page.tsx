//Página principal. Redirige a las diferentes rutas dependiendo de si el usuario tiene sesión iniciada y su rol.

import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session?.user) redirect("/login");
  if (session.user.role === "ARTISAN") redirect("/studio/products");
  redirect("/feed");
}
