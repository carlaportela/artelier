//Tokens: color, tipografía, radios, sombras y espaciado.
//Fuente de verdad: src/styles/globals.css. Si cambias algo allí, esta hoja lo refleja sola
//(los cuadrados se pintan con var(--token)); lo único que hay que actualizar a mano
//es el valor escrito al lado, que es documentación.

import { ORDER_STATUS_DOT } from "~/lib/order-constants";

import { Grid, Group, Note, Section, Specimen, Swatch } from "./parts";

// ─── Color ───────────────────────────────────────────────────────────────────

const SUPERFICIES = [
  { token: "--bg", declared: "#f4f0e8", note: "Fondo de página" },
  { token: "--surface", declared: "#eae5da", note: "Tarjetas, paneles" },
  {
    token: "--surface-2",
    declared: "#ddd7c8",
    note: "Superficie elevada / hover",
  },
  { token: "--brand-accent", declared: "#c4956a", note: "Mostaza de marca" },
];

const TEXTO = [
  { token: "--text", declared: "#1a1a18", note: "Texto principal" },
  { token: "--text-muted", declared: "#5a5648", note: "Secundario, metadatos" },
  { token: "--text-light", declared: "#8a8478", note: "Terciario, pistas" },
];

const SHADCN = [
  { token: "--primary", declared: "#3d5a4f", note: "Verde Artelier" },
  { token: "--primary-foreground", declared: "#f4f0e8" },
  { token: "--secondary", declared: "#ddd7c8" },
  { token: "--muted", declared: "#ddd7c8" },
  { token: "--muted-foreground", declared: "#5a5648" },
  { token: "--card", declared: "#eae5da" },
  { token: "--border", declared: "#ccc8bc" },
  { token: "--input", declared: "#ccc8bc" },
  { token: "--ring", declared: "#3d5a4f", note: "Anillo de foco" },
  {
    token: "--destructive",
    declared: "oklch(0.577 0.245 27.325)",
    note: "Rojo de shadcn",
  },
];

const SELLOS = [
  { clase: "seal-mano", etiqueta: "Hecho a mano" },
  { clase: "seal-eco", etiqueta: "Ecológico" },
  { clase: "seal-reciclado", etiqueta: "Reciclado" },
  { clase: "seal-galicia", etiqueta: "Hecho en Galicia" },
  { clase: "seal-km0", etiqueta: "Km 0" },
];

export function ColorSection() {
  return (
    <Section
      id="color"
      title="Color"
      description="Paleta Tinta y Lino. Toda la app debería leer estos tokens y nunca escribir un hex a mano: es la única forma de que no aparezca un segundo crema o una segunda mostaza casi iguales."
    >
      <Group
        title="Superficies y marca"
        hint="Tokens semánticos propios de Artelier."
      >
        <Grid cols={3}>
          {SUPERFICIES.map((c) => (
            <Swatch key={c.token} {...c} />
          ))}
        </Grid>
      </Group>

      <Group title="Texto" hint="Tres niveles de jerarquía. No hay un cuarto.">
        <Grid cols={3}>
          {TEXTO.map((c) => (
            <Swatch key={c.token} {...c} />
          ))}
        </Grid>
      </Group>

      <Group
        title="Tokens shadcn"
        hint="Los que usan los componentes de ~/components/ui. Se consumen con utilidades de Tailwind: bg-primary, text-muted-foreground, border-border…"
      >
        <Grid cols={3}>
          {SHADCN.map((c) => (
            <Swatch key={c.token} {...c} />
          ))}
        </Grid>
      </Group>

      <Group
        title="Sellos verificados"
        hint="Cada sello tiene su par fondo/texto en globals.css y una clase de utilidad en @layer components."
      >
        <Specimen
          label="Clases de sello"
          code={`<span className="seal-eco rounded-full px-2.5 py-1 text-xs font-medium">Ecológico</span>`}
        >
          {SELLOS.map((s) => (
            <span
              key={s.clase}
              className={`${s.clase} rounded-full px-2.5 py-1 text-xs font-medium`}
            >
              {s.etiqueta}
            </span>
          ))}
        </Specimen>
      </Group>

      <Group
        title="Punto de estado de pedido"
        hint="Mapa ORDER_STATUS_DOT en ~/lib/order-constants. Mostaza = en curso, verde = completado, gris = cerrado, rojo = requiere atención."
      >
        <Specimen
          label="ORDER_STATUS_DOT"
          code="ORDER_STATUS_DOT[status] — importar siempre el mapa, nunca repetir los colores"
        >
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {Object.entries(ORDER_STATUS_DOT).map(([estado, clase]) => (
              <span key={estado} className="flex items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-full ${clase}`} />
                <code className="text-muted-foreground font-mono text-[11px]">
                  {estado}
                </code>
              </span>
            ))}
          </div>
        </Specimen>
        <Note>
          El rojo de atención/destructivo es siempre <code>red-600</code> /{" "}
          <code>red-700</code> de Tailwind — nunca un hex de Artelier a mano. Es
          la misma regla que en <a href="#botones">Botones</a>.
        </Note>
      </Group>
    </Section>
  );
}

