//Componente de navegación inferior para el estudio de artesano, con enlaces a productos, perfil y creación de nuevo producto. Visible solo bajo rutas /studio

"use client"; //Este componente se renderiza en el cliente

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Plus, User } from "lucide-react";

//Función auxiliar para renderizar cada item de navegación, con su icono, etiqueta y estado actual.
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
      className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
        active ? "text-[#3d5a4f]" : "text-[--text-muted] hover:text-[--text]"
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2 : 1.5} />
      <span className="text-[10px] font-medium">{label}</span>
      {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-[#3d5a4f]" />}
    </Link>
  );
}

//Función principal del componente de navegación inferior, que muestra enlaces a productos, perfil y creación de nuevo producto.
export default function ArtisanBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-[--bg]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        <NavItem
          href="/studio/products"
          icon={ShoppingBag}
          label="Mis productos"
          active={pathname.startsWith("/studio/products") && !pathname.includes("/new")}
        />
        <Link
          href="/studio/products/new"
          aria-label="Publicar producto"
          className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={24} />
        </Link>
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
