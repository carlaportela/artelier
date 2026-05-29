# Historia 2.2: Editar, Eliminar Productos y Gestionar Sellos

## Status: ready-for-dev

## Story

Como artesana, quiero editar los datos de mis productos, eliminarlos cuando sea necesario y asignarles sellos verificados, para mantener mi catálogo actualizado y mostrar mis certificaciones.

## Acceptance Criteria

**AC1 — Editar producto**
- Dado que accedo a `/studio/products/[id]`
- Cuando modifico precio, descripción, fotos o tipo y guardo
- Entonces los cambios se reflejan inmediatamente en el perfil público
- Y si el producto tiene pedidos activos en curso (estado CONFIRMED, IN_PREPARATION, READY o SHIPPED) aparece un aviso explicativo y no puedo guardar

**AC2 — Soft-delete**
- Dado que decido eliminar un producto desde `/studio/products/[id]`
- Cuando confirmo la eliminación en el modal de confirmación
- Entonces el campo `deletedAt` se establece en la fecha actual
- Y el producto desaparece del catálogo público y del feed
- Y soy redirigida a `/studio/products`

**AC3 — Mostrar sellos verificados en el producto**
- Dado que el sistema ha asignado sellos automáticos a un producto (vía lógica de H7.1)
- Cuando la artesana o una compradora ven el producto en el catálogo o en la lista del studio
- Entonces los sellos aparecen como `SealBadge` en la esquina inferior izquierda de la foto
- Y la artesana NO puede añadir ni eliminar sellos manualmente — son asignados y revocados por el sistema
- (La lógica de auto-asignación y el flujo de solicitud/aprobación se implementan en Historia 7.1)

**AC4 — Lista de productos con estado**
- Dado que accedo a `/studio/products`
- Cuando la página carga
- Entonces cada producto muestra un indicador de estado: "Activo", "Vendido" o "Caducado"
- Y cada tarjeta de producto enlaza a `/studio/products/[id]` para editar
- Y si no tengo productos el empty state muestra "Publica tu primera pieza" con CTA

## Tasks/Subtasks

- [ ] T1: Mejorar lista de productos `/studio/products` (AC4)
  - [ ] T1.1: Actualizar query en `page.tsx` — quitar filtro de `status` para incluir EXPIRED; añadir `type` y `expiresAt` al select
  - [ ] T1.2: Añadir indicador de estado (pill "Activo" / "Vendido" / "Caducado") a cada tarjeta
  - [ ] T1.3: Envolver cada tarjeta en `<Link href={`/studio/products/${product.id}`}>` para acceso a edición

- [ ] T2: Crear componente `SealBadge` (AC3)
  - [ ] T2.1: Crear `src/components/artisan/SealBadge.tsx` — badge pequeño, fondo sólido #c4956a, texto blanco, fuente font-display (The Girl Next Door)

- [ ] T3: Server actions para edición y eliminación (AC1, AC2)
  - [ ] T3.1: Crear `src/app/(artisan)/studio/products/[id]/actions.ts` con `"use server";`
  - [ ] T3.2: Implementar `updateProduct(productId, data)` — Zod, ownership, active-orders guard, DB update, revalidatePath
  - [ ] T3.3: Implementar `deleteProduct(productId)` — ownership, soft-delete (`deletedAt: new Date()`), revalidatePath

