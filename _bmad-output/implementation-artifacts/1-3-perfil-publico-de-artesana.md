# Story 1.3: Perfil público de artesana

Status: review

## Story

Como artesana,
quiero crear y editar mi perfil público con foto, nombre, descripción, localidad y categoría,
para que las compradoras me descubran y conozcan mi trabajo.

## Acceptance Criteria

1. **[Perfil público accesible]** Dado que una artesana ha guardado su perfil en `/studio/profile`, cuando cualquier visitante (autenticado o no) accede a `/artisan/[id]`, entonces ve la página con nombre, avatar, localidad, bio y productos ACTIVE de la artesana; la página es indexable (sin `noindex`) e incluye meta tags Open Graph con nombre y foto.

2. **[ArtisanHeader en perfil público]** Dado que cualquier visitante accede a `/artisan/[id]`, cuando la página carga, entonces el componente `ArtisanHeader` muestra: banner, avatar, nombre en The Girl Next Door, localidad, bio breve (máx 150 caracteres) y botón "Seguir" (placeholder sin funcionalidad — la implementación real es Historia 1.4).

3. **[Formulario de edición de perfil]** Dado que una artesana autenticada accede a `/studio/profile`, cuando edita nombre, bio, localidad y foto de perfil/banner y guarda, entonces los cambios se persisten en BD y se reflejan inmediatamente en `/artisan/[id]`.

4. **[Upload de imágenes a Cloudinary]** Dado que una artesana sube una foto de perfil o banner desde `/studio/profile`, cuando el upload se procesa, entonces la imagen va a `POST /api/upload` (las credenciales Cloudinary nunca llegan al cliente) y el `publicId` devuelto se guarda en `User.image` (avatar) o `User.bannerImage` (banner).

5. **[Actualizaciones de proceso]** Dado que una artesana publica una actualización de proceso (texto obligatorio + foto opcional) desde `/studio/profile`, cuando la guarda, entonces aparece en la pestaña "Proceso" del perfil público en orden cronológico inverso, con el texto en blockquote estilo The Girl Next Door.

## Tasks / Subtasks

- [x] Task 1: Añadir campo `bannerImage` al modelo User y migrar (AC: 4)
  - [x] En `prisma/schema.prisma`, añadir `bannerImage String?` y `bio String?` al modelo `User`
  - [x] Ejecutar `npx prisma migrate dev --name add-user-bio-and-banner`
  - [x] Regenerar cliente: `npx prisma generate`
  - [x] Verificar `npm run typecheck`

- [x] Task 2: Crear página pública `/artisan/[id]` con SSR (AC: 1, 2)
  - [x] Crear `src/app/(buyer)/artisan/[id]/page.tsx` — Server Component async
  - [x] Usar `db.user.findUnique` con `include: { products: { where: { status: "ACTIVE", deletedAt: null } }, processUpdates: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } } }`
  - [x] Si el usuario no existe o no es ARTISAN: `notFound()` de next/navigation
  - [x] Exportar `generateMetadata` con Open Graph: `title`, `description` (bio), `images` (avatar via Cloudinary URL)
  - [x] Renderizar `ArtisanHeader` y grid de productos (tabs: Tienda / Proceso)

- [x] Task 3: Crear componente `ArtisanHeader` (AC: 2)
  - [x] Crear `src/components/artisan/ArtisanHeader.tsx` — Client Component (`"use client"`)
  - [x] Props: `artisan: { id, name, image, bannerImage, locality, bio }`, `isOwnProfile: boolean`
  - [x] Banner: imagen de Cloudinary con `object-fit: cover`, 100px alto en mobile / 120px en tablet
  - [x] Avatar: 64×64px superpuesto en parte inferior del banner, borde blanco 2px
  - [x] Nombre: The Girl Next Door, 18-20px
  - [x] Localidad + bio: DM Sans
  - [x] Botón "Seguir": placeholder visual (primario, pill) — sin acción real hasta H1.4
  - [x] Si `isOwnProfile`: no mostrar botón "Seguir"

- [x] Task 4: Crear layout de grupo `(buyer)` (AC: 1, 2)
  - [x] Crear `src/app/(buyer)/layout.tsx` — Server Component, sin auth check (rutas públicas)
  - [x] Layout mínimo que envuelva el contenido (puede ser simplemente `{children}`)

