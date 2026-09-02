"use client";

//Tarjeta "Seguridad" de Mi cuenta: agrupa cambiar contraseña y eliminar cuenta, cada una tras su
//propio botón de toggle. Reutiliza PasswordSection/DeleteSection ya construidas para el estudio
//de la artesana (AccountSettings.tsx) — misma lógica de formulario, sin duplicarla aquí.

import { useState } from "react";
import { PasswordSection, DeleteSection } from "~/components/account/AccountSettings";

type Section = "password" | "delete" | null;

export default function SecuritySection() {
  const [active, setActive] = useState<Section>(null);

  //El botón activo no se puede volver a pulsar para cerrar — se cierra con "Cancelar".
  function toggle(section: Section) {
    if (active === section) return;
    setActive(section);
  }

  return (
    <div className="space-y-4">
      <p className="font-display text-base font-bold text-[--text] md:text-lg">Seguridad</p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => toggle("password")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium text-white transition-all ${
            active === "password"
              ? "cursor-default bg-[#3d5a4f] opacity-75 shadow-inner"
              : "cursor-pointer bg-[#3d5a4f] transition-colors hover:bg-[#4a6b5e]"
          }`}
        >
          Cambiar contraseña
        </button>
        <button
          type="button"
          onClick={() => toggle("delete")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium text-white transition-all ${
            active === "delete"
              ? "cursor-default bg-red-700 opacity-60 shadow-inner"
              : "cursor-pointer bg-red-700 hover:bg-red-600"
          }`}
        >
          Eliminar cuenta
        </button>
      </div>

      {active === "password" && <PasswordSection onClose={() => setActive(null)} />}
      {active === "delete" && <DeleteSection onClose={() => setActive(null)} role="BUYER" />}
    </div>
  );
}
