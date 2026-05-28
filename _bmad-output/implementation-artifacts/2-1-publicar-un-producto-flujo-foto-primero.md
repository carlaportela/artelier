# Historia 2.1: Publicar un producto — flujo foto-primero

## Status: ready-for-dev

## Story

Como artesana autenticada,
quiero publicar un producto en 3 pasos desde el móvil empezando por la foto,
para tener mi catálogo en línea con la mínima fricción posible.

## Acceptance Criteria

**AC1 — Paso 1: selección de fotos**
- Dado que soy artesana autenticada y pulso "+" en la ArtisanBottomNav
- Cuando se abre el flujo de publicación
- Entonces el primer paso es seleccionar 1–3 fotos (cámara o galería), con vista previa reordenable
- Y no hay campos de texto visibles en este primer paso
- Y el botón "Siguiente" está deshabilitado hasta que haya al menos 1 foto seleccionada

**AC2 — Paso 2: datos del producto**
- Dado que he seleccionado las fotos y avanzo al paso 2
- Cuando veo el formulario
- Entonces aparecen: nombre del producto, precio en euros, descripción breve (máx. 280 caracteres con contador visible) y tipo (Única pieza / Perecedero / Otro)
- Y si elijo "Perecedero", aparece un campo de fecha límite de disponibilidad
- Y si elijo "Única pieza", el stock queda implícitamente fijado en 1 unidad (tipo UNIQUE en BD)

**AC3 — Publicar con éxito**
- Dado que completo los campos obligatorios y pulso "Publicar"
- Cuando el sistema procesa la publicación
- Entonces el producto aparece en mi pestaña "Tienda" en `/artisan/[id]` con status ACTIVE
- Y veo un toast: "Tu producto ya está en línea"
- Y si es mi primer producto, el toast especial dice: "¡Tu primera pieza ya está en Artelier!"

**AC4 — Validación de campos**
- Dado que omito precio o foto
- Cuando intento publicar
- Entonces el campo específico muestra su error junto a él, no un mensaje genérico arriba

**AC5 — Upload de fotos**
- Dado que selecciono fotos
- Cuando se suben al servidor
- Entonces van a `POST /api/upload` con `type: "product"` → Cloudinary (artelier/products)
- Y los `imageUrls` resultantes se guardan en la base de datos

**AC6 — Navegación artesana**
- Dado que soy artesana autenticada
- Cuando navego por el área studio
- Entonces veo la ArtisanBottomNav con: Mis productos / [+] central / Mi perfil
- Y el ítem activo está visualmente destacado

## Tasks/Subtasks

- [x] T1: Crear `ArtisanBottomNav` (AC6)
  - [x] T1.1: Crear `src/components/ArtisanBottomNav.tsx` — Client Component con 3 ítems: Mis productos (ShoppingBag) · [+] central elevado · Mi perfil (User)
  - [x] T1.2: Usar `usePathname()` para indicador de ítem activo
  - [x] T1.3: Aplicar tamaño táctil mínimo 44×44px en todos los ítems

- [x] T2: Añadir `ArtisanBottomNav` al layout artesana (AC6)
  - [x] T2.1: Modificar `src/app/(artisan)/layout.tsx` — importar y renderizar `<ArtisanBottomNav />` debajo de `{children}`, añadir `pb-20` al contenedor principal para que el contenido no quede oculto bajo la nav

- [x] T3: Server action `createProduct` (AC3, AC4, AC5)
  - [x] T3.1: Crear `src/app/(artisan)/studio/products/new/actions.ts`
  - [x] T3.2: Definir `createProductSchema` con Zod: `name` (min 2), `description` (max 280), `priceInCents` (int, min 1), `type` (enum UNIQUE/PERISHABLE/STANDARD), `imageUrls` (array min 1 max 3), `category` (min 1), `expiresAt` (string datetime opcional)
  - [x] T3.3: Verificar sesión y rol ARTISAN; devolver `FORBIDDEN` si no es artesana
  - [x] T3.4: Antes de crear, contar productos ACTIVE del artesana para detectar `isFirstProduct`
  - [x] T3.5: Crear producto en BD con `locality` auto-rellenada desde `session.user` (query adicional si no está en sesión)
  - [x] T3.6: Llamar a `revalidatePath` para `/artisan/[id]` y `/studio/products`
  - [x] T3.7: Devolver `{ success: true, isFirstProduct: boolean }`

