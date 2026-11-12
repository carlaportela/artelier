//Sticker sheet de Artelier — catálogo vivo de tokens y componentes.
//
//POR QUÉ ESTÁ DENTRO DE LA APP Y NO EN UN FIGMA O UN PDF:
//los componentes que se ven aquí son los de verdad, importados de ~/components. Si cambias
//un botón, esta hoja cambia con él. Una hoja que vive aparte se queda obsoleta en una semana
//y entonces miente, que es peor que no tenerla.
//
//CÓMO MANTENERLA: cada vez que crees un componente reutilizable, añádelo a la sección que le
//toque. Si no sabes en qué sección va, probablemente el componente esté haciendo dos cosas.
//Si una pieza existente tiene dos formas distintas de escribirse en la app, esta hoja documenta
//una sola — la oficial — para que no se vuelva a escribir la otra.
//
//NO SE PUBLICA: la ruta devuelve 404 en producción (ver isProductionDeploy más abajo,
//que funciona dentro y fuera de Vercel) y lleva noindex. Se ve en local y en preview.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BadgeSection,
  BrandSection,
  ButtonSection,
  CardSection,
  FormSection,
} from "./ComponentSections";
import { InteractiveSection } from "./InteractiveSections";
import {
  ColorSection,
  ShapeSection,
  SpacingSection,
  TypographySection,
} from "./TokenSections";

export const metadata: Metadata = {
  title: "Sticker sheet — Artelier",
  description:
    "Catálogo interno de tokens y componentes de la interfaz de Artelier.",
  robots: { index: false, follow: false },
};

const INDICE = [
  { id: "color", label: "Color" },
  { id: "tipografia", label: "Tipografía" },
  { id: "forma", label: "Forma" },
  { id: "espaciado", label: "Espaciado" },
  { id: "botones", label: "Botones" },
  { id: "badges", label: "Badges y sellos" },
  { id: "formularios", label: "Formularios" },
  { id: "tarjetas", label: "Tarjetas" },
  { id: "marca", label: "Marca" },
  { id: "interaccion", label: "Interacción" },
];

//Página interna: no debe existir en el sitio público.
//En Vercel, VERCEL_ENV distingue production de preview/development — ahí basta con él.
//Fuera de Vercel (p. ej. `next build && next start` en otro host) esa variable no existe,
//y entonces NODE_ENV === "production" es la única señal fiable: si no sabemos que es un
//preview, lo tratamos como producción y se bloquea. Así nunca queda expuesta por accidente.
const isProductionDeploy = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

export default function DesignSystemPage() {
  if (isProductionDeploy) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      {/* ─── Portada ─── */}
      <header>
        <p className="font-mono text-[11px] tracking-widest text-[var(--text-light)] uppercase">
          Documento interno
        </p>
        <h1 className="font-display text-foreground mt-1 text-4xl">
          Sticker sheet
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
          Todas las piezas de la interfaz de Artelier en una sola página, con el
          código con el que se escriben. Para cada una, la forma correcta de
          aplicarla y la que hay que evitar, para que la identidad de marca se
          vea igual en cualquier pantalla.
        </p>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Los componentes son los reales, importados de{" "}
          <code>~/components</code>. Esta hoja no tiene copias que mantener: si
          cambias un botón, aquí se ve cambiado.
        </p>
      </header>

      {/* ─── Índice ─── */}
      <nav aria-label="Secciones" className="mt-8 flex flex-wrap gap-1.5">
        {INDICE.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="border-border bg-card text-muted-foreground rounded-full border px-3 py-1 text-xs transition-colors hover:bg-[#3d5a4f]/10 hover:text-[#3d5a4f]"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* ─── Cómo leerla ─── */}
      <div className="bg-card mt-6 rounded-xl border-l-4 border-l-[#3d5a4f] px-4 py-3">
        <p className="text-foreground text-xs leading-relaxed">
          <strong className="font-semibold">Cómo usarla.</strong> Cada ficha
          muestra la pieza arriba y, debajo, cómo se escribe. Antes de maquetar
          una pantalla nueva, busca aquí la pieza que necesitas y cópiala tal
          cual. Si no existe, créala como componente y añádela a esta hoja — no
          la improvises dentro de la pantalla.
        </p>
      </div>

      {/* ─── Secciones ─── */}
      <main className="mt-10 space-y-12">
        <ColorSection />
        <TypographySection />
        <ShapeSection />
        <SpacingSection />
        <ButtonSection />
        <BadgeSection />
        <FormSection />
        <CardSection />
        <BrandSection />
        <InteractiveSection />
      </main>

      <footer className="border-border mt-12 border-t pt-6 text-xs text-[var(--text-light)]">
        <p>
          Fuente de verdad de los tokens: <code>src/styles/globals.css</code>.
          Componentes base: <code>src/components/ui/</code>. Esta hoja:{" "}
          <code>src/app/design-system/</code>.
        </p>
      </footer>
    </div>
  );
}
