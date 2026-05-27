//Componente de navegación inferior para el estudio del artesano, con enlaces a productos, publicaciones, mensajes y configuración de perfil.

"use client";//Se renderiza en cliente.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Images, Plus, MessageCircle, User } from "lucide-react";

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
      className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center transition-colors ${
        active ? "text-[#c4956a]" : "text-[--text-muted] hover:text-[#c4956a]"
      }`}
    >
      <Icon size={24} strokeWidth={active ? 2 : 1.5} />
    </Link>
  );
}

//Función para la la barra de navegación inferior que muestra los enlaces a productos , publicaciones, mensajes y perfil.
export default function ArtisanBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-[#f4f0e8]">
      <div className="mx-auto flex h-16 w-full max-w-lg md:max-w-2xl lg:max-w-4xl items-center justify-around px-2">
        <NavItem
          href="/studio/products"
          icon={ShoppingBag}
          label="Productos"
          active={pathname.startsWith("/studio/products") && !pathname.includes("/new")}
        />
        <NavItem
          href="/studio/publicaciones"
          icon={Images}
          label="Publicaciones"
          active={pathname.startsWith("/studio/publicaciones")}
        />
        <Link
          href="/studio/products/new"
          aria-label="Publicar producto"
          className={`-mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md transition hover:scale-110 active:scale-95 ${
            pathname.startsWith("/studio/products/new")
              ? "bg-[#c4956a]"
              : "bg-[#3d5a4f] hover:bg-[#c4956a]"
          }`}
        >
          <Plus size={24} />
        </Link>
        <NavItem
          href="/studio/mensajes"
          icon={MessageCircle}
          label="Mensajes"
          active={pathname.startsWith("/studio/mensajes")}
        />
        <NavItem
          href="/studio/profile"
          icon={User}
          label="Mi perfil"
          active={pathname.startsWith("/studio/profile")}
        />
      </div>
    </nav>
  );
}