- [x] T4: Página `/studio/products/new` — wizard 2 pasos (AC1, AC2, AC3, AC4, AC5)
  - [x] T4.1: Crear `src/app/(artisan)/studio/products/new/page.tsx` — Server Component que verifica sesión y rol, renderiza el Client Component
  - [x] T4.2: Crear el Client Component del wizard con estado `step: 1 | 2`
  - [x] T4.3: Paso 1 — `<input type="file" multiple accept="image/*">`, previsualización inmediata, botones ↑↓ para reordenar, upload a `/api/upload?type=product` al seleccionar, spinner mientras sube, máximo 3 fotos
  - [x] T4.4: Paso 2 — campos: nombre, precio (euros → cents), descripción (contador 280), tipo (select), fecha si PERISHABLE, categoría (select predefinido)
  - [x] T4.5: Botón "Publicar" llama a `createProduct` server action; muestra errores inline junto a cada campo
  - [x] T4.6: En éxito: toast Sonner normal o especial según `isFirstProduct`; redirigir a `/studio/products`

- [x] T5: Página `/studio/products` — lista de productos de la artesana
  - [x] T5.1: Crear `src/app/(artisan)/studio/products/page.tsx` — Server Component que verifica sesión y rol
  - [x] T5.2: Consultar productos propios (ACTIVE + SOLD, `deletedAt: null`), ordenados por `createdAt desc`
  - [x] T5.3: Mostrar grid 2 columnas con imagen, nombre y precio
  - [x] T5.4: Estado vacío con CTA "Publica tu primera pieza" → `/studio/products/new`

- [x] T6: Typecheck y build
  - [x] T6.1: `npm run typecheck` sin errores
  - [x] T6.2: `npm run build` con `SKIP_ENV_VALIDATION=true` sin errores

### Review Findings (2026-05-28 — 6 reviewers, 2 grupos)

**Decisiones necesarias (D):**

- [x] [Review][Decision] D1 — **MAX_IMAGES=7 vs spec 1–3** — Decisión: mantener 7 (expansión intencionada). Spec desactualizado. [NewProductWizard.tsx + actions.ts]
- [x] [Review][Decision] D2 — **dnd-kit en lugar de botones ↑↓** — Decisión: mantener dnd-kit (mejor UX desktop). Dev Notes desactualizadas. [NewProductWizard.tsx]
- [x] [Review][Decision] D3 — **ArtisanBottomNav tiene 5 ítems en lugar de 3** — Decisión: mantener 5 (expansión de scope intencionada). [ArtisanBottomNav.tsx]
- [x] [Review][Decision] D4 — **Categorías difieren del spec** — Decisión: mantener las actuales (Alimentación, Perfumería, etc.). Spec desactualizado. [NewProductWizard.tsx]

**Parches obligatorios — bugs / violaciones de spec (P):**

