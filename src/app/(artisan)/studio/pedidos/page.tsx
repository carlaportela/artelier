//Página de pedidos del estudio del artesano.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Package } from "lucide-react";

import { getServerSession } from "~/server/auth/session";

export const metadata: Metadata = { title: "Pedidos — Artelier" };

export default async function PedidosPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  return (
    <main className="bg-[--bg]">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3d5a4f]/10">
          <Package size={28} className="text-[#3d5a4f]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[--text]">Pedidos</h1>
        <p className="max-w-xs text-sm text-[--text-muted]">
          Aquí aparecerán los pedidos que recibas de tus clientes: estado, detalles y gestión de envíos.
          <br /><br />
          Próximamente.
        </p>
      </div>
    </main>
  );
}
