import Link from "next/link";
import Image from "next/image";

import { getServerSession } from "~/server/auth/session";
import ArtelierLogo from "~/components/ArtelierLogo";

export default async function AppHeader() {
  const session = await getServerSession();
  const user = session?.user;
  const profileHref = user?.role === "ARTISAN" ? "/studio/profile" : "/account";
  const homeHref = user
    ? user.role === "ARTISAN"
      ? "/studio/profile"
      : "/feed"
    : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-[--border] bg-[--bg]/95 backdrop-blur-sm">
      <div className="mx-auto grid h-14 max-w-lg grid-cols-[1fr_auto_1fr] items-center px-4">

        {/* Columna izquierda — vacía, misma anchura que la derecha para centrar el logo */}
        <div />

        {/* Columna central — logo siempre centrado */}
        <Link href={homeHref} aria-label="Artelier — inicio">
          <ArtelierLogo width={80} height={46} />
        </Link>

        {/* Columna derecha — avatar o botón Entrar */}
        <div className="flex justify-end">
          {user ? (
            <Link href={profileHref} aria-label="Mi perfil">
              {user.image ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[--border]">
                  <Image
                    src={user.image}
                    alt={user.name ?? "Mi perfil"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[--border] bg-[--surface] text-sm font-medium text-[--text]">
                  {user.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#c4956a] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#b5894e]"
            >
              Entrar
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
