//Página que muestra las actualizaciones de un proceso en el perfil del usuario. Cada actualización incluye fecha, contenido y una imagen.

"use client"; //Se renderiza en el cliente.

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ProcessUpdate } from "generated/prisma"; //Componente que muestra una lista de actualizaciones de procesos en el perfil del usuario.

//Definición de las propiedades del componente, que incluye un array de actualizaciones de procesos.
interface ProcessUpdateListProps {
  updates: ProcessUpdate[];
}

//Función que renderiza la lista de actualizaciones de procesos. SI no hay actualizaciones, muestra un mensaje indicándolo y si las hay, muestra cada una con fecha, contenido e imagen.
export default function ProcessUpdateList({ updates }: ProcessUpdateListProps) {
  const t = useTranslations("profile");

  if (updates.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[--text-muted]">
        {t("noProcessUpdates")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <div key={update.id} className="space-y-2 rounded-lg border border-[--border] bg-[--surface] p-4">
          <p className="text-xs text-[--text-muted]">
            {new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(update.createdAt))}
          </p>
          <p className="text-sm text-[--text]">{update.content}</p>
          {update.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image src={update.imageUrl} alt={t("processImageAlt")} fill className="object-cover" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