- [x] Task 5: Crear página `/studio/profile` de edición (AC: 3, 4, 5)
  - [x] Crear `src/app/(artisan)/studio/profile/page.tsx` — Server Component async
  - [x] Obtener sesión con `await auth()`, redirigir a `/login` si no autenticada, a `/feed` si no es ARTISAN
  - [x] Cargar datos actuales del usuario y sus `processUpdates` desde BD
  - [x] Renderizar formulario de edición de perfil (Client Component) y sección de Process Updates
  - [x] Crear `ProfileForm.tsx` — React Hook Form + Zod + upload avatar/banner
  - [x] Crear `ProcessUpdateForm.tsx` — formulario para nuevas actualizaciones de proceso
  - [x] Crear `ProcessUpdateList.tsx` — lista de actualizaciones existentes

- [x] Task 6: Crear layout de grupo `(artisan)` (AC: 3)
  - [x] Crear `src/app/(artisan)/layout.tsx` — Server Component
  - [x] No duplicar el auth check del middleware (el middleware ya protege `/studio/*`)

- [x] Task 7: Server Action para guardar perfil (AC: 3)
  - [x] Crear `src/app/(artisan)/studio/profile/actions.ts` con `"use server"`
  - [x] Schema Zod: `name` (string, trim, min 2), `bio` (string, max 150), `locality` (string, trim, min 2), `image` (string url, opcional), `bannerImage` (string url, opcional)
  - [x] Verificar sesión con `auth()` dentro del action (doble check de seguridad)
  - [x] Verificar que `session.user.role === "ARTISAN"`
  - [x] `db.user.update({ where: { id: session.user.id }, data: { name, bio, locality, image, bannerImage } })`
  - [x] Llamar `revalidatePath("/artisan/" + session.user.id)` para invalidar caché SSR del perfil público
  - [x] Retornar `{ success: true }` o `{ error: { code, fields? } }`

- [x] Task 8: Server Action para crear ProcessUpdate (AC: 5)
  - [x] En `src/app/(artisan)/studio/profile/actions.ts`, añadir `createProcessUpdate`
  - [x] Schema Zod: `content` (string, trim, min 1, max 500), `imageUrl` (string url, opcional)
  - [x] Verificar sesión y rol ARTISAN
  - [x] `db.processUpdate.create({ data: { artisanId: session.user.id, content, imageUrl } })`
  - [x] `revalidatePath("/artisan/" + session.user.id)`

- [x] Task 9: Actualizar `POST /api/upload` para soportar tipos de upload (AC: 4)
  - [x] Leer `src/app/api/upload/route.ts` actual
  - [x] Añadir soporte para `type`: `"avatar"` | `"banner"` | `"process"` | `"product"`
  - [x] En Cloudinary: usar `folder` según type (`artelier/avatars`, `artelier/banners`, etc.)
  - [x] Solo artesanas autenticadas pueden subir (verificar sesión en el route handler)

- [x] Task 10: Añadir claves i18n (AC: 1–5)
  - [x] En `src/i18n/messages/es.json`, añadir sección `"profile"`:
    - `"editProfile"`, `"saveChanges"`, `"bio"`, `"bioPlaceholder"`, `"bioMaxLength"`
    - `"follow"`, `"following"`, `"followers"`, `"products"`, `"process"`
    - `"noProducts"`, `"noProcessUpdates"`, `"addProcessUpdate"`, `"processUpdatePlaceholder"`
    - `"uploadAvatar"`, `"uploadBanner"`, `"profileSaved"`

- [x] Task 11: Verificación final (AC: 1–5)
  - [x] `npm run typecheck` — passed
  - [x] `npm run build` con `SKIP_ENV_VALIDATION=true` — passed (12 páginas compiladas, 0 errores)

## Dev Notes

### Estructura de rutas a crear

```
src/app/
  (artisan)/
    layout.tsx                    ← NEW: layout grupo artesana (sin auth check — lo hace middleware)
    studio/
      profile/
        page.tsx                  ← NEW: edición de perfil (Server Component)
        actions.ts                ← NEW: saveProfile + createProcessUpdate
  (buyer)/
    layout.tsx                    ← NEW: layout grupo comprador (sin auth check)
    artisan/
      [id]/
        page.tsx                  ← NEW: perfil público (Server Component, SSR)

src/components/
  artisan/
    ArtisanHeader.tsx             ← NEW: cabecera del perfil
```