- [ ] T4: Página de edición `/studio/products/[id]` (AC1, AC2, AC3)
  - [ ] T4.1: Crear `src/app/(artisan)/studio/products/[id]/page.tsx` — Server Component: auth + rol, cargar producto con `productSeals` (para mostrarlos) y `orders`
  - [ ] T4.2: Crear `src/app/(artisan)/studio/products/[id]/EditProductForm.tsx` — Client Component
  - [ ] T4.3: Implementar campos editables: nombre, descripción, precio, tipo, categoría, expiresAt — copiar patrones `SelectField` y `DatePickerField` de `NewProductWizard.tsx` (no extraer a shared para evitar regresiones en H2.2)
  - [ ] T4.4: Implementar gestión de fotos — mostrar fotos actuales, añadir/quitar/reordenar con dnd-kit + `CropModal` (mismos patrones y constantes que en H2.1: MAX_IMAGES=6, SortablePhoto)
  - [ ] T4.5: Mostrar sellos del producto (read-only) — listar los `productSeals` como `SealBadge` en la página de edición con texto "Sellos verificados de este producto" (no hay UI de selección — son asignados por el sistema)
  - [ ] T4.6: Implementar aviso si hay pedidos activos — banner informativo en la parte superior del formulario, campos deshabilitados y botón de guardar deshabilitado
  - [ ] T4.7: Implementar botón eliminar con modal de confirmación usando `Dialog` de `src/components/ui/dialog.tsx`

- [ ] T5: Verificación — typecheck + build sin errores

## Dev Notes

### Estado actual de archivos a modificar

**`src/app/(artisan)/studio/products/page.tsx` — MODIFICAR**

Estado actual: grid 2 columnas, query con `deletedAt: null` y `status: { in: ["ACTIVE", "SOLD"] }`, overlay de "Vendido" sobre imagen, empty state con CTA "Publica tu primera pieza", format de precio en EUR.

Cambios necesarios para AC4:
1. Quitar `status: { in: ["ACTIVE", "SOLD"] }` de la query para incluir EXPIRED
2. Añadir `type: true, expiresAt: true` al select (para calcular estado real si fuera necesario)
3. Reemplazar el overlay de "Vendido" por una pill de estado más discreta en la esquina inferior derecha, distingiendo los 3 estados
4. Envolver el `<div>` de cada producto en un `<Link href={`/studio/products/${product.id}`}>`

El empty state ya existe y ya muestra el CTA — no modificar ese parte.

**`src/app/(artisan)/studio/products/new/NewProductWizard.tsx` — NO MODIFICAR**

Contiene `SelectField`, `DatePickerField` y `SortablePhoto` como funciones locales. Para el formulario de edición, recrear estos patrones en `EditProductForm.tsx`. No extraer a un shared ahora para evitar regresiones en H2.2; esto puede refactorizarse en una historia técnica posterior.

Constantes que el formulario de edición debe replicar:
```typescript
const CATEGORIES = [
  "Joyería y bisutería", "Cerámica y alfarería", "Textil y costura", "Madera",
  "Papel y encuadernación", "Pintura y dibujo", "Fotografía", "Alimentación",
  "Perfumería y cosmética natural", "Otros"
] as const;
const PERISHABLE_CATEGORIES: readonly string[] = ["Alimentación", "Perfumería y cosmética natural"];
const PRODUCT_TYPES = [
  { value: "UNIQUE", label: "Única pieza" },
  { value: "PERISHABLE", label: "Perecedero" },
  { value: "STANDARD", label: "Otro" },
] as const;
const MAX_IMAGES = 6;
```

**`src/components/CropModal.tsx` — NO MODIFICAR, solo importar**

Ya existe y funciona. Importarlo en `EditProductForm.tsx` para el flujo de editar/añadir fotos.

### Rutas y estructura de archivos

```
src/app/(artisan)/studio/products/page.tsx                     ← UPDATE: estados + links + SealBadge en tarjetas
src/app/(artisan)/studio/products/[id]/page.tsx                ← NEW: página edición (server)
src/app/(artisan)/studio/products/[id]/EditProductForm.tsx     ← NEW: formulario edición (client)
src/app/(artisan)/studio/products/[id]/actions.ts              ← NEW: updateProduct, deleteProduct
src/components/artisan/SealBadge.tsx                           ← NEW: badge de sello (display-only, asignado por sistema)
```

### Modelos Prisma relevantes