// ─── Tipografía ──────────────────────────────────────────────────────────────

const ESCALA = [
  {
    clase: "text-xs",
    px: "12px",
    uso: "Metadatos, sellos, pistas de formulario",
  },
  { clase: "text-sm", px: "14px", uso: "Cuerpo por defecto de la app" },
  {
    clase: "text-base",
    px: "16px",
    uso: "Cuerpo destacado, títulos de tarjeta",
  },
  { clase: "text-lg", px: "18px", uso: "Títulos de sección" },
  { clase: "text-xl", px: "20px", uso: "Título de página en móvil" },
  { clase: "text-2xl", px: "24px", uso: "Título de página" },
  { clase: "text-3xl", px: "30px", uso: "Titular de landing" },
];

const PESOS = [
  { clase: "font-normal", etiqueta: "Normal 400", uso: "Párrafos y datos" },
  { clase: "font-medium", etiqueta: "Medium 500", uso: "Botones y etiquetas" },
  { clase: "font-semibold", etiqueta: "Semibold 600", uso: "Títulos" },
];

export function TypographySection() {
  return (
    <Section
      id="tipografia"
      title="Tipografía"
      description="Dos familias y nada más: la manuscrita para voz de marca y títulos, la de palo seco para todo lo que se lee de verdad."
    >
      <Grid>
        <Specimen
          label="font-display — The Girl Next Door"
          code={`className="font-display"`}
        >
          <div>
            <p className="font-display text-foreground text-3xl">
              Artesanía con nombre
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Títulos, nombre de marca y sellos. Nunca para párrafos ni para
              texto por debajo de 14px: pierde legibilidad.
            </p>
          </div>
        </Specimen>
        <Specimen
          label="font-sans — DM Sans (variable 100–900)"
          code={`className="font-sans" — ya es la familia por defecto en <html>`}
        >
          <div>
            <p className="text-foreground text-base">
              Cuerpo, botones, formularios y datos.
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              No hace falta escribir font-sans salvo para volver a ella dentro
              de un bloque display.
            </p>
          </div>
        </Specimen>
      </Grid>

      <Group
        title="Escala"
        hint="Si un tamaño no está en esta lista, no se usa."
      >
        <div className="divide-border border-border bg-card divide-y overflow-hidden rounded-xl border">
          {ESCALA.map((e) => (
            <div
              key={e.clase}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2.5"
            >
              <code className="w-24 shrink-0 font-mono text-[11px] text-[var(--text-light)]">
                {e.clase}
              </code>
              <code className="w-12 shrink-0 font-mono text-[11px] text-[var(--text-light)]">
                {e.px}
              </code>
              <span className={`${e.clase} text-foreground`}>Artelier</span>
              <span className="text-muted-foreground text-[11px]">{e.uso}</span>
            </div>
          ))}
        </div>
      </Group>

      <Group
        title="Pesos"
        hint="Tres pesos. Si necesitas un cuarto, probablemente el problema es de tamaño o de color."
      >
        <Specimen label="font-normal / font-medium / font-semibold">
          <div className="space-y-1">
            {PESOS.map((p) => (
              <p key={p.clase} className={`${p.clase} text-foreground text-sm`}>
                {p.etiqueta}
                <span className="text-muted-foreground ml-2 text-[11px] font-normal">
                  {p.uso}
                </span>
              </p>
            ))}
          </div>
        </Specimen>
      </Group>
    </Section>
  );
}

// ─── Forma: radios, bordes, sombras ──────────────────────────────────────────

const RADIOS = [
  { clase: "rounded-sm", valor: "0.45rem" },
  { clase: "rounded-md", valor: "0.6rem" },
  { clase: "rounded-lg", valor: "0.75rem" },
  { clase: "rounded-xl", valor: "1.05rem" },
  { clase: "rounded-2xl", valor: "1.35rem" },
  { clase: "rounded-full", valor: "píldora" },
];

