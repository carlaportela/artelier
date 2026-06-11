//Footer de páginas públicas: aparece en páginas de autenticación y en el área de compradora.
//El estudio de artesana no tiene footer (usa ArtisanBottomNav en su lugar).

import Link from "next/link";
import ArtelierLogo from "~/components/ArtelierLogo";

const LEGAL_LINKS = [
  { href: "/quienes-somos",  label: "Quiénes somos"     },
  { href: "/aviso-legal",    label: "Aviso legal"        },
  { href: "/privacidad",     label: "Privacidad"         },
  { href: "/cookies",        label: "Cookies"            },
  { href: "/condiciones",    label: "Condiciones de uso" },
  { href: "/contacto",       label: "Contacto"           },
] as const;

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[--border] bg-[#f4f0e8] pb-5 pt-3">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 text-center md:max-w-2xl lg:max-w-4xl">

        {/* Logo + nombre */}
        <Link href="/" aria-label="Artelier — inicio" className="flex flex-col items-center gap-1 opacity-70 transition-opacity hover:opacity-100">
          <ArtelierLogo width={48} height={28} />
          <span className="font-display text-lg text-[#3d5a4f]">Artelier</span>
        </Link>

        {/* Enlaces legales */}
        <nav aria-label="Información legal" className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
          {LEGAL_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-[--text-muted] transition-colors hover:text-[#c4956a]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-[--text-muted]">
          © {year} Artelier. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}