```prisma
model Product {
  id           String        @id @default(cuid())
  artisanId    String
  name         String
  description  String
  priceInCents Int
  type         ProductType   // UNIQUE | PERISHABLE | STANDARD
  status       ProductStatus @default(ACTIVE)  // ACTIVE | SOLD | EXPIRED
  expiresAt    DateTime?
  imageUrls    String[]
  category     String
  locality     String
  deletedAt    DateTime?     // soft-delete — NUNCA borrar físicamente con db.product.delete()
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  artisan      User          @relation(...)
  orders       Order[]
  productSeals ProductSeal[]
  sealRequests SealRequest[]
}

model Seal {
  id          String    @id @default(cuid())
  name        String    @unique
  type        String
  isAutomatic Boolean   @default(false)
  deletedAt   DateTime?
  productSeals ProductSeal[]
}

model ProductSeal {
  id        String   @id @default(cuid())
  productId String
  sealId    String
  createdAt DateTime @default(now())
  product   Product  @relation(...)
  seal      Seal     @relation(...)
  @@unique([productId, sealId])
}

enum OrderStatus {
  CONFIRMED | IN_PREPARATION | READY | SHIPPED  ← estados que bloquean edición
  DELIVERED | CANCELLED | REFUNDED | IN_DISPUTE ← estados que NO bloquean
}
```

### Patrones establecidos en historias anteriores

```typescript
// Server action — patrón base (de H2.1 y perfil)
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

// Retorno: siempre { error: { code: "..." } } | { success: true }
// Auth: siempre verificar sesión y rol primero
// Zod: safeParse, devolver fieldErrors con flatten()
// SIEMPRE: where: { deletedAt: null } en queries de Product
// Ownership: product.artisanId === session.user.id
// Soft-delete: NUNCA db.product.delete() → db.product.update({ data: { deletedAt: new Date() } })
```

### Server Action: `updateProduct`

```typescript
const updateProductSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().trim().max(280, "La descripción no puede superar 280 caracteres"),
  priceInCents: z.number().int().min(1, "El precio debe ser mayor que 0").max(2_147_483_647),
  type: z.enum(["UNIQUE", "PERISHABLE", "STANDARD"]),
  imageUrls: z.array(z.string().url()).min(1, "Añade al menos una imagen").max(6),
  category: z.string().trim().min(1, "Selecciona una categoría"),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido")
    .optional(),
});

export async function updateProduct(productId: string, data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  // Verificar ownership + no borrado + pedidos activos
  const product = await db.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: {
      artisanId: true,
      orders: {
        where: { status: { in: ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED"] } },
        select: { id: true },
      },
    },
  });
  if (!product) return { error: { code: "NOT_FOUND" as const } };
  if (product.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (product.orders.length > 0) return { error: { code: "HAS_ACTIVE_ORDERS" as const } };

  const parsed = updateProductSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR" as const, fields: parsed.error.flatten().fieldErrors } };
  }

  try {
    await db.product.update({
      where: { id: productId },
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt + "T12:00:00") : null,
      },
    });
  } catch {
    return { error: { code: "DB_ERROR" as const } };
  }

  revalidatePath(`/studio/products/${productId}`);
  revalidatePath("/studio/products");
  revalidatePath(`/artisan/${session.user.id}`);

  return { success: true as const };
}
```

### Server Action: `deleteProduct`

```typescript
export async function deleteProduct(productId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  const product = await db.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: {
      artisanId: true,
      orders: {
        where: { status: { in: ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED"] } },
        select: { id: true },
      },
    },
  });
  if (!product) return { error: { code: "NOT_FOUND" as const } };
  if (product.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (product.orders.length > 0) return { error: { code: "HAS_ACTIVE_ORDERS" as const } };

  await db.product.update({
    where: { id: productId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/studio/products");
  revalidatePath(`/artisan/${session.user.id}`);

  return { success: true as const };
  // El client component redirige a /studio/products tras recibir success
}
```

### Carga de datos en la página de edición (page.tsx)