export function ShapeSection() {
  return (
    <Section
      id="forma"
      title="Forma y profundidad"
      description="Todos los radios derivan de --radius (0.75rem). Cambiar ese número reescala las esquinas de la app entera."
    >
      <Group title="Radios">
        <Specimen
          label="Escala de radios"
          code="--radius: 0.75rem → rounded-sm … rounded-4xl"
        >
          {RADIOS.map((r) => (
            <span key={r.clase} className="flex flex-col items-center gap-1">
              <span
                className={`border-border bg-muted h-14 w-14 border ${r.clase}`}
              />
              <code className="font-mono text-[10px] text-[var(--text-light)]">
                {r.clase}
              </code>
            </span>
          ))}
        </Specimen>
        <Note>
          Convención observada en la app: <strong>rounded-full</strong> para
          botones de acción y píldoras, <strong>rounded-xl</strong> para
          tarjetas, <strong>rounded-lg</strong> para inputs y controles
          pequeños.
        </Note>
      </Group>

      <Group
        title="Separación de superficie"
        hint="Para separar una tarjeta o un panel del fondo, usa siempre un borde — no un anillo."
      >
        <Specimen
          label="La forma correcta — borde"
          code={`className="border border-border rounded-xl"`}
        >
          <span className="border-border bg-card h-14 w-32 rounded-xl border" />
        </Specimen>
        <Note>
          Si alguna vez usas el componente <code>Card</code> de <code>ui/</code>
          , viene con su propio anillo interior (<code>ring-1</code>) en vez de
          borde — no le añadas además un <code>border</code>: el anillo no ocupa
          espacio en el layout y el borde sí, y mezclar los dos descuadra la
          alineación.
        </Note>
      </Group>

      <Group
        title="Sombras"
        hint="Muy poca sombra: el lenguaje es plano y cálido, no material."
      >
        <Specimen label="shadow-sm / shadow-md / shadow-inner">
          {["shadow-sm", "shadow-md", "shadow-inner"].map((s) => (
            <span
              key={s}
              className={`bg-card text-muted-foreground flex h-14 w-24 items-center justify-center rounded-xl font-mono text-[10px] ${s}`}
            >
              {s}
            </span>
          ))}
        </Specimen>
        <Note>
          <code>hover:shadow-md</code> junto a{" "}
          <code>hover:-translate-y-0.5</code> es el gesto de elevación de las
          tarjetas de producto. No usar sombras en estado de reposo.
        </Note>
      </Group>
    </Section>
  );
}

// ─── Espaciado ───────────────────────────────────────────────────────────────

const ESPACIOS = [1, 2, 3, 4, 6, 8, 10, 12];

const CONTENEDORES = [
  { clase: "max-w-lg", uso: "Formularios y vistas de una columna (512px)" },
  {
    clase: "max-w-2xl",
    uso: "Contenido de lectura, detalle de pedido (672px)",
  },
  { clase: "max-w-4xl", uso: "Rejillas y paneles del studio (896px)" },
];

export function SpacingSection() {
  return (
    <Section
      id="espaciado"
      title="Espaciado y contenedores"
      description="Escala de 4px de Tailwind. De gap-4 en adelante, saltar de 2 en 2 para que la jerarquía se note."
    >
      <Group title="Escala">
        <div className="border-border bg-card space-y-1.5 rounded-xl border p-4">
          {ESPACIOS.map((n) => (
            <div key={n} className="flex items-center gap-3">
              <code className="w-12 shrink-0 font-mono text-[11px] text-[var(--text-light)]">
                {n}
              </code>
              <span
                className="h-3 rounded-sm bg-[#3d5a4f]/70"
                style={{ width: `${n * 0.25}rem` }}
              />
              <code className="text-muted-foreground font-mono text-[11px]">
                {n * 4}px
              </code>
            </div>
          ))}
        </div>
      </Group>

      <Group
        title="Anchos de contenedor"
        hint="Convención responsive de Artelier: mx-auto + max-w según la densidad de la vista."
      >
        <div className="space-y-2">
          {CONTENEDORES.map((c) => (
            <div
              key={c.clase}
              className="border-border bg-card rounded-lg border px-3 py-2"
            >
              <code className="text-foreground font-mono text-[11px] font-medium">
                mx-auto {c.clase}
              </code>
              <p className="text-muted-foreground text-[11px]">{c.uso}</p>
            </div>
          ))}
        </div>
      </Group>
    </Section>
  );
}
