//Auditoría de inconsistencias detectadas al inventariar la interfaz.
//
//Esta sección es el motivo de ser de la hoja: no documenta lo que hay, señala lo que
//no cuadra. Las cifras se midieron sobre src/ con los comandos que aparecen al final,
//excluyendo esta propia carpeta. Cuando arregles algo, vuelve a medir y actualiza o
//borra la entrada — una auditoría que nadie actualiza es peor que no tenerla.

import { Grid, Group, Note, Section, Specimen } from "./parts";

// ─── Colores que se usan pero no están declarados en globals.css ─────────────

const HUERFANOS = [
  {
    hex: "#4a6b5e",
    usos: 44,
    que: "Hover del verde primario. Es el segundo color más usado de la app y no es un token.",
  },
  {
    hex: "#e0dbd0",
    usos: 39,
    que: "Crema de bordes y separadores. Compite con --border (#ccc8bc).",
  },
  {
    hex: "#4a9e8c",
    usos: 22,
    que: "Turquesa: color por defecto de PaletteAvatar y del badge de disponible.",
  },
  {
    hex: "#c47860",
    usos: 14,
    que: "Terracota del confetti del banner y de acentos.",
  },
  {
    hex: "#f0ece6",
    usos: 12,
    que: "Otro crema de fondo. Competidor de --bg (#f4f0e8).",
  },
  {
    hex: "#ffffff",
    usos: 11,
    que: "Blanco puro. Debería ser text-white o un token, no un hex.",
  },
  { hex: "#94a49e", usos: 10, que: "Verde grisáceo de estados cerrados." },
  {
    hex: "#9ca3af",
    usos: 5,
    que: "Es el gray-400 de Tailwind escrito a mano. Ni token ni utilidad.",
  },
  { hex: "#a3b1ab", usos: 3, que: "Tercer verde grisáceo." },
  { hex: "#dedad2", usos: 2, que: "Franja de artesana de ProductCard." },
  { hex: "#faf9f7", usos: 2, que: "Cuarto crema." },
];

// ─── Parejas de colores casi idénticos ───────────────────────────────────────

const GEMELOS = [
  {
    a: "#f4f0e8",
    b: "#f5f0e8",
    donde: "CustomOrderForm.tsx, DataExportPdf.tsx",
    nota: "Un dígito de diferencia. Indistinguibles a ojo, imposibles de mantener.",
  },
  {
    a: "#d4a57a",
    b: "#d4a87a",
    donde: "ProfilePageClient.tsx vs product/[id]/page.tsx y FollowButton.tsx",
    nota: "Los dos son el hover del botón mostaza. Uno de los dos es un error de tecleo.",
  },
];

// ─── Hallazgos estructurales ─────────────────────────────────────────────────

type Gravedad = "alta" | "media" | "baja";

interface Hallazgo {
  gravedad: Gravedad;
  titulo: string;
  detalle: string;
  arreglo: string;
}

