//Página de estadísticas del estudio del artesano. 

import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import { requireArtisanSession } from "~/server/auth/guards";

export const metadata: Metadata = { title: "Estadísticas — Artelier" };

export default async function EstadisticasPage() {
  await requireArtisanSession();

  return (
    <main className="bg-background">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp size={28} className="text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Estadísticas</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Aquí podrás ver visitas a tu perfil, rendimiento de tus productos y tendencias de venta.
          <br /><br />
          Próximamente.
        </p>
      </div>
    </main>
  );
}
