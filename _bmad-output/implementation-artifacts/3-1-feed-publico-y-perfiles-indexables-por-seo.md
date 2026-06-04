# Story 3.1: Feed público y perfiles indexables por SEO

Status: done

## Story

Como visitante sin cuenta,
quiero explorar el catálogo de productos y los perfiles de artesanas sin necesidad de registrarme,
para descubrir Artelier libremente antes de decidir si me registro.

## Acceptance Criteria

**AC1 — Página principal pública**
- **Dado** que accedo a `/` sin sesión
- **Cuando** carga la página
- **Entonces** veo un feed de productos activos (foto, nombre, precio, nombre de artesana) sin ningún muro de registro
- **Y** la página es SSR (renderizada en servidor) e indexable por buscadores

**AC2 — Redirección de usuarios autenticados desde `/`**
- **Dado** que soy compradora autenticada y accedo a `/`
- **Entonces** soy redirigida a `/feed`
- **Dado** que soy artesana autenticada y accedo a `/`
- **Entonces** soy redirigida a `/studio/products`

**AC3 — ProductCard público con enlace a detalle**
- **Dado** que veo el feed público
- **Cuando** hago clic en un ProductCard
- **Entonces** navego a `/product/[id]` (la página de detalle del producto)
- **Y** el ProductCard muestra: foto del producto, nombre, precio, nombre de la artesana y su avatar

**AC4 — Página de detalle de producto (SSR + SEO)**
- **Dado** que accedo a `/product/[id]`
- **Cuando** la página carga
- **Entonces** veo: galería de fotos, nombre del producto, precio, descripción completa, nombre y avatar de la artesana (con enlace a su perfil), sellos del producto
- **Y** la página tiene `<title>` y Open Graph (og:title, og:description, og:image) correctos
- **Y** es SSR, no hay loading spinner inicial
- **Dado** que el producto no existe o está eliminado (`deletedAt != null`)
- **Entonces** veo la página 404 de Next.js (`notFound()`)

**AC5 — Registro diferido en detalle de producto**
- **Dado** que soy visitante sin cuenta en `/product/[id]`
- **Cuando** pulso "Comprar" o "Enviar mensaje"
- **Entonces** soy redirigida a `/register?next=/product/[id]`
- **Y** tras completar el registro satisfactoriamente, soy redirigida a `/product/[id]` para continuar

**AC6 — Registro diferido al seguir artesana**
- **Dado** que soy visitante sin cuenta en el perfil de una artesana
- **Cuando** pulso "Seguir"
- **Entonces** soy redirigida a `/register?next=/artisan/[id]`
- **Y** tras completar el registro, soy redirigida al perfil de la artesana

**AC7 — Perfil público de artesana (ya existente, sin regresiones)**
- El perfil público de artesana en `/artisan/[id]` ya existe con SSR + generateMetadata
- Los productos ACTIVOS en la pestaña de catálogo de la artesana deben enlazar a `/product/[id]`
- El botón "Seguir" debe ser visible para visitantes sin cuenta (actualmente solo se muestra para compradores autenticados)

## Tasks / Subtasks

- [x] T1 — Crear `ProductCard` público (AC1, AC3)
  - [x] T1.1: Crear `src/components/ProductCard.tsx` (buyer-facing, diferente del studio)
  - [x] T1.2: Muestra imagen (aspect-square, object-cover), nombre producto, precio formateado, nombre artesana, avatar artesana
  - [x] T1.3: Es un `<Link href="/product/[id]">` completo (toda la card es clickable)
  - [x] T1.4: `role="article"` en el `<article>` wrapper, alt descriptivo en imagen
  - [x] T1.5: Hover: zoom imagen suave (`scale-105`) + sombra (`hover:shadow-md hover:-translate-y-0.5`) — mismo patrón que ArtisanProfileTabs activos

