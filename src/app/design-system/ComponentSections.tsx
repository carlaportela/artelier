//Componentes: botones, badges, formularios, tarjetas y piezas de marca.
//Todo lo que se ve aquí son los componentes REALES importados de ~/components.
//Si cambias un componente, esta hoja cambia con él — no hay copias que mantener.

import BackButton from "~/components/BackButton";
import PaletteAvatar from "~/components/PaletteAvatar";
import ProductCard from "~/components/ProductCard";
import ScallopDivider from "~/components/ScallopDivider";
import ArtelierLogo from "~/components/ArtelierLogo";
import DefaultBanner from "~/components/artisan/DefaultBanner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { getProductBadge } from "~/lib/product-badges";

import { BOTON } from "./botones";
import { NoNavigate } from "./NoNavigate";
import { Grid, Group, Note, Section, Specimen } from "./parts";

// ─── Botones ─────────────────────────────────────────────────────────────────

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;

export function ButtonSection() {
  return (
    <Section
      id="botones"
      title="Botones"
      description="Dos familias, cada una para su sitio: la convención Artelier para los botones de acción de una pantalla (confirmar, cancelar, seguir…) y el Button de ui/ para los controles de interfaz de los componentes de shadcn (diálogos, formularios)."
    >
      <Group
        title="Convención Artelier"
        hint="Verde = acción primaria · Gris = cancelar o volver · Rojo = destructivo · Mostaza = seguir y acentos. El hover es siempre MÁS CLARO que el reposo."
      >
        <Grid>
          <Specimen
            label="Primaria — confirmar, guardar, publicar"
            code={BOTON.primario}
          >
            <button type="button" className={BOTON.primario}>
              Confirmar pedido
            </button>
            <button type="button" className={BOTON.primario} disabled>
              Deshabilitada
            </button>
          </Specimen>

          <Specimen
            label="Secundaria — cancelar, volver, descartar"
            code={BOTON.secundario}
          >
            <button type="button" className={BOTON.secundario}>
              Cancelar
            </button>
            <button type="button" className={BOTON.secundario} disabled>
              Deshabilitada
            </button>
          </Specimen>

          <Specimen
            label="Destructiva contorneada — la opción por defecto para destruir"
            code={BOTON.peligro}
          >
            <button type="button" className={BOTON.peligro}>
              Rechazar pedido
            </button>
          </Specimen>

          <Specimen
            label="Destructiva sólida — solo para la confirmación final dentro de un diálogo"
            code={BOTON.peligroSolido}
          >
            <button type="button" className={BOTON.peligroSolido}>
              Sí, eliminar
            </button>
          </Specimen>

          <Specimen
            label="Acento — seguir, destacar, acciones de descubrimiento"
            code={BOTON.acento}
          >
            <button type="button" className={BOTON.acento}>
              Seguir
            </button>
          </Specimen>

          <Specimen
            label="Volver — componente BackButton"
            code='<BackButton href="/" label="Volver" />'
          >
            <BackButton href="/" label="Volver" />
          </Specimen>
        </Grid>

        <Note>
          Copia estas clases exactamente — no improvises una opacidad de gris
          distinta ni un tono de mostaza distinto. El hover siempre es un paso
          más claro, nunca una opacidad del mismo color sólido.
        </Note>
      </Group>

      <Group
        title="Button de ui/ — variantes"
        hint="Lee tokens, así que respeta la paleta automáticamente. Lo usan los componentes de shadcn."
      >
        <Specimen
          label="variant"
          code={`<Button variant="outline">Texto</Button>`}
        >
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </Specimen>
        <Specimen label="size" code={`<Button size="sm">Texto</Button>`}>
          {BUTTON_SIZES.map((s) => (
            <Button key={s} size={s}>
              {s}
            </Button>
          ))}
        </Specimen>
        <Specimen label="Estados" code="disabled / aria-invalid">
          <Button>Normal</Button>
          <Button disabled>Deshabilitada</Button>
          <Button aria-invalid>Inválida</Button>
        </Specimen>
      </Group>
    </Section>
  );
}

