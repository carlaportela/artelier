//Página del header de la aplicación, que se muestra en la parte superior de todas las páginas. Contiene el logo de Artelier, un enlace a la página de inicio y un menú desplegable de usuario.

import Link from "next/link";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import ArtelierLogo from "~/components/ArtelierLogo";
import UserMenu from "~/components/UserMenu";

//Función de componente para el header de la aplicación, que muestra el logo de Artelier, un enlace a la página de inicio y un menú de usuario o botón de inicio de sesión dependiendo del estado de autenticación del usuario.
export default async function AppHeader() {
  const session = await getServerSession();
  const user = session?.user;
  const profileHref = user?.role === "ARTISAN" ? "/studio/profile" : "/account";

  // La imagen en el JWT puede estar desfasada si el usuario actualizó su perfil.
  // Leemos el campo image directamente de la BD para mostrar siempre la versión actual.
  let freshImage: string | null = user?.image ?? null;
  if (user?.id) {
    const row = await db.user.findUnique({ where: { id: user.id }, select: { image: true } });
    freshImage = row?.image ?? null;
  }
  const homeHref = user
    ? user.role === "ARTISAN"
      ? "/studio/profile"
      : "/feed"
    : "/";

  return (
    <header className="sticky top-0 shrink-0 z-40 border-b border-[--border] bg-[#f4f0e8]">
      <div className="mx-auto grid h-14 w-full max-w-lg md:max-w-2xl lg:max-w-4xl grid-cols-[1fr_auto_1fr] items-center px-4">

        {/* Izquierda — nombre de marca */}
        <Link
          href={homeHref}
          className="font-display text-2xl font-bold text-[#3d5a4f] transition-colors hover:text-[#4a6b5e]"
        >
          Artelier
        </Link>

        {/* Centro — logo */}
        <Link href={homeHref} aria-label="Artelier — inicio">
          <ArtelierLogo width={80} height={46} />
        </Link>

        {/* Derecha — saludo + avatar con menú o botón Entrar */}
        <div className="flex items-center justify-end gap-3">
          {user ? (
            <>
              <span className="font-display text-xl font-bold leading-none translate-y-0.5 text-[--text]">
                {user.name ? `¡Hola, ${user.name.split(" ")[0]}!` : "¡Hola!"}
              </span>
              <UserMenu
                name={user.name ?? null}
                image={freshImage}
                role={user.role}
                profileHref={profileHref}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* En móvil solo "Entrar" — usuarios existentes primero.
                  La página de login tiene enlace a registro para nuevas usuarias. */}
              <Link
                href="/login"
                className="rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="hidden md:block rounded-full border border-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#3d5a4f]/10"
              >
                Registrarme
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