- [x] T2 — Transformar página principal `/` en catálogo público (AC1, AC2)
  - [x] T2.1: Convertir `src/app/page.tsx` a Server Component con fetch de productos
  - [x] T2.2: Si hay sesión: ARTISAN → redirect `/studio/products`, BUYER → redirect `/feed`
  - [x] T2.3: Sin sesión: renderizar catálogo público SSR con los productos ACTIVOS más recientes
  - [x] T2.4: Añadir `export const metadata` estático con título y descripción genérica de Artelier
  - [x] T2.5: Grid responsive: 2 cols móvil, 3 cols md, 4 cols lg — con `ProductCard` del paso T1
  - [x] T2.6: Empty state si no hay productos activos: "Pronto habrá artesanas aquí" (texto ligero, sin CTA)
  - [x] T2.7: Quitar `export const dynamic = "force-dynamic"` — la home pública puede ser estática (ISR o estática)

- [x] T3 — Crear página de detalle de producto `/product/[id]` (AC4, AC5)
  - [x] T3.1: Crear `src/app/(buyer)/product/[id]/page.tsx` como Server Component
  - [x] T3.2: Implementar `generateMetadata` con `title`, `description` y `openGraph` (og:title, og:description, og:image con primera foto)
  - [x] T3.3: Fetch del producto con `db.product.findFirst({ where: { id, deletedAt: null, status: "ACTIVE" } })`
  - [x] T3.4: Incluir en la query: `artisan` (id, name, image, locality), `seals` (seal.name, seal.type)
  - [x] T3.5: Si no existe → `notFound()`
  - [x] T3.6: Sección de imagen: si hay varias fotos, mostrar la primera grande + miniaturas de las otras
  - [x] T3.7: Sección de info: nombre (font-display), precio (verde #3d5a4f), descripción, badge de tipo (PERISHABLE/UNIQUE/STANDARD)
  - [x] T3.8: Sección artesana: avatar (PaletteAvatar), nombre, localidad — todo es `<Link href="/artisan/[artisanId]">`
  - [x] T3.9: Sellos del producto con `SealBadge` (ya existe en `src/components/artisan/SealBadge.tsx`)
  - [x] T3.10: Botones CTA: "Comprar" y "Enviar mensaje" — ambos usan registro diferido si no hay sesión (ver T5)

- [x] T4 — Registro diferido: soporte `?next=` en register (AC5, AC6)
  - [x] T4.1: En `src/app/(auth)/register/page.tsx`: leer `searchParams.next` vía `useSearchParams()`
  - [x] T4.2: Pasar `next` a la Server Action `registerUser` como segundo parámetro
  - [x] T4.3: En `src/app/(auth)/register/actions.ts`: tras crear sesión exitosamente, redirigir a `next` si está presente y es una ruta relativa segura (starts with `/`), si no a la ruta por defecto
  - [x] T4.4: Validar que `next` no sea una URL externa (seguridad — prevenir open redirect)

- [x] T5 — Botones con registro diferido en producto y perfil (AC5, AC6)
  - [x] T5.1: En `src/app/(buyer)/product/[id]/page.tsx`: detectar sesión con `getServerSession()`
  - [x] T5.2: Si sin sesión: botones "Comprar" y "Enviar mensaje" son `<Link href="/register?next=/product/[id]">` simples
  - [x] T5.3: Si con sesión y BUYER: botones funcionales (pueden mostrar placeholder por ahora — el checkout es Epic 5)
  - [x] T5.4: En `src/app/(buyer)/artisan/[id]/page.tsx`: pasar `canFollow` como `true` también para visitantes sin sesión que no son el artesano
  - [x] T5.5: Modificar `FollowButton` para aceptar prop `redirectTo?: string`; si está presente, el click redirige con `window.location.href = redirectTo` en lugar de llamar a la Server Action

- [x] T6 — Conectar perfil artesana → detalle producto (AC7)
  - [x] T6.1: En `src/components/artisan/ArtisanProfileTabs.tsx`: envolver los product cards ACTIVOS con `<Link href="/product/[id]">` (actualmente son `<div>` sin link)
  - [x] T6.2: Los productos SOLD y EXPIRED siguen sin ser clickables (ya están desactivados visualmente)

## Dev Notes

### Estado actual relevante del código

**`src/app/page.tsx`** — actualmente es un hub de redirección puro:
```typescript
if (!session?.user) redirect("/login"); // ← ESTO CAMBIA: visitas sin cuenta ven el catálogo
if (session.user.role === "ARTISAN") redirect("/studio/products");
redirect("/feed");
```
Quitar el `redirect("/login")` y renderizar el catálogo para usuarios sin sesión. Los redirects de ARTISAN y BUYER se mantienen.

**`src/components/artisan/ArtisanHeader.tsx`** — actualmente solo muestra `FollowButton` si `canFollow`:
```tsx
{!isOwnProfile && canFollow && (
  <FollowButton artisanId={artisan.id} initialIsFollowing={isFollowing} />
)}
```
En `(buyer)/artisan/[id]/page.tsx`, `canFollow = !isOwnProfile && isBuyer`. Para un visitante sin cuenta, `isBuyer` es false → no se muestra el botón. **Hay que cambiarlo**: mostrar el botón también para visitantes sin cuenta (que no son el artesano).

**`src/components/artisan/FollowButton.tsx`** — Client Component que llama directamente a la Server Action. Para el caso sin cuenta necesita redirigir a `/register?next=...` en lugar de ejecutar la action. Añadir prop `redirectTo?: string`.

**`src/components/artisan/ArtisanProfileTabs.tsx`** — los product cards ACTIVOS tienen `cursor-pointer` y hover pero son `<div>` sin navegación. Hay que envolverlos con `<Link href={/product/${product.id}}>`.

**`src/app/(auth)/register/page.tsx` + `actions.ts`** — no soportan `?next=`. La página es un Client Component; puede leer `searchParams` desde `useSearchParams()`. La action necesita recibir el `next` y redirigir a él tras el registro.

### ProductCard público (T1) — anatomía exacta

```
<article role="article">
  <Link href={`/product/${product.id}`}>
    <div class="aspect-square overflow-hidden">
      <Image fill object-cover scale-105-on-hover />
    </div>
    <div class="p-2">
      <p class="font-display text-base truncate">{name}</p>
      <p class="text-xs text-[#3d5a4f]">{price}</p>
      <div class="flex items-center gap-1 mt-1">
        <PaletteAvatar size small />
        <p class="text-xs text-[--text-muted] truncate">{artisanName}</p>
      </div>
    </div>
  </Link>
</article>
```

No incluye botones de editar/borrar (esos son del ProductCard del studio en `src/app/(artisan)/studio/products/ProductCard.tsx`).

### Página de detalle `/product/[id]` — fetch pattern

```typescript
const product = await db.product.findFirst({
  where: { id, deletedAt: null, status: "ACTIVE" },
  include: {
    artisan: { select: { id: true, name: true, image: true, locality: true } },
    seals: { include: { seal: { select: { name: true, type: true } } } },
  },
});
if (!product) notFound();
```

**Nota importante**: usar `findFirst` (no `findUnique`) porque la query incluye filtros no únicos (`deletedAt`, `status`).

### Registro diferido — patrón seguro

```typescript
// En actions.ts — tras registro exitoso:
const nextUrl = formData.get("next") as string | null;
const safeNext = nextUrl?.startsWith("/") ? nextUrl : null; // prevenir open redirect
redirect(safeNext ?? (role === "ARTISAN" ? "/studio/products" : "/feed"));
```

El `next` nunca debe ser una URL externa (validar que empiece con `/`).

### generateMetadata para producto

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, deletedAt: null },
    select: { name: true, description: true, imageUrls: true, artisan: { select: { name: true } } },
  });
  if (!product) return {};
  return {
    title: `${product.name} — ${product.artisan.name ?? "Artesana"} | Artelier`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.imageUrls[0] ? [{ url: product.imageUrls[0] }] : [],
    },
  };
}
```

### Convenciones de código del proyecto

- Server Components por defecto; `"use client"` solo cuando hay estado/interactividad
- Rutas del grupo `(buyer)` tienen `AppHeader` + `AppFooter` vía `layout.tsx`
- `PaletteAvatar` en `src/components/PaletteAvatar.tsx` — acepta `src`, `name`, `className`
- `SealBadge` en `src/components/artisan/SealBadge.tsx`
- Precios: siempre en centavos en BD, formatear con `toLocaleString("es-ES", { style: "currency", currency: "EUR" })`
- Colores: verde oscuro `#3d5a4f`, ámbar `#c4956a`, bg `--bg`, superficie `--surface`
- Font-display = The Girl Next Door (GND) para nombres de productos y títulos
- `font-sans` (DM Sans) para texto corriente, precios, nombres artesana