**IMPORTANTE:** Los grupos de ruta `(artisan)` y `(buyer)` son solo organizativos. Las rutas reales son `/studio/profile` y `/artisan/[id]`. El middleware ya protege `/studio/*` — no añadir auth checks redundantes en el layout.

### Campo `bannerImage` — migración necesaria

El modelo `User` actual NO tiene campo `bannerImage`. Es necesario añadirlo antes de implementar el formulario:

```prisma
model User {
  // ... campos existentes ...
  image       String?   // ← ya existe (avatar)
  bannerImage String?   // ← NUEVO — URL de Cloudinary
}
```

Ejecutar migración: `npx prisma migrate dev --name add-user-banner-image`

### Obtener sesión en Server Components

Patrón establecido en H1.1/H1.2:

```typescript
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function StudioProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      processUpdates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  // ...
}
```

### Open Graph con `generateMetadata`

Next.js App Router — exportar función `generateMetadata` desde el page:

```typescript
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artisan = await db.user.findUnique({ where: { id } });
  if (!artisan) return {};

  return {
    title: `${artisan.name ?? "Artesana"} — Artelier`,
    description: artisan.bio ?? undefined,
    openGraph: {
      title: artisan.name ?? "Artesana",
      description: artisan.bio ?? undefined,
      images: artisan.image ? [{ url: artisan.image }] : [],
    },
  };
}
```

**IMPORTANTE — `params` en Next.js 15 es una Promise:** En Next.js 15 (que usa este proyecto), `params` y `searchParams` son Promises. Siempre `await params` antes de desestructurar.

```typescript
// ✅ CORRECTO en Next.js 15:
export default async function ArtisanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}

// ❌ INCORRECTO (Next.js 14 y anterior):
export default async function ArtisanPage({ params }: { params: { id: string } }) {
  const { id } = params; // TypeError en Next.js 15
}
```

### Upload a Cloudinary — patrón del route handler existente

El endpoint `POST /api/upload` ya existe. Leer `src/app/api/upload/route.ts` antes de modificarlo. El patrón esperado para el cliente:

```typescript
// En el formulario (Client Component):
const formData = new FormData();
formData.append("file", file);
formData.append("type", "avatar"); // o "banner", "process"

const res = await fetch("/api/upload", { method: "POST", body: formData });
const { publicId, url } = await res.json();
// Guardar url en el estado y enviar al Server Action
```

En Cloudinary, las URLs se construyen así:
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformaciones}/{publicId}
```

Para evitar credenciales en cliente, el route handler hace el upload firmado server-side y devuelve solo el `publicId` y la URL pública.

### `revalidatePath` — invalidar caché del perfil público

Después de guardar cambios en el perfil, hay que invalidar el caché SSR para que `/artisan/[id]` muestre los datos actualizados:

```typescript
import { revalidatePath } from "next/cache";

