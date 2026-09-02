//Componente de navegación inferior para la compradora, con enlaces a pedidos, publicaciones, mensajes y perfil.

"use client";//Se renderiza en cliente.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Images, Home, MessageCircle, User } from "lucide-react";

//Función para cada elemento de navegación, que recibe la ruta, el icono, la etiqueta y se está activo o no para aplicar estilos condicionales.
function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={active ? (e) => e.preventDefault() : undefined}
      className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center transition-colors ${
        active
          ? "cursor-default text-[#c4956a]"
          : "cursor-pointer text-[--text-muted] hover:text-[#c4956a]"
      }`}
    >
      <Icon size={24} strokeWidth={active ? 2 : 1.5} />
    </Link>
  );
}

//Barra de navegación inferior para la compradora: pedidos, publicaciones, inicio (búsqueda), mensajes y perfil.
//El chat de conversación es pantalla completa — sin bottom nav, igual que ConditionalFooter oculta el footer ahí.
export default function BuyerBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/messages/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-[#f4f0e8] lg:hidden">
      <div className="mx-auto flex h-16 w-full max-w-lg md:max-w-2xl lg:max-w-4xl items-center justify-around px-2">
        <NavItem
          href="/orders"
          icon={Package}
          label="Pedidos"
          active={pathname.startsWith("/orders")}
        />
        {/* TODO: apunta a /feed de forma temporal hasta que se diseñe el feed agregado de
        publicaciones de las artesanas seguidas — de momento /feed muestra sus productos. */}
        <NavItem
          href="/feed"
          icon={Images}
          label="Publicaciones"
          active={pathname.startsWith("/feed")}
        />
        <Link
          href="/search"
          aria-label="Inicio"
          aria-current={pathname.startsWith("/search") ? "page" : undefined}
          onClick={pathname.startsWith("/search") ? (e) => e.preventDefault() : undefined}
          className={`-mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md transition ${
            pathname.startsWith("/search")
              ? "cursor-default bg-[#c4956a]"
              : "cursor-pointer bg-[#3d5a4f] hover:scale-110 hover:bg-[#c4956a] active:scale-95"
          }`}
        >
          <Home size={24} />
        </Link>
        <NavItem
          href="/messages"
          icon={MessageCircle}
          label="Mensajes"
          active={pathname.startsWith("/messages")}
        />
        <NavItem
          href="/account"
          icon={User}
          label="Mi perfil"
          active={pathname.startsWith("/account")}
        />
      </div>
    </nav>
  );
}