- [x] [Review][Patch] P1 — **"Estándar" debe ser "Otro"** — AC2 + Dev Notes: `STANDARD → "Otro"`. La implementación muestra "Estándar". [NewProductWizard.tsx:193-197]
- [x] [Review][Patch] P2 — **`expiresAt` acepta cualquier string y no verifica fecha futura** — Zod solo tiene `z.string().optional()`. `new Date("abc")` guardado en Prisma lanza excepción no controlada. Sin validación de fecha futura, producto puede crearse ya caducado. [actions.ts:Zod schema + createProduct]
- [x] [Review][Patch] P3 — **`db.product.create()` sin try/catch** — Si Prisma lanza, el server action no retorna nada; el cliente recibe `undefined`, el resultado se evalúa silenciosamente como void sin mostrar error. [actions.ts:db.product.create]
- [x] [Review][Patch] P4 — **Stale closure en `handleCropConfirm` sobre `cropQueue`** — `cropQueue` se captura en el closure en el momento de la llamada async; si hay dos uploads solapados, la cola queda desincronizada. [NewProductWizard.tsx:handleCropConfirm]
- [x] [Review][Patch] P5 — **Error de upload no drena `cropQueue`** — Si el fetch falla o lanza, la cola no se vacía y el siguiente CropModal se abre inmediatamente tras un error. [NewProductWizard.tsx:handleCropConfirm]
- [x] [Review][Patch] P6 — **Precio sin límite superior → overflow Int32 de Prisma** — `priceInCents = Math.round(parseFloat(priceEuros) * 100)` sin cap; "99999999" → 9.999.999.900 > 2.147.483.647; Prisma lanza P2020. [NewProductWizard.tsx:handlePublish + actions.ts]
- [x] [Review][Patch] P7 — **`handleSave` en StudioProfileEditor muestra "Cambios guardados" en error genérico** — Solo el `VALIDATION_ERROR` tiene rama de manejo; cualquier otro error (red, BD) cierra el formulario y muestra el mensaje de éxito. [StudioProfileEditor.tsx:handleSave]
- [x] [Review][Patch] P8 — **`onSuccess()` en PublicacionesView se llama antes de que la acción resuelva** — El `startTransition(async () => { ... })` llama `onSuccess()` inmediatamente tras `await`, pero si la acción devuelve un error de validación, el Sheet se cierra sin feedback. [PublicacionesView.tsx:handleSubmit]
- [x] [Review][Patch] P9 — **CropModal usa `id="palette-crop-mask"` fijo → colisión si hay dos instancias** — Si se abren avatar y banner en rápida sucesión, el segundo SVG mask referencia el del primero. Usar `useId()` como hace PaletteAvatar. [CropModal.tsx:SVG defs]
- [x] [Review][Patch] P10 — **`canvas.getContext('2d')` puede retornar null** — En modo privado / canvas deshabilitado, el assert `!` hace crash silencioso en `handleConfirm`. [CropModal.tsx:handleConfirm]
- [x] [Review][Patch] P11 — **`ArtisanHeader` con `studioMode=true` renderiza el avatar en el lado derecho** — El slot izquierdo (`{!studioMode && ...}`) queda vacío; el avatar aparece en la posición de FollowButton (derecha del flex-between). [ArtisanHeader.tsx:62-79]
- [x] [Review][Patch] P12 — **`AppHeader` muestra "¡Hola !" si `user.name` es null** — `user.name?.split(" ")[0]` produce `undefined`; no hay fallback string. [AppHeader.tsx]
- [x] [Review][Patch] P13 — **`handleDelete` en StudioProfileEditor sin try/catch** — Error en `saveProfile()` es silencioso; la imagen se elimina del estado local pero no del servidor. [StudioProfileEditor.tsx:handleDelete]
- [x] [Review][Patch] P14 — **Cambiar categoría a no-perecedero no resetea el tipo** — `handleCategoryChange` fuerza `PERISHABLE` al elegir categoría perecedera, pero no lo revierte al salir. El campo `expiresAt` queda visible y requerido innecesariamente. [NewProductWizard.tsx:handleCategoryChange]
- [x] [Review][Patch] P15 — **Cancelar mientras `isPending` produce race condition** — El botón Cancelar no se deshabilita durante la transición; resetea el estado mientras la server action está en vuelo. [StudioProfileEditor.tsx]
- [x] [Review][Patch] P16 — **UserMenu sin handler de tecla Escape** — `useEffect` cierra el menú en `mousedown` externo pero los usuarios de teclado no pueden cerrarlo con Escape (WCAG 2.1 SC 2.1.1). [UserMenu.tsx]
- [x] [Review][Patch] P17 — **Modal de PublicacionesView sin botón de cierre cuando el post no tiene imagen** — El botón X solo existe dentro del bloque `{viewPost.imageUrl && ...}`; sin imagen, solo el backdrop cierra el modal. [PublicacionesView.tsx:viewPost modal]
- [x] [Review][Patch] P18 — **LocalidadSelect usa solo `mousedown` para cerrar con clic exterior** — En dispositivos táctiles, el evento `mousedown` no se dispara; el dropdown queda abierto permanentemente. [LocalidadSelect.tsx:useEffect click-outside]
- [x] [Review][Patch] P19 — **LocalidadSelect usa IDs hardcodeados** — `id="localidad-listbox"` y `localidad-option-${i}` hardcodeados; si hay más de un `LocalidadSelect` en la página, el ARIA combobox está mal cableado para todas las instancias excepto una. [LocalidadSelect.tsx]
- [x] [Review][Patch] P20 — **`handleUpload` en StudioProfileEditor guarda valores de texto obsoletos** — Si el usuario escribe nombre/bio mientras sube una imagen, `saveProfile` captura el estado en el closure del momento de la llamada async, sobreescribiendo lo recién escrito. [StudioProfileEditor.tsx:handleUpload]
- [x] [Review][Patch] P21 — **Cancelar en StudioProfileEditor revierte al valor original del servidor, no al último guardado** — `handleCancel` resetea desde la prop `user` inicial; si el usuario guardó cambios y vuelve a editar, Cancelar borra el guardado anterior. [StudioProfileEditor.tsx:handleCancel]
- [x] [Review][Patch] P22 — **Input de archivo en PublicacionesView no se puede reseleccionar el mismo archivo** — El `value` del input no se limpia tras el upload; si el usuario sube una imagen, la elimina, y vuelve a seleccionar el mismo archivo, `onChange` no se dispara. [PublicacionesView.tsx:fileRef]
- [x] [Review][Patch] P23 — **Botón "Cerrar" en DatePickerField solo cierra el panel, no borra la selección** — El comentario JSX dice "Borrar selección" pero el `onClick` solo llama `setOpen(false)` sin `onChange("")`. [NewProductWizard.tsx:DatePickerField]
- [x] [Review][Patch] P24 — **LocalidadSelect: ArrowDown en lista vacía apunta aria-activedescendant a ID inexistente** — Cuando el input tiene menos de 2 chars y la lista está vacía, bajar con teclado incrementa `activo` a 0 pero el `<li id="localidad-option-0">` no existe en el DOM. [LocalidadSelect.tsx:handleKeyDown]
- [x] [Review][Patch] P25 — **ProfileForm: error de upload de imagen compartido entre avatar y banner** — Un estado `uploadError` se usa para ambos campos; si falla el avatar, el error aparece también junto al banner y viceversa. [ProfileForm.tsx]
- [x] [Review][Patch] P26 — **Comentario erróneo en pedidos/page.tsx** — El comentario de cabecera dice "Página de mensajes del estudio del artesano" (copiado de mensajes/page.tsx). [pedidos/page.tsx:1]
- [x] [Review][Patch] P27 — **Contador de descripción muestra warning rojo a partir de 260, no de 280** — `description.length > 260` activa el color rojo cuando aún quedan 20 caracteres válidos. [NewProductWizard.tsx:description field]
- [x] [Review][Patch] P28 — **Wizard renderiza `<main>` dentro de cada paso** — Dos elementos `<main>` conviven en el DOM (uno por paso); usar `<div>` o `<section>` en el page component renderizado dentro del artisan layout. [NewProductWizard.tsx:paso 1 y paso 2]
- [x] [Review][Patch] P29 — **Typo "Enlances legales" en AppFooter** — Debe ser "Enlaces legales". [AppFooter.tsx:JSX comment]
- [x] [Review][Patch] P30 — **`norm()` en LocalidadSelect usa rango Unicode literal en vez de escapes `\u`** — El regex `/[̀-ͯ]/g` es frágil (depende de encoding del fichero); mejor `/[̀-ͯ]/g`. [LocalidadSelect.tsx:norm()]
- [x] [Review][Patch] P31 — **No se renderiza `errors.imageUrls` en Paso 2** — El server action puede devolver `fieldErrors.imageUrls` si el array llega vacío por manipulación, pero no hay JSX que lo muestre (AC4). [NewProductWizard.tsx:Step 2]
- [x] [Review][Patch] P32 — **CropModal: tercer puntero durante pinch causa pan errático** — Cuando un 3.er puntero se suma a un pinch activo, `isDragging` permanece `true` y el branch de pan se ejecuta con `dragStart` obsoleto. [CropModal.tsx:onPointerDown/onPointerMove]
- [x] [Review][Patch] P33 — **DatePickerField bloquea "hoy" en zonas horarias UTC−** — `min` se calcula como fecha UTC (`new Date().toISOString().split("T")[0]`); en UTC-5 a las 23:00, la fecha UTC es mañana, bloqueando el día actual local en el calendario. [NewProductWizard.tsx:DatePickerField]