const HALLAZGOS: Hallazgo[] = [
  {
    gravedad: "alta",
    titulo:
      "773 clases de token no aplican ningún estilo (sintaxis de Tailwind v3 en un proyecto v4)",
    detalle:
      "La app escribe sus tokens como bg-[--surface] o text-[--text-muted], que era la sintaxis de Tailwind v3. En v4 eso compila a 'background-color: --surface', sin var(), y el navegador descarta la declaración. Son 773 usos en 75 ficheros. El más grave es text-[--text-muted] (270 usos): el texto secundario de toda la app se está pintando con el color heredado del body, no con #5a5648, así que la jerarquía entre texto principal y secundario no existe. Y esto explica el resto de la auditoría: si las clases de token no pintan nada, lo natural es acabar escribiendo el hex a mano.",
    arreglo:
      "La sintaxis correcta en v4 es bg-(--surface) o bg-[var(--surface)]. Mejor aún: registrar los tokens de Artelier en el bloque @theme inline de globals.css (--color-surface: var(--surface), etc.) para poder escribir bg-surface, igual que ya funciona bg-primary. Es un cambio mecánico y se puede hacer carpeta por carpeta.",
  },
  {
    gravedad: "alta",
    titulo: "<Toaster /> no está montado en ningún layout",
    detalle:
      "Tres vistas llaman a toast() (OrdersView, AcceptOrRejectOrderCard, ConfirmShipmentForm) pero el componente que los pinta no está en ningún layout, así que esos avisos no se ven nunca. No es un problema de estilo: es funcionalidad silenciosamente muerta.",
    arreglo:
      "Montar <Toaster /> una vez en src/app/layout.tsx, junto a <CookieBanner />.",
  },
  {
    gravedad: "alta",
    titulo: "390 colores escritos a mano en 63 de los 125 ficheros .tsx",
    detalle:
      "La app usa 26 colores distintos; globals.css declara 19. Cada hex a mano es una oportunidad de que aparezca un gemelo casi idéntico, y ya han aparecido dos parejas. Consecuencia directa del hallazgo anterior: cuando bg-[--surface] no pinta nada, poner bg-[#eae5da] es lo único que funciona.",
    arreglo:
      "Declarar los huérfanos reales como tokens en globals.css y sustituir los hex por utilidades de Tailwind. Se puede hacer por carpetas, no hace falta de golpe.",
  },
  {
    gravedad: "alta",
    titulo: "La convención de botones no existe como código",
    detalle:
      "Verde / gris / rojo / mostaza se reescriben a mano en cada pantalla. De ahí salen tres opacidades distintas de hover gris (hover:bg-[#ccc8bc], /30, /40), dos textos distintos en el botón gris (--text y #3d5a4f) y cuatro paddings verticales (py-1.5, py-2, py-2.5, py-3) para el mismo tipo de botón.",
    arreglo:
      'Añadir las cuatro a buttonVariants en ui/button.tsx como variantes propias y migrar las pantallas a <Button variant="…">.',
  },
  {
    gravedad: "media",
    titulo: "Dos paletas de rojo conviviendo",
    detalle:
      "Las acciones destructivas usan red-200 / red-600 / red-700 de Tailwind, mientras el resto de la app usa hex de Artelier y existe un token --destructive de shadcn que nadie usa. Son tres rojos distintos para el mismo significado.",
    arreglo:
      "Elegir el rojo de Artelier, declararlo como token y hacer que --destructive apunte a él.",
  },
  {
    gravedad: "media",
    titulo: "Dos lenguajes visuales para el mismo sello",
    detalle:
      "SealBadge pinta los sellos en mostaza sólida con tipografía display; las clases .seal-* los pintan en pasteles con tipografía sans. Las dos se usan en producción para el mismo concepto.",
    arreglo:
      "Quedarse con uno. Los pasteles distinguen mejor entre sellos; el mostaza es más de marca.",
  },
  {
    gravedad: "media",
    titulo: "Dos técnicas para separar una superficie",
    detalle:
      "La Card de ui/ usa ring-1 ring-foreground/10 y las tarjetas escritas a mano usan border border-[--border]. No son equivalentes: el borde ocupa espacio en el layout y el anillo no, así que al mezclarlas las alineaciones bailan un píxel.",
    arreglo:
      "Elegir una. Si se mantiene la Card de ui/, el borde a mano debería desaparecer.",
  },
  {
    gravedad: "media",
    titulo: "Dos portadas por defecto",
    detalle:
      "DefaultBanner (confetti SVG) y la clase .banner-lino (textura de lino) resuelven el mismo caso: artesana sin foto de portada.",
    arreglo: "Decidir cuál es la oficial y borrar la otra.",
  },
  {
    gravedad: "baja",
    titulo: "La clase .palette-avatar es código muerto",
    detalle:
      "globals.css define .palette-avatar con el drop-shadow que debería seguir la silueta de galleta del avatar, pero el componente PaletteAvatar no la aplica en ningún sitio. Los avatares están saliendo sin esa sombra.",
    arreglo:
      "O añadir la clase en PaletteAvatar (es donde tiene sentido), o borrarla de globals.css.",
  },
  {
    gravedad: "baja",
    titulo: "No hay componente de textarea",
    detalle:
      "Cada formulario con texto largo reescribe las clases del área de texto, así que el foco y el borde no coinciden entre pantallas.",
    arreglo: "Crear ui/textarea.tsx reutilizando las clases de Input.",
  },
  {
    gravedad: "baja",
    titulo: "El modo oscuro es código muerto y además no es de Artelier",
    detalle:
      "globals.css define un bloque .dark completo, pero no hay ThemeProvider de next-themes en ningún layout, así que nunca se activa. Y si se activara, está escrito con los grises genéricos de shadcn: no tiene nada que ver con la paleta Tinta y Lino.",
    arreglo:
      "O se borra el bloque .dark, o se reescribe con la paleta de Artelier y se monta el ThemeProvider. Dejarlo a medias es lo único que no conviene.",
  },
];

