//Menu desplegable para el perfil del usuario que tiene sesión iniciada en la barra de navegación superior.

"use client";//Se renderiza en cliente.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { logoutUser } from "~/app/(auth)/logout/actions";
import { Eye, LogOut, Package, TrendingUp, User } from "lucide-react";

type Props = {
  name: string | null;
  image: string | null;
  role: string;
  userId: string;
  profileHref: string;
};

//Función principal que muestra el menú. Muestra opciones diferentes dependiendo del rol del usuario.
export default function UserMenu({ name, image, role, userId, profileHref }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const close = () => setOpen(false);

  const linkClass =
    "flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]";
  const iconClass = "shrink-0 text-[--text-muted]";
  const divider = <div className="mx-3 my-1 border-t border-[--border]" />;

  return (
    <div ref={ref} className="relative">
      {/* Avatar / botón */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menú de usuario"
        className="rounded-full cursor-pointer opacity-100 transition-opacity hover:opacity-70"
      >
        {image ? (
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[--border]">
            <Image src={image} alt={name ?? "Mi perfil"} fill className="object-cover" />
          </div>
        ) : (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border font-display text-base leading-none ${
              role === "ARTISAN"
                ? "border-[#94a49e]/50 bg-[#94a49e] text-white"
                : "border-[#e8d5be] bg-[#f5e8d8] text-[#c4956a]"
            }`}
          >
            <span className="translate-y-0.5">{name?.charAt(0).toUpperCase() ?? "?"}</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-4 w-52 rounded-xl border border-[--border] bg-[#eae5da] py-1 shadow-lg">
          {role === "ARTISAN" ? (
            <>
              <Link href={`/artisan/${userId}`} onClick={close} className={linkClass}>
                <Eye size={14} className={iconClass} />
                Perfil público
              </Link>
              <Link href="/studio/estadisticas" onClick={close} className={linkClass}>
                <TrendingUp size={14} className={iconClass} />
                Estadísticas
              </Link>
              <Link href="/studio/pedidos" onClick={close} className={linkClass}>
                <Package size={14} className={iconClass} />
                Pedidos
              </Link>
              {divider}
            </>
          ) : (
            <>
              <Link href={profileHref} onClick={close} className={linkClass}>
                <User size={14} className={iconClass} />
                Mi perfil
              </Link>
              {divider}
            </>
          )}

          <form action={logoutUser} className="contents">
            <button type="submit" className={`${linkClass} w-full`}>
              <LogOut size={14} className={iconClass} />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
