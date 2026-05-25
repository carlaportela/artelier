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