const GRAVEDAD_ESTILO: Record<Gravedad, string> = {
  alta: "bg-red-100 text-red-800",
  media: "bg-[#c4956a]/20 text-[#7c4e2a]",
  baja: "bg-muted text-muted-foreground",
};

// ─── Comandos para volver a medir ────────────────────────────────────────────

const COMANDOS = [
  {
    que: "Cuántas clases de token con la sintaxis rota quedan (hallazgo nº 1)",
    cmd: "grep -rhoE '\\b(bg|text|border|ring|fill|divide|placeholder)-\\[--[a-z0-9-]+\\]' src --include=*.tsx --exclude-dir=design-system | wc -l",
  },
  {
    que: "Cuántos colores a mano quedan y en cuántos ficheros",
    cmd: "grep -rhoE '\\[#[0-9a-fA-F]{3,8}\\]' src --include=*.tsx --exclude-dir=design-system | wc -l",
  },
  {
    que: "Los colores más usados, de mayor a menor",
    cmd: "grep -rhoE '#[0-9a-fA-F]{6}' src --include=*.tsx --exclude-dir=design-system | tr 'A-F' 'a-f' | sort | uniq -c | sort -rn",
  },
  {
    que: "Quién usa un color concreto",
    cmd: "grep -rn '#4a6b5e' src --include=*.tsx",
  },
];