// ─── Badges y sellos ─────────────────────────────────────────────────────────

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
] as const;

//Las clases de sello declaradas en globals.css. Lista completa también en la sección Color.
const SELLOS_DEMO = [
  { clase: "seal-mano", etiqueta: "Hecho a mano" },
  { clase: "seal-eco", etiqueta: "Ecológico" },
  { clase: "seal-reciclado", etiqueta: "Reciclado" },
  { clase: "seal-galicia", etiqueta: "Hecho en Galicia" },
  { clase: "seal-km0", etiqueta: "Km 0" },
];

const PRODUCTOS_DEMO = [
  {
    status: "ACTIVE" as const,
    expiresAt: new Date("2030-01-01"),
    etiqueta: "ACTIVE + expiresAt",
  },
  { status: "SOLD" as const, expiresAt: null, etiqueta: "SOLD" },
  { status: "EXPIRED" as const, expiresAt: null, etiqueta: "EXPIRED" },
];

export function BadgeSection() {
  return (
    <Section
      id="badges"
      title="Badges, sellos y etiquetas"
      description="Tres familias distintas que se parecen entre sí: conviene saber cuál toca antes de escribir una píldora nueva."
    >
      <Group
        title="Badge de ui/"
        hint="Para contadores y etiquetas genéricas de interfaz."
      >
        <Specimen
          label="variant"
          code={`<Badge variant="secondary">Texto</Badge>`}
        >
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </Specimen>
      </Group>

      <Group
        title="Sellos verificados"
        hint="Un color por tipo de sello (ver la paleta en Color). Úsalas siempre, estén sobre un producto o sobre un perfil — nunca el mismo color para los cinco."
      >
        <Specimen
          label="Clases .seal-*"
          code={`<span className="seal-eco rounded-full px-2.5 py-1 text-xs font-medium">Ecológico</span>`}
        >
          {SELLOS_DEMO.map((s) => (
            <span
              key={s.clase}
              className={`${s.clase} rounded-full px-2.5 py-1 text-xs font-medium`}
            >
              {s.etiqueta}
            </span>
          ))}
        </Specimen>
        <Note>
          <code>SealBadge</code> (mostaza sólido, un color para los cinco
          sellos) es el patrón antiguo. El PR de corrección de inconsistencias
          que acompaña a esta hoja lo sustituye por las clases{" "}
          <code>.seal-*</code> en sus tres sitios de uso y borra el componente —
          si sigue existiendo en el repo es solo porque ese PR todavía no se ha
          mergeado.
        </Note>
      </Group>

      <Group
        title="Badge de estado de producto"
        hint="Siempre vía getProductBadge(status, expiresAt, variant) — nunca a mano. variant 'overlay' va sobre la foto, 'solid' sobre fondo plano."
      >
        <Grid>
          <Specimen
            label="variant: overlay — sobre imagen"
            surface="dark"
            code="getProductBadge(status, expiresAt, 'overlay')"
          >
            {PRODUCTOS_DEMO.map((p) => {
              const badge = getProductBadge(p.status, p.expiresAt, "overlay");
              return badge ? (
                <span
                  key={p.etiqueta}
                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              ) : null;
            })}
          </Specimen>
          <Specimen
            label="variant: solid — sobre fondo plano"
            code="getProductBadge(status, expiresAt, 'solid')"
          >
            {PRODUCTOS_DEMO.map((p) => {
              const badge = getProductBadge(p.status, p.expiresAt, "solid");
              return badge ? (
                <span
                  key={p.etiqueta}
                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              ) : null;
            })}
          </Specimen>
        </Grid>
        <Note>
          <code>ACTIVE</code> sin fecha de caducidad devuelve <code>null</code>:
          un producto disponible sin más no lleva badge.
        </Note>
      </Group>
    </Section>
  );
}

// ─── Formularios ─────────────────────────────────────────────────────────────