### Lo que NO hace H3.1 (no implementar)

- Scroll infinito / cursor pagination → H3.2
- Filtros y búsqueda → H3.3
- Feed personalizado (artesanas seguidas) → H3.2
- Flujo de compra real (Stripe) → Épico 5
- Flujo de mensajes real → Épico 4
- Los botones "Comprar" y "Enviar mensaje" en el producto deben existir pero pueden ser placeholders visualmente correctos; para usuarios autenticados muestran un `toast("Próximamente")` por ahora

### Commits recientes relevantes

- `feat(2.4)` — introduce `src/lib/product-badges.ts` (helper de badges, reutilizable)
- `feat(2.1)` — patrón del wizard de nuevo producto (foto-primero)
- `feat(H1.3)` — ArtisanHeader + ArtisanProfileTabs (base del perfil público)

### Project Structure Notes

- El ProductCard público va en `src/components/` (compartido, no en `(artisan)/studio`)
- La página de detalle va en `src/app/(buyer)/product/[id]/page.tsx` — dentro del grupo buyer para heredar AppHeader + AppFooter
- NO crear `src/app/(buyer)/feed/page.tsx` en esta historia — el feed personalizado es H3.2
- El `src/app/feed/page.tsx` actual (placeholder vacío) se deja como está — lo implementa H3.2