**Diferidos — pre-existentes o arquitectónicos (W):**

- [x] [Review][Defer] W1 — **Imágenes Cloudinary huérfanas al cancelar o quitar foto** — Cancel en paso 1/2 y `removeImage` no llaman a ningún DELETE; las imágenes quedan en el bucket. Requiere endpoint DELETE /api/upload. — deferred, pre-existing
- [x] [Review][Defer] W2 — **`imageUrls` acepta cualquier URL string (sin validación de dominio Cloudinary)** — Un cliente malicioso puede almacenar URLs externas. Requiere restricción de hostname en Zod (decisión arquitectónica). — deferred, pre-existing
- [x] [Review][Defer] W3 — **SelectField sin navegación por teclado** — Dropdown custom `<ul>` sin `onKeyDown`; falla WCAG 2.1 SC 2.1.1. Requiere refactorización sustancial. — deferred, pre-existing
- [x] [Review][Defer] W4 — **Race condition `isFirstProduct` (cosmético)** — Dos envíos simultáneos ven `count=0`; ambos devuelven `isFirstProduct=true`. Solo afecta al toast. — deferred, pre-existing
- [x] [Review][Defer] W5 — **Timer de blur en LocalidadSelect no se limpia en unmount** — `setTimeout` sin ref; puede llamar a `setState` en componente desmontado. — deferred, pre-existing
- [x] [Review][Defer] W6 — **LocalStorage en PublicacionesView causa layout shift en hidratación** — Preferencia grid/lista leída en `useEffect`; SSR y cliente renderizan diferente. Patrón conocido Next.js App Router. — deferred, pre-existing
- [x] [Review][Defer] W7 — **Año de copyright en AppFooter bakeado en build** — `new Date().getFullYear()` en Server Component; en páginas cacheadas estáticamente puede mostrar año pasado. — deferred, pre-existing
- [x] [Review][Defer] W8 — **`dragStart` en CropModal obsoleto tras pinch** — Estado de offset capturado en `onPointerDown` puede ser stale si un pinch actualiza `offset` entre eventos. — deferred, pre-existing
- [x] [Review][Defer] W9 — **`@ts-ignore` en PaletteAvatar sobre `<image>` SVG** — Suprime error de tipo sin investigar. `React.SVGProps<SVGImageElement>` sería la solución correcta. — deferred, pre-existing
- [x] [Review][Defer] W10 — **`isoToDisplay` sin guard en input malformado** — Actualmente seguro en los call sites, pero la función destructura sin validar. — deferred, pre-existing

