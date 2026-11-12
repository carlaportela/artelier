//Componentes: botones, badges, formularios, tarjetas y piezas de marca.
//Todo lo que se ve aquí son los componentes REALES importados de ~/components.
//Si cambias un componente, esta hoja cambia con él — no hay copias que mantener.

import BackButton from "~/components/BackButton";
import PaletteAvatar from "~/components/PaletteAvatar";
import ProductCard from "~/components/ProductCard";
import ScallopDivider from "~/components/ScallopDivider";
import ArtelierLogo from "~/components/ArtelierLogo";
import DefaultBanner from "~/components/artisan/DefaultBanner";
import { SealBadge } from "~/components/artisan/SealBadge";
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
      description="Hay dos sistemas en marcha: el Button de ui/ (basado en tokens) y la convención escrita a mano con hex. El objetivo a medio plazo es que la convención viva dentro de Button como variantes."
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
            <BackButton href="/design-system" label="Volver" />
          </Specimen>
        </Grid>

        <Note tone="warn">
          Esta convención hoy no existe como código: se reescribe a mano en cada
          pantalla. Por eso hay cuatro opacidades distintas de hover gris (
          <code>hover:bg-[#ccc8bc]</code>, <code>/30</code>, <code>/40</code>) y
          dos mostazas de hover casi idénticas (<code>#d4a57a</code> y{" "}
          <code>#d4a87a</code>). La solución es llevarlas a{" "}
          <code>buttonVariants</code>.
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
        title="SealBadge — sellos de artesana"
        hint="Mostaza sólida con tipografía display. Se usa en tarjetas de producto, perfil y edición."
      >
        <Specimen label="SealBadge" code={`<SealBadge name="Hecho a mano" />`}>
          <SealBadge name="Hecho a mano" />
          <SealBadge name="Km 0" />
          <SealBadge name="Ecológico" />
        </Specimen>
        <Note tone="warn">
          Ojo: <code>SealBadge</code> (mostaza, display) y las clases{" "}
          <code>.seal-*</code> de la sección de color (pastel, sans) son dos
          lenguajes visuales distintos para el mismo concepto de sello. Hay que
          unificarlos.
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

      <Note tone="warn">
        No hay componente de <code>textarea</code> en <code>ui/</code>, así que
        cada pantalla reescribe sus clases. Es un buen candidato a componente
        propio.
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
          label="ProductCard en sus tres estados"
          code="<ProductCard product={...} />"
          surface="bg"
        >
          <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-3">
            <ProductCard
              product={{ ...PRODUCTO_DEMO, status: "ACTIVE", expiresAt: null }}
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
          </div>
        </Specimen>
        <Note tone="warn">
          La franja de artesana usa <code>bg-[#dedad2]</code>, un gris cálido
          que no está en globals.css. Debería ser un token.
        </Note>
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
        title="Fondos de portada"
        hint="Dos opciones para una artesana sin foto de portada."
      >
        <Grid>
          <Specimen
            label="DefaultBanner — confetti SVG"
            code="<DefaultBanner />"
          >
            <div className="h-28 w-full overflow-hidden rounded-xl">
              <DefaultBanner />
            </div>
          </Specimen>
          <Specimen label="Textura lino" code={`className="banner-lino"`}>
            <div className="banner-lino h-28 w-full rounded-xl" />
          </Specimen>
        </Grid>
        <Note tone="warn">
          Dos portadas por defecto distintas conviviendo. Hay que decidir cuál
          es la oficial.
        </Note>
      </Group>
    </Section>
  );
}