export function AuditSection() {
  return (
    <Section
      id="auditoria"
      title="Auditoría de inconsistencias"
      description="Lo que el inventario dejó a la vista. Medido sobre src/ el 12 de noviembre de 2026, excluyendo esta carpeta."
    >
      <Group
        title="La prueba del hallazgo nº 1"
        hint="Los dos bloques piden exactamente los mismos colores. El de la izquierda usa la sintaxis que hay hoy en la app; el de la derecha, la que sí funciona en Tailwind v4."
      >
        <Grid>
          <Specimen
            label="❌ Como está escrito en la app — no pinta nada"
            code={`bg-[--surface] · text-[--text] · text-[--text-muted] · text-[--text-light]`}
            surface="bg"
          >
            <div className="border-border w-full rounded-lg border bg-[--surface] p-3">
              <p className="text-[--text]">Texto principal</p>
              <p className="text-[--text-muted]">Texto secundario</p>
              <p className="text-[--text-light]">Texto terciario</p>
            </div>
          </Specimen>
          <Specimen
            label="✅ Con utilidades registradas en @theme"
            code={`bg-card · text-foreground · text-muted-foreground · text-[var(--text-light)]`}
            surface="bg"
          >
            <div className="border-border bg-card w-full rounded-lg border p-3">
              <p className="text-foreground">Texto principal</p>
              <p className="text-muted-foreground">Texto secundario</p>
              <p className="text-[var(--text-light)]">Texto terciario</p>
            </div>
          </Specimen>
        </Grid>
        <Note tone="bad">
          A la izquierda los tres textos salen del mismo color y la tarjeta no
          tiene fondo propio: el navegador ha descartado{" "}
          <code>background-color: --surface</code> y{" "}
          <code>color: --text-muted</code> por inválidos. A la derecha se ve la
          jerarquía que el diseño pretendía. Es el mismo CSS pedido de dos
          maneras.
        </Note>
      </Group>

      <Group
        title="Hallazgos"
        hint="Ordenados por gravedad. Los dos primeros no son de estilo, son funcionalidad perdida."
      >
        <div className="space-y-2">
          {HALLAZGOS.map((h) => (
            <details
              key={h.titulo}
              className="group border-border bg-card rounded-xl border px-4 py-3"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${GRAVEDAD_ESTILO[h.gravedad]}`}
                >
                  {h.gravedad}
                </span>
                <span className="text-foreground text-sm font-medium">
                  {h.titulo}
                </span>
              </summary>
              <div className="mt-2 space-y-2 pl-0 sm:pl-[4.5rem]">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {h.detalle}
                </p>
                <p className="text-foreground text-xs leading-relaxed">
                  <strong className="font-semibold">Cómo se cierra:</strong>{" "}
                  {h.arreglo}
                </p>
              </div>
            </details>
          ))}
        </div>
      </Group>

      <Group
        title="Colores casi idénticos"
        hint="El síntoma clásico de escribir hex a mano: nadie nota la diferencia hasta que hay que cambiarla."
      >
        <div className="space-y-2">
          {GEMELOS.map((g) => (
            <div
              key={g.a + g.b}
              className="border-border bg-card rounded-xl border p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-md border border-black/10"
                  style={{ background: g.a }}
                />
                <code className="text-foreground font-mono text-xs">{g.a}</code>
                <span className="text-[var(--text-light)]">vs</span>
                <span
                  className="h-8 w-8 rounded-md border border-black/10"
                  style={{ background: g.b }}
                />
                <code className="text-foreground font-mono text-xs">{g.b}</code>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs">{g.nota}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-light)]">
                {g.donde}
              </p>
            </div>
          ))}
        </div>
      </Group>

      <Group
        title="Colores huérfanos"
        hint="Se usan en la app pero no están declarados en globals.css. Es decir: la paleta real de Artelier es más grande que la paleta documentada."
      >
        <div className="divide-border border-border bg-card divide-y overflow-hidden rounded-xl border">
          {HUERFANOS.map((h) => (
            <div key={h.hex} className="flex items-start gap-3 px-3 py-2">
              <span
                className="mt-0.5 h-8 w-8 shrink-0 rounded-md border border-black/10"
                style={{ background: h.hex }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <code className="text-foreground font-mono text-xs font-medium">
                    {h.hex}
                  </code>
                  <span className="text-[11px] text-[var(--text-light)]">
                    {h.usos} usos
                  </span>
                </span>
                <span className="text-muted-foreground block text-[11px] leading-relaxed">
                  {h.que}
                </span>
              </span>
            </div>
          ))}
        </div>
        <Note tone="warn">
          Que un color esté en esta lista no significa que esté mal:{" "}
          <code>#4a6b5e</code> y <code>#4a9e8c</code> son parte de la identidad
          de Artelier. Significa que les falta ser tokens para que nadie invente
          su gemelo.
        </Note>
      </Group>

      <Group
        title="Volver a medir"
        hint="Pégalos en la terminal cuando hayas arreglado algo, para ver si la cifra baja."
      >
        <div className="space-y-2">
          {COMANDOS.map((c) => (
            <div
              key={c.que}
              className="border-border bg-card rounded-lg border px-3 py-2"
            >
              <p className="text-muted-foreground text-[11px]">{c.que}</p>
              <code className="text-foreground mt-1 block font-mono text-[11px] break-all">
                {c.cmd}
              </code>
            </div>
          ))}
        </div>
      </Group>
    </Section>
  );
}
