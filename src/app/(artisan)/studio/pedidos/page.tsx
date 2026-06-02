//Página de pedidos del estudio — placeholder hasta que se implemente el sistema de pagos (Épica 5).

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
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 font-display text-xl font-bold text-[--text]">Pedidos</h1>

        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3d5a4f]/10">
            <Package className="h-7 w-7 text-[#3d5a4f]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display text-base font-bold text-[--text]">
              Aquí verás tus pedidos
            </p>
            <p className="mt-2 max-w-xs text-sm text-[--text-muted]">
              Cuando una compradora realice un pedido desde tu perfil, aparecerá aquí con todos los
              detalles: producto, importe, estado y datos de envío.
            </p>
            <p className="mt-3 text-xs text-[--text-muted]">
              La gestión de pedidos estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