export function FormSection() {
  return (
    <Section
      id="formularios"
      title="Formularios"
      description="Input y Label de ui/ leen tokens y traen el anillo de foco y los estados de error ya resueltos. Un input escrito a mano pierde todo eso."
    >
      <Grid>
        <Specimen label="Campo normal" code="<Label htmlFor> + <Input id>">
          <div className="w-full space-y-1.5">
            <Label htmlFor="ds-nombre">Nombre del producto</Label>
            <Input id="ds-nombre" placeholder="Jarrón de barro cocido" />
          </div>
        </Specimen>

        <Specimen
          label="Con pista de ayuda"
          code="pista en text-xs text-muted-foreground"
        >
          <div className="w-full space-y-1.5">
            <Label htmlFor="ds-precio">Precio</Label>
            <Input id="ds-precio" type="number" placeholder="0,00" />
            <p className="text-muted-foreground text-xs">
              En euros, IVA incluido.
            </p>
          </div>
        </Specimen>

        <Specimen
          label="Estado de error"
          code="aria-invalid en el Input + mensaje en text-red-600"
        >
          <div className="w-full space-y-1.5">
            <Label htmlFor="ds-email">Correo electrónico</Label>
            <Input id="ds-email" aria-invalid defaultValue="artelier@" />
            <p className="text-xs text-red-600">Introduce un correo válido.</p>
          </div>
        </Specimen>

        <Specimen label="Deshabilitado" code="disabled">
          <div className="w-full space-y-1.5">
            <Label htmlFor="ds-iban">IBAN</Label>
            <Input id="ds-iban" disabled defaultValue="ES00 0000 0000 0000" />
          </div>
        </Specimen>

        <Specimen
          label="Área de texto"
          code="<textarea> con las mismas clases que Input"
        >
          <div className="w-full space-y-1.5">
            <Label htmlFor="ds-desc">Descripción</Label>
            <textarea
              id="ds-desc"
              rows={3}
              placeholder="Cuenta cómo lo haces…"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-[var(--text-light)] focus-visible:ring-3"
            />
            <p className="text-muted-foreground text-xs">0 / 280</p>
          </div>
        </Specimen>

        <Specimen label="Separador" code="<Separator />">
          <div className="w-full space-y-3">
            <p className="text-foreground text-sm">Arriba</p>
            <Separator />
            <p className="text-foreground text-sm">Abajo</p>
          </div>
        </Specimen>
      </Grid>

      <Note>
        No hay componente de <code>textarea</code> en <code>ui/</code>: para un
        área de texto, copia las mismas clases que el campo de arriba.
      </Note>
    </Section>
  );
}

// ─── Tarjetas ────────────────────────────────────────────────────────────────

const PRODUCTO_DEMO = {
  id: "demo",
  name: "Jarrón de barro cocido",
  priceInCents: 4500,
  imageUrls: [] as string[],
  artisan: { name: "Olería de Buño", image: null },
};

export function CardSection() {
  return (
    <Section
      id="tarjetas"
      title="Tarjetas"
      description="La Card de ui/ es el contenedor genérico; ProductCard es la pieza de catálogo y tiene su propia anatomía fija."
    >
      <Group
        title="Card de ui/"
        hint="Composición: Card > CardHeader > CardTitle/CardDescription/CardAction, CardContent, CardFooter."
      >
        <Grid>
          <Specimen
            label="Card completa"
            code="Card + Header + Content + Footer"
            surface="bg"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Pedido #1042</CardTitle>
                <CardDescription>Realizado el 3 de marzo</CardDescription>
                <CardAction>
                  <Badge variant="secondary">En preparación</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">2 artículos · 68,00 €</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Ver detalle</Button>
              </CardFooter>
            </Card>
          </Specimen>

          <Specimen label="Card size sm" code={`<Card size="sm">`} surface="bg">
            <Card size="sm" className="w-full">
              <CardHeader>
                <CardTitle>Compacta</CardTitle>
                <CardDescription>Menos aire interior.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Para listas densas.</p>
              </CardContent>
            </Card>
          </Specimen>
        </Grid>
      </Group>

      <Group
        title="ProductCard"
        hint="Anatomía: franja de artesana con su avatar, imagen cuadrada con badge de estado, nombre y precio. Aquí sin foto, para ver el estado vacío."
      >
        <Specimen
          label="ProductCard — las cuatro variantes de estado"
          code="<ProductCard product={...} />"
          surface="bg"
        >
          {/* NoNavigate: el producto de la demo no existe en la base de datos — sin esto,
              clicar la ficha llevaría a un 404 real en vez de solo mostrar el diseño. */}
          <NoNavigate>
            <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
              <ProductCard
                product={{
                  ...PRODUCTO_DEMO,
                  status: "ACTIVE",
                  expiresAt: null,
                }}
              />
              <ProductCard
                product={{
                  ...PRODUCTO_DEMO,
                  status: "ACTIVE",
                  expiresAt: new Date("2030-01-01"),
                }}
              />
              <ProductCard
                product={{ ...PRODUCTO_DEMO, status: "SOLD", expiresAt: null }}
              />
              <ProductCard
                product={{
                  ...PRODUCTO_DEMO,
                  status: "EXPIRED",
                  expiresAt: null,
                }}
              />
            </div>
          </NoNavigate>
        </Specimen>
      </Group>
    </Section>
  );
}

