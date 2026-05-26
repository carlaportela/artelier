//Esta página es para que la artesana pueda editar su perfil público (nombre, localidad, biografía, foto de perfil y portada)

import { redirect } from "next/navigation";
import type { Metadata } from "next"; //Para definir el título de la página en el navegador.

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import StudioProfileEditor from "./StudioProfileEditor"; //Componente para editar el perfil público del artesano (nombre, localidad y biografía)
import AccountSettings from "~/components/account/AccountSettings"; //Componente para mostrar opciones de configuración de cuenta (cambiar contraseña, eliminar cuenta...)

//Metadata para definir el título de la página
export const metadata: Metadata = { title: "Mi perfil — Artelier" };

//Función principal de la página de perfil de estudio, que muestra el editor de perfil y las opciones de configuración.
export default async function StudioProfilePage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const [user, sealRequests] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        bio: true,
        locality: true,
        image: true,
        bannerImage: true,
        email: true,
      },
    }),
    db.sealRequest.findMany({
      where: { artisanId: session.user.id, status: "APPROVED", productId: null, deletedAt: null },
      include: { seal: { select: { name: true, type: true } } },
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <main className="bg-[--bg]">
      {/* ── Perfil público ── */}
      <StudioProfileEditor user={user} sealRequests={sealRequests} />

      {/* ── Cuenta ── */}
      <section className="mt-8 space-y-8 px-5">
        <hr className="border-[#ccc8bc]" />

        {/* Email */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[--text-muted]">Correo electrónico</p>
          <div className="w-full rounded-lg border border-[#ccc8bc] bg-black/[0.04] px-3 py-2 text-sm text-[--text-muted]">
            {user.email}
          </div>
        </div>

        <AccountSettings />
      </section>
    </main>
  );
}