```typescript
export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const product = await db.product.findUnique({
    where: { id: params.id, deletedAt: null },
    include: {
      productSeals: { include: { seal: { select: { id: true, name: true } } } },
      orders: {
        where: { status: { in: ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED"] } },
        select: { id: true },
      },
    },
  });

  // Verificar ownership — si no es suyo, redirigir silenciosamente
  if (!product || product.artisanId !== session.user.id) redirect("/studio/products");

  const hasActiveOrders = product.orders.length > 0;
  // Los sellos se pasan como read-only para mostrarlos como SealBadge (no hay UI de selección)
  const seals = product.productSeals.map((ps) => ps.seal);

  return (
    <EditProductForm
      product={product}
      seals={seals}
      hasActiveOrders={hasActiveOrders}
    />
  );
}
```

### SealBadge — componente

```tsx
// src/components/artisan/SealBadge.tsx
interface SealBadgeProps {
  name: string;
  className?: string;
}

export function SealBadge({ name, className }: SealBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#c4956a] px-2 py-0.5 font-display text-[10px] font-medium text-white ${className ?? ""}`}
    >
      {name}
    </span>
  );
}
```

Para mostrar sellos en la tarjeta de producto (en la lista), posicionarlos absolute en la esquina inferior izquierda de la imagen:

```tsx
<div className="absolute bottom-2 left-2 flex flex-col gap-1">
  {product.productSeals.map((ps) => (
    <SealBadge key={ps.seal.id} name={ps.seal.name} />
  ))}
</div>
```

### Diseño visual — sistema establecido

```
Layout principal: <main className="bg-[--bg]">
Contenedor: <div className="mx-auto max-w-lg px-4 py-8">
Título: font-display text-xl font-bold text-[--text]
Botón guardar: bg-[#3d5a4f] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#4a6b5e]
Botón eliminar: bg-red-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-red-700
Pill estado Activo: text-xs text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5
Pill estado Vendido: text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5
Pill estado Caducado: text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5
Aviso pedidos activos: bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800
```

### Sellos — decisión de scope para H2.2

**H2.2 solo MUESTRA sellos (read-only). No hay UI de selección ni asignación.**

Los sellos son asignados por el sistema, no por la artesana:
- `isAutomatic = true`: el sistema los asigna automáticamente basándose en criterios (localidad, categoría…). Aparecen en perfil Y en producto, quiera o no la artesana. Dan confianza al comprador (verificación).
- `isAutomatic = false`: requieren solicitud de la artesana + aprobación del admin vía `SealRequest`.

**Todo el flujo de asignación (automático y manual) es scope de Historia 7.1.**

En H2.2, solo necesitamos:
1. El componente `SealBadge` para mostrar sellos visualmente
2. Incluir `productSeals` en las queries para poder renderizar lo que el sistema ya haya asignado
3. Mostrar los sellos como información de solo lectura tanto en la lista como en la página de edición

Si la tabla `ProductSeal` está vacía (aún no hay lógica de asignación), simplemente no se muestran sellos — sin errores, sin pantallas rotas.

### Guardianes críticos

1. **NUNCA `db.product.delete()`** — siempre soft-delete con `deletedAt: new Date()`
2. **SIEMPRE `where: { deletedAt: null }`** en todas las queries de Product
3. **Verificar `artisanId === session.user.id`** antes de cualquier mutación
4. **Estados que bloquean edición**: CONFIRMED, IN_PREPARATION, READY, SHIPPED — mostrar aviso, no lanzar error 500
5. **La localidad del producto NO se edita** — se heredó del perfil al crear; el campo `locality` no debe aparecer en el formulario de edición
6. **MAX_IMAGES = 6** — igual que en H2.1; rechazar si se intentan subir más
7. **Transacción para sellos** — `updateProductSeals` debe ser atómica; no dejar el producto sin sellos si falla el create

## Dev Agent Record

### Completion Notes
_A completar por el agente de desarrollo al terminar_

### Debug Log
_A completar si surge algún problema durante la implementación_

## Change Log
- 2026-05-28: Historia creada (create-story, Historia 2.2)

## File List
_A completar por el agente de desarrollo al terminar_