## Dev Notes

### Prisma — modelo Product (no modificar schema)

El schema ya tiene todos los campos necesarios. **No hay que hacer ninguna migración.**

```prisma
model Product {
  id           String        @id @default(cuid())
  artisanId    String
  name         String
  description  String        // obligatorio — 280 chars max en UI
  priceInCents Int           // siempre en céntimos, NUNCA floats
  type         ProductType   // UNIQUE | PERISHABLE | STANDARD
  status       ProductStatus @default(ACTIVE)
  expiresAt    DateTime?     // solo si type = PERISHABLE
  imageUrls    String[]      // URLs de Cloudinary, 1-3
  category     String        // obligatorio — usar lista predefinida
  locality     String        // auto-rellenar desde user.locality
  deletedAt    DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

**ProductType → label de UI:**
- `UNIQUE` → "Única pieza" → stock implícito = 1 (gestionado en H2.3)
- `PERISHABLE` → "Perecedero" → requiere `expiresAt`
- `STANDARD` → "Otro"

**No hay campo `stock` en el schema** — el agotamiento se gestiona por `status` (H2.3). En este story solo creamos el producto con `status: ACTIVE`.

### Precio — conversión euros ↔ céntimos

```typescript
// Input del usuario: "12,50" o "12.50"
const priceInCents = Math.round(parseFloat(priceEuros.replace(",", ".")) * 100);

// Mostrar en UI
const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
```

**Nunca almacenar ni operar con floats para dinero.** [Source: architecture.md — Monetary Amounts]

### Upload de imágenes — patrón existente

El endpoint `POST /api/upload` **ya existe y funciona** con `type: "product"`. Devuelve `{ data: { url, publicId } }`.

```typescript
// Patrón de uso desde el client component
const formData = new FormData();
formData.append("file", file);
formData.append("type", "product");

const res = await fetch("/api/upload", { method: "POST", body: formData });
const json = await res.json() as { data?: { url: string; publicId: string }; error?: unknown };

if (json.data) {
  setImageUrls(prev => [...prev, json.data!.url]);
}
```

Las URLs de Cloudinary resultantes son las que se guardan en `imageUrls[]` del producto. [Source: `src/app/api/upload/route.ts`]

### Patrón de server action — seguir el de `actions.ts` del profile

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

export async function createProduct(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR" as const, fields: parsed.error.flatten().fieldErrors } };
  }

  // Detectar si es el primer producto ANTES de crear
  const existingCount = await db.product.count({
    where: { artisanId: session.user.id, status: "ACTIVE", deletedAt: null },
  });
  const isFirstProduct = existingCount === 0;

  // Obtener locality del artesana para el producto
  const artisan = await db.user.findUnique({
    where: { id: session.user.id },
    select: { locality: true },
  });

  await db.product.create({
    data: {
      artisanId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      priceInCents: parsed.data.priceInCents,
      type: parsed.data.type,
      imageUrls: parsed.data.imageUrls,
      category: parsed.data.category,
      locality: artisan?.locality ?? "",
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  revalidatePath(`/artisan/${session.user.id}`);
  revalidatePath("/studio/products");

  return { success: true, isFirstProduct } as const;
}
```

