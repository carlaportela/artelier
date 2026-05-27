//Página de mensajes del estudio del artesano.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { getServerSession } from "~/server/auth/session";

export const metadata: Metadata = { title: "Mensajes — Artelier" };

export default async function MensajesPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  return (
    <main className="bg-[--bg]">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3d5a4f]/10">
          <MessageCircle size={28} className="text-[#3d5a4f]" />
        </div>
        <h1 className="font-display text-xl font-bold text-[--text]">Mis mensajes</h1>
        <p className="max-w-xs text-sm text-[--text-muted]">
          Aquí podrás comunicarte directamente con tus clientes: consultas, pedidos personalizados y seguimiento de envíos.
          <br /><br />
          Próximamente.
        </p>
      </div>
    </main>
  );
}