// En saveProfile action:
revalidatePath(`/artisan/${session.user.id}`);
```

Sin esto, el perfil público mostraría datos stale del build hasta el siguiente deploy.

### Botón "Seguir" — placeholder para H1.4

**NO implementar** la lógica de follow en esta historia. El botón debe:
- Renderizarse visualmente (primario, pill, texto "Seguir")
- No tener `onClick` funcional (o `disabled`)
- No aparecer si `isOwnProfile === true`

La funcionalidad completa (optimistic updates, `db.follow.create/delete`) se implementa en H1.4.

### TRAMPA: `(buyer)` y `(artisan)` como route groups

Next.js interpreta los paréntesis como **route groups** — son transparentes en la URL. Es decir:
- `src/app/(buyer)/artisan/[id]/page.tsx` → URL: `/artisan/[id]` ✅
- `src/app/(artisan)/studio/profile/page.tsx` → URL: `/studio/profile` ✅

El middleware ya protege `/studio/*` con el check de sesión. El layout `(artisan)/layout.tsx` **no debe** repetir ese check — causaría doble redirect si algo falla.

### Pestaña "Proceso" — ProcessUpdate

```typescript
// Ordenar cronológicamente inverso (más reciente primero):
const processUpdates = await db.processUpdate.findMany({
  where: { artisanId: id, deletedAt: null },
  orderBy: { createdAt: "desc" },
});
```

Cada `ProcessUpdate` muestra:
- Nombre de la artesana (The Girl Next Door, 15px, bold)
- Timestamp formateado (DM Sans, 10-11px, muted) — usar `Intl.DateTimeFormat` o `date-fns`
- Texto entre comillas en blockquote (The Girl Next Door, 13px, fondo tintado `--surface`)
- Imagen opcional: si existe `imageUrl`, renderizar con `next/image`

### Tokens CSS disponibles (establecidos en H0.2)

```css
--primary:    #3D5A4F   /* verde pizarra — botones primarios */
--accent:     #C4956A   /* ámbar — detalles */
--bg:         #F4F0E8   /* crema — fondo general */
--surface:    #EAE5DA   /* tarjetas, blockquotes */
--text:       #1A1A18   /* marrón oscuro — texto principal */
--text-muted: #5A5648   /* texto secundario */
--border:     #CCC8BC   /* bordes */
```

Fuentes disponibles:
- `font-display` → The Girl Next Door (nombres, títulos, blockquotes)
- base → DM Sans (cuerpo, UI)

### Learnings de H1.1 y H1.2

- **Server Actions**: siempre verificar sesión dentro del action (`await auth()`), aunque el middleware ya proteja la ruta. Defense in depth.
- **Zod + safeParse**: retornar `{ error: { code, fields } }` para errores de validación, nunca lanzar.
- **`"use client"` solo donde hace falta**: los formularios con estado (React Hook Form, useState) son Client Components. Las páginas que solo leen datos son Server Components.
- **PowerShell y rutas con paréntesis**: al hacer `git add`, siempre poner entre comillas los paths con `(artisan)` o `(buyer)`.

### Dependencias futuras (no implementar en H1.3)

- **H1.4**: botón "Seguir" funcional con relación `Follow` en BD + optimistic updates
- **H2.1**: grid de productos en el perfil (en H1.3 mostrar grid vacío o mensaje "sin productos")
- **H7.x**: sellos (`SealBadge`) en cabecera y en tarjetas de producto

## Dev Agent Record

### Completion Notes

- Todos los ACs implementados y verificados con build limpio.
- `(buyer)` y `(artisan)` son route groups transparentes — URLs `/artisan/[id]` y `/studio/profile` sin prefijo.
- `ArtisanProfileTabs` implementa tabs Tienda/Proceso con grid de productos y lista de process updates.
- Upload `/api/upload` actualizado con auth check y routing de carpetas Cloudinary por tipo.
- `ProcessUpdateForm` y `ProcessUpdateList` usan `"use client"` mínimo — la página es Server Component.
- ESLint `prefer-nullish-coalescing`: todos los `||` para valores opcionales de BD cambiados a `??`.

## File List

- `prisma/schema.prisma` — añadido `bannerImage String?` y `bio String?` al modelo User
- `prisma/migrations/` — migración `add-user-bio-and-banner`
- `src/app/(buyer)/layout.tsx` — nuevo layout grupo buyer
- `src/app/(buyer)/artisan/[id]/page.tsx` — perfil público con generateMetadata + Open Graph
- `src/app/(artisan)/layout.tsx` — nuevo layout grupo artisan
- `src/app/(artisan)/studio/profile/page.tsx` — página edición de perfil
- `src/app/(artisan)/studio/profile/actions.ts` — saveProfile + createProcessUpdate
- `src/app/(artisan)/studio/profile/ProfileForm.tsx` — formulario con upload avatar/banner
- `src/app/(artisan)/studio/profile/ProcessUpdateForm.tsx` — formulario nueva actualización
- `src/app/(artisan)/studio/profile/ProcessUpdateList.tsx` — lista actualizaciones existentes
- `src/components/artisan/ArtisanHeader.tsx` — cabecera pública con banner/avatar/follow
- `src/components/artisan/ArtisanProfileTabs.tsx` — tabs Tienda/Proceso
- `src/app/api/upload/route.ts` — auth check + routing por tipo de upload
- `src/i18n/messages/es.json` — namespace "profile" añadido

## Change Log

- 2026-05-21: Historia 1.3 implementada completa. Build + typecheck limpios.