[Source: `src/app/(artisan)/studio/profile/actions.ts`]

### Categorías predefinidas

Usar como opciones del `<select>` de categoría (campo obligatorio en BD):

```typescript
const CATEGORIES = [
  "Joyería y bisutería",
  "Cerámica y alfarería",
  "Textil y costura",
  "Madera",
  "Papel y encuadernación",
  "Pintura y dibujo",
  "Fotografía",
  "Gastronomía artesana",
  "Otro",
] as const;
```

### Reordenar fotos — botones ↑↓ (no drag)

No usar drag-and-drop API — demasiado frágil en mobile. Usar botones ↑ ↓ simples para mover cada foto en el array. Implementar con `arrayMove(arr, from, to)`:

```typescript
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  result.splice(to, 0, result.splice(from, 1)[0]!);
  return result;
}
```

### Toast de primer producto

Sonner soporta `toast.custom()` para JSX personalizado con estilos propios:

```typescript
import { toast } from "sonner";

if (isFirstProduct) {
  toast.custom(() => (
    <div className="rounded-xl bg-[--surface] px-4 py-3 shadow-md">
      <p className="font-display text-lg text-[#3d5a4f]">
        ¡Tu primera pieza ya está en Artelier!
      </p>
    </div>
  ));
} else {
  toast.success("Tu producto ya está en línea");
}
```

[Source: `src/components/ui/sonner.tsx` ya instalado]

### ArtisanBottomNav — estructura

```tsx
// src/components/ArtisanBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Plus, User } from "lucide-react";

const items = [
  { href: "/studio/products", icon: ShoppingBag, label: "Mis productos" },
  { href: "/studio/profile", icon: User, label: "Mi perfil" },
] as const;

export default function ArtisanBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-[--bg]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {/* Tienda */}
        <NavItem href="/studio/products" label="Mis productos" icon={ShoppingBag} active={pathname.startsWith("/studio/products") && !pathname.includes("/new")} />
        {/* Botón central + */}
        <Link
          href="/studio/products/new"
          aria-label="Publicar producto"
          className="flex h-12 w-12 -mt-4 items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={24} />
        </Link>
        {/* Perfil */}
        <NavItem href="/studio/profile" label="Mi perfil" icon={User} active={pathname.startsWith("/studio/profile")} />
      </div>
    </nav>
  );
}
```

El layout artesana añade `pb-20` al wrapper para que el contenido no quede oculto bajo la nav de 64px.

### Protección de rutas artesana

Todas las páginas nuevas deben verificar sesión Y rol:

```typescript
// En cada page.tsx de (artisan)/studio/products/
const session = await getServerSession();
if (!session?.user) redirect("/login");
if (session.user.role !== "ARTISAN") redirect("/feed");
```

[Source: patrón de `src/app/(artisan)/studio/profile/page.tsx`]

### Validación inline — mostrar errores junto al campo

No usar `form.formState.errors.root` para errores de campo — mostrar cada error bajo su input correspondiente. Seguir el patrón de `RegisterPage` en `src/app/(auth)/register/page.tsx`.

### Archivo `/studio/products/page.tsx` — consulta de productos

```typescript
const products = await db.product.findMany({
  where: {
    artisanId: session.user.id,
    deletedAt: null,
    // Mostrar tanto ACTIVE como SOLD (no EXPIRED, que se filtra en H2.4)
    status: { in: ["ACTIVE", "SOLD"] },
  },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    name: true,
    priceInCents: true,
    status: true,
    imageUrls: true,
    type: true,
  },
});
```

### Artisan profile pública — no hay que modificarla

`src/app/(buyer)/artisan/[id]/page.tsx` ya consulta `status: "ACTIVE", deletedAt: null`. Al llamar a `revalidatePath(`/artisan/${session.user.id}`)` en el server action, el producto nuevo aparece automáticamente. **No tocar este archivo.**

### Qué NO implementar en este story

- Drag and drop para reordenar fotos (usar ↑↓)
- Edición de productos (H2.2)
- Stock numérico / agotamiento (H2.3)
- Retiro automático de perecederos (H2.4)
- Sellos de producto (H2.2)
- BottomNav para compradores (distinto componente, otra story)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
