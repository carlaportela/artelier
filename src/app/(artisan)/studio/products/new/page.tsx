//Página para crear un nuevo producto desde el estudio del artesano. Sólo accesible para usuarios con rol Artesano.

import { redirect } from "next/navigation";

import { getServerSession } from "~/server/auth/session";
import NewProductWizard from "./NewProductWizard";

export default async function NewProductPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  return <NewProductWizard />;
}