### References

- [Source: architecture.md#L443] — `(buyer)/feed/page.tsx` FR21–FR23
- [Source: architecture.md#L447] — `(buyer)/product/[id]/page.tsx` FR15–FR20
- [Source: architecture.md#L703] — Patrón SEO con generateMetadata
- [Source: epics.md#L628] — Historia 3.1 completa con ACs
- [Source: ux-design-specification.md#L649] — Anatomía de ProductCard
- [Source: ux-design-specification.md#L79] — Acceso público sin registro + registro diferido
- [Source: ux-design-specification.md#L531] — User journey: llega → feed → perfil artesana → registro

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- T1: `src/components/ProductCard.tsx` creado como Server Component; usa `getProductBadge`, `PaletteAvatar`, `Link`, `Image`. Card completa es `<Link>`. Hover: `hover:-translate-y-0.5 hover:shadow-md` + `group-hover:scale-105` en imagen.
- T2: `src/app/page.tsx` transformado — elimina redirect a /login para visitantes, añade metadata estático, fetch de 40 productos ACTIVE, grid responsive 2/3/4 cols, empty state.
- T3: `src/app/(buyer)/product/[id]/page.tsx` creado con SSR, `generateMetadata` (og:title, og:description, og:image), galería primaria + miniaturas, TYPE_LABELS, SealBadge, CTAs con registro diferido para no autenticados, tarjeta artesana.
- T4: `registerUser` acepta `next?: string` como segundo parámetro; valida que empiece con `/` (open redirect prevention); `register/page.tsx` lee `useSearchParams().get("next")` y lo pasa a la action.
- T5: `FollowButton` acepta `redirectTo?: string`; si presente, `handleClick` hace `window.location.href = redirectTo`. `ArtisanHeader` acepta y pasa `followRedirectTo`. `artisan/[id]/page.tsx` extiende `canFollow` a visitantes sin sesión y calcula `followRedirectTo`.
- T6: `ArtisanProfileTabs` — productos ACTIVE ahora son `<Link href="/product/[id]">` usando patrón de wrapper condicional (ACTIVE=Link, no-ACTIVE=div) con contenido compartido.

### File List

**Nuevos:**
- `src/components/ProductCard.tsx`
- `src/app/(buyer)/product/[id]/page.tsx`

**Actualizados:**
- `src/app/page.tsx`
- `src/components/artisan/ArtisanProfileTabs.tsx`
- `src/components/artisan/ArtisanHeader.tsx`
- `src/components/artisan/FollowButton.tsx`
- `src/app/(buyer)/artisan/[id]/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/register/actions.ts`
- `src/components/BackButton.tsx` (P1)
- `src/app/(buyer)/product/[id]/page.tsx` (P3, D3, D4)
- `src/app/(buyer)/account/AccountForm.tsx` (P4, D1)
- `src/app/(buyer)/product/[id]/ImageCarousel.tsx` (fix lint)

**Nuevos:**
- `src/app/HomeGrid.tsx`

### Review Findings

#### Decision Needed
- [x] [Review][Decision] D1 — Eliminar foto sin confirmación: `handleDeletePhoto` elimina la foto inmediatamente y persiste en BD sin diálogo de confirmación. ¿Es intencionado o hay que añadir un confirm? → Resuelto: añadido `confirm()` nativo antes de eliminar.
- [x] [Review][Decision] D2 — saveProfileImage inmediato antes del submit: la foto se guarda en BD al confirmar el recorte, sin esperar al submit del formulario. Si la usuaria cancela la edición, la foto ya está persistida pero el resto de cambios no. ¿Es comportamiento intencionado (como WhatsApp)? → Dejado como está (comportamiento intencionado).
- [x] [Review][Decision] D3 — ARTISAN autenticada ve botones CTA muertos en `/product/[id]`: el bloque CTA solo distingue sesión/no-sesión, no el rol. Una artesana autenticada ve "Comprar" y "Enviar mensaje" como botones sin acción. → Resuelto: CTAs ocultos para usuarios con rol ARTISAN.
- [x] [Review][Decision] D4 — Artesana viendo su propio producto ve enlace "Ver perfil" apuntando a su propio perfil público. → Resuelto: muestra "Ver tu perfil público" cuando la artesana es la propietaria del producto.

#### Patches
- [x] [Review][Patch] P1 — BackButton sin fallback: `router.back()` no hace nada si el usuario llega directamente desde Google/enlace compartido. Añadir `window.history.length <= 1` con fallback `router.push("/")` [src/components/BackButton.tsx] → Aplicado.
- [x] [Review][Patch] P2 — Open redirect protocol-relative: `next?.startsWith("/")` no bloquea `//evil.com`. Fix: añadir `&& !next.startsWith("//")` [src/app/(auth)/register/actions.ts:80] → Aplicado.
- [x] [Review][Patch] P3 — generateMetadata producto sin filtro de status: la query incluye productos SOLD/EXPIRED (solo filtra `deletedAt: null`), generando OG tags válidos para páginas que devuelven 404. Fix: añadir `status: "ACTIVE"` [src/app/(buyer)/product/[id]/page.tsx] → Aplicado.
- [x] [Review][Patch] P4 — handleCropConfirm sin feedback en fallo silencioso: si el upload responde 200 pero sin `json.data?.url`, el spinner desaparece sin mensaje y la foto no se guarda. Añadir `else { setUploadError("...") }` [src/app/(buyer)/account/AccountForm.tsx] → Aplicado.

#### Deferred
- [x] [Review][Defer] W1 — Validación de campos de dirección (código postal, provincia aceptan cualquier string) — diferido, pendiente para Epic 5 checkout
- [x] [Review][Defer] W2 — HomeGrid: `activeBtn` no se resincroniza al redimensionar la ventana — diferido, cosmético aceptable para V1
- [x] [Review][Defer] W3 — handleReajustar: fetch CORS de Cloudinary puede fallar en entornos restringidos — diferido, fallback al file picker es aceptable
- [x] [Review][Defer] W4 — Tras registro diferido, la usuaria debe volver a pulsar "Comprar"/"Seguir" — diferido, limitación de diseño del flujo actual

### Change Log

- 2026-06-03: Implementación completa H3.1 — T1–T6 completados, todos los ACs satisfechos. Status → review.
- 2026-06-04: Code review — 4 decision-needed, 4 patches, 4 deferred, 7 dismissed. Status → in-progress.
- 2026-06-04: Revisión UX completa (HomeGrid responsive, auth pages, AppHeader, logout redirect). Patches P1–P4 aplicados. Decisions D1/D3/D4 resueltas, D2 dejado como está. Build ok. Status → done.
