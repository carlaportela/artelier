//Sticker sheet de Artelier — catálogo vivo de tokens y componentes.
//
//POR QUÉ ESTÁ DENTRO DE LA APP Y NO EN UN FIGMA O UN PDF:
//los componentes que se ven aquí son los de verdad, importados de ~/components. Si cambias
//un botón, esta hoja cambia con él. Una hoja que vive aparte se queda obsoleta en una semana
//y entonces miente, que es peor que no tenerla.
//
//CÓMO MANTENERLA: cada vez que crees un componente reutilizable, añádelo a la sección que le
//toque. Si no sabes en qué sección va, probablemente el componente esté haciendo dos cosas.
//
//NO SE PUBLICA: la ruta devuelve 404 en producción (ver la comprobación de VERCEL_ENV más
//abajo) y lleva noindex. Se ve en local con `npm run dev` y en los despliegues de preview.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuditSection } from "./AuditSection";
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
  { id: "auditoria", label: "Auditoría" },
];

export default function DesignSystemPage() {
  //Página interna: no debe existir en el sitio público. En local y en los preview de Vercel
  //VERCEL_ENV no es "production", así que sí se puede ver.
  if (process.env.VERCEL_ENV === "production") notFound();

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
          código con el que se escriben. Sirve para dos cosas: copiar de aquí en
          vez de improvisar, y ver de un golpe lo que no cuadra.
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
          una pantalla nueva, busca aquí la pieza que necesitas y cópiala. Si no
          existe, créala como componente y añádela a esta hoja — no la
          improvises dentro de la pantalla.
        </p>
      </div>

      <div className="mt-3 rounded-xl border-l-4 border-l-red-600 bg-red-50 px-4 py-3">
        <p className="text-foreground text-xs leading-relaxed">
          <strong className="font-semibold">Empieza por la auditoría.</strong>{" "}
          El inventario destapó que 773 clases de token de la app no aplican
          ningún estilo: están escritas con la sintaxis de Tailwind v3 en un
          proyecto que usa v4. Está explicado, con la prueba visual al lado, en{" "}
          <a href="#auditoria" className="font-medium underline">
            Auditoría de inconsistencias
          </a>
          .
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
        <AuditSection />
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
