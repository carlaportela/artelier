//Piezas de maquetación del sticker sheet. NO forman parte del sistema de diseño de Artelier:
//viven aquí dentro, y no en ~/components, precisamente para que nadie las reutilice en la app.

import type { ReactNode } from "react";

// ─── Sección de primer nivel ─────────────────────────────────────────────────

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className="border-border scroll-mt-20 border-t pt-10">
      <h2 className="font-display text-foreground text-2xl">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

// ─── Grupo dentro de una sección ─────────────────────────────────────────────

interface GroupProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export function Group({ title, hint, children }: GroupProps) {
  return (
    <div>
      <h3 className="text-foreground text-xs font-semibold tracking-[0.08em] uppercase">
        {title}
      </h3>
      {hint && (
        <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed">
          {hint}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

// ─── Ficha de una pieza: lo que se ve arriba, cómo se escribe abajo ──────────
//El snippet es la mitad importante: sin él la hoja te dice "existe un botón verde"
//pero no te dice cómo escribirlo, que es lo que causa las inconsistencias.

interface SpecimenProps {
  label: string;
  code?: string;
  /** Fondo oscuro o de imagen — para piezas pensadas para ir encima de fotos. */
  surface?: "surface" | "bg" | "dark";
  children: ReactNode;
}

const SURFACES: Record<NonNullable<SpecimenProps["surface"]>, string> = {
  surface: "bg-card",
  bg: "bg-background",
  dark: "bg-[#3d3a33]",
};

export function Specimen({
  label,
  code,
  surface = "surface",
  children,
}: SpecimenProps) {
  return (
    <figure className="border-border overflow-hidden rounded-xl border">
      <div
        className={`flex min-h-[4.5rem] flex-wrap items-center gap-3 p-4 ${SURFACES[surface]}`}
      >
        {children}
      </div>
      <figcaption className="border-border bg-background border-t px-3 py-2">
        <p className="text-foreground text-xs font-medium">{label}</p>
        {code && (
          <code className="mt-1 block font-mono text-[11px] leading-relaxed break-all text-[var(--text-light)]">
            {code}
          </code>
        )}
      </figcaption>
    </figure>
  );
}

// ─── Rejilla de fichas ───────────────────────────────────────────────────────

export function Grid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3;
}) {
  const map = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
  };
  return (
    <div className={`grid grid-cols-1 gap-3 ${map[cols]}`}>{children}</div>
  );
}

// ─── Muestra de color ────────────────────────────────────────────────────────
//El cuadrado se pinta con var(--token) para que SIEMPRE muestre el valor vivo de
//globals.css. El valor en texto es documentación: si algún día no coinciden, manda el cuadrado.

interface SwatchProps {
  token: string;
  declared: string;
  note?: string;
}

export function Swatch({ token, declared, note }: SwatchProps) {
  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-2">
      <span
        className="h-11 w-11 shrink-0 rounded-md border border-black/10"
        style={{ background: `var(${token})` }}
      />
      <span className="min-w-0">
        <code className="text-foreground block font-mono text-[11px] font-medium">
          {token}
        </code>
        <code className="block font-mono text-[11px] text-[var(--text-light)]">
          {declared}
        </code>
        {note && (
          <span className="text-muted-foreground mt-0.5 block text-[11px]">
            {note}
          </span>
        )}
      </span>
    </div>
  );
}

// ─── Avisos ──────────────────────────────────────────────────────────────────

export function Note({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "bad";
  children: ReactNode;
}) {
  const tones = {
    info: "border-l-border bg-muted",
    warn: "border-l-[#c4956a] bg-[#c4956a]/10",
    bad: "border-l-red-600 bg-red-50",
  };
  return (
    <p
      className={`text-foreground rounded-r-lg border-l-4 px-3 py-2 text-xs leading-relaxed ${tones[tone]}`}
    >
      {children}
    </p>
  );
}