// ─── Marca ───────────────────────────────────────────────────────────────────

const AVATAR_COLORES = ["#4a9e8c", "#c4956a", "#3d5a4f", "#c47860"];

export function BrandSection() {
  return (
    <Section
      id="marca"
      title="Piezas de marca"
      description="Las formas que hacen que Artelier se reconozca: el logo de banderillas, el avatar de galleta, la onda y el banner por defecto."
    >
      <Grid>
        <Specimen
          label="ArtelierLogo"
          code="<ArtelierLogo width={96} height={56} />"
        >
          <ArtelierLogo width={96} height={56} />
          <ArtelierLogo width={64} height={37} />
        </Specimen>

        <Specimen
          label="ScallopDivider — onda de separación"
          code="<ScallopDivider className='text-[var(--text-light)]' />"
        >
          <div className="w-full text-[var(--text-light)]">
            <ScallopDivider />
          </div>
        </Specimen>
      </Grid>

      <Group
        title="PaletteAvatar"
        hint="Avatar con forma de galleta. Sin foto muestra la inicial sobre un color. plain=false añade anillo, solo para usar sobre banners."
      >
        <Specimen
          label="Sin foto, por color"
          code={`<PaletteAvatar src={null} name="Olería" fillColor="#4a9e8c" />`}
        >
          {AVATAR_COLORES.map((c) => (
            <PaletteAvatar
              key={c}
              src={null}
              name="Olería de Buño"
              fillColor={c}
              className="h-16 w-16"
            />
          ))}
        </Specimen>
        <Specimen
          label="Tamaños de uso"
          code='className="h-9 w-9" (tarjeta) · "h-16 w-16" (lista) · "h-20 w-20" (perfil)'
        >
          <PaletteAvatar src={null} name="Artelier" className="h-9 w-9" />
          <PaletteAvatar src={null} name="Artelier" className="h-16 w-16" />
          <PaletteAvatar src={null} name="Artelier" className="h-20 w-20" />
        </Specimen>
      </Group>

      <Group
        title="Fondo de portada por defecto"
        hint="Para una artesana sin foto de portada, siempre DefaultBanner — en el perfil público y también en el editor del studio."
      >
        <Specimen label="DefaultBanner — confetti SVG" code="<DefaultBanner />">
          <div className="h-28 w-full overflow-hidden rounded-xl">
            <DefaultBanner />
          </div>
        </Specimen>
        <Note>
          La clase <code>.banner-lino</code> (textura de lino, en el editor del
          studio) es el patrón antiguo — con ella la artesana veía un fondo
          distinto al que luego ve el público. El PR de corrección de
          inconsistencias que acompaña a esta hoja la sustituye por{" "}
          <code>&lt;DefaultBanner /&gt;</code> y la borra de{" "}
          <code>globals.css</code> — si sigue existiendo es solo porque ese PR
          todavía no se ha mergeado.
        </Note>
      </Group>
    </Section>
  );
}
