# Historia 2.3: Gestión de stock y pedidos personalizados

## Status: review

## Story

Como artesana,
quiero que el stock de mis piezas únicas refleje su disponibilidad real y poder recibir y gestionar solicitudes de pedidos personalizados de compradoras,
para no hacer seguimiento manual y responder encargos sin salir de la plataforma.

## Acceptance Criteria

**AC1 — UI de producto vendido visible para compradoras**
- Dado que un producto tiene `status === "SOLD"`
- Cuando una compradora visita el perfil público de la artesana
- Entonces el producto aparece con badge "Vendido" claramente visible sobre la imagen
- Y el producto sigue listado en el catálogo (ordenado al final, tras los ACTIVE)
- Y no hay ningún botón de compra activo (no hay sistema de compra aún — solo preparar la UI)
- ⚠️ Nota: El cambio automático de `status → SOLD` al confirmar el pago se implementa en Historia 5.3 (Stripe webhook). En esta historia solo preparamos la UI de estado.

**AC2 — Compradora puede enviar solicitud de encargo personalizado**
- Dado que soy una compradora autenticada (rol BUYER) viendo el perfil público de una artesana
- Cuando relleno el formulario de encargo (descripción obligatoria, presupuesto sugerido opcional) y lo envío
- Entonces se crea un `CustomOrderRequest` con `status: PENDING` en la base de datos
- Y veo un toast de confirmación: "Tu solicitud ha sido enviada"
- Si no estoy autenticada o soy artesana, el formulario no aparece

**AC3 — Artesana ve las solicitudes en `/studio/pedidos`**
- Dado que accedo a `/studio/pedidos`
- Cuando la página carga
- Entonces veo las solicitudes con: nombre de la compradora, descripción del encargo, presupuesto sugerido y fecha
- Y las solicitudes PENDING aparecen primero con botones Aceptar / Rechazar
- Y las ACCEPTED y REJECTED aparecen debajo como histórico
- Y si no hay solicitudes, veo: "Aún no has recibido encargos personalizados" con descripción de cómo funcionan

**AC4 — Aceptar encargo crea conversación**
- Dado que acepto una solicitud PENDING
- Cuando confirmo la aceptación
- Entonces el `status` de `CustomOrderRequest` cambia a `ACCEPTED`
- Y se crea (o reutiliza si ya existe) una `Conversation` entre artesana y compradora
- Y veo un toast: "Encargo aceptado. Puedes continuar en mensajes."
- ⚠️ Nota: La UI de mensajería se implementa en Historia 4.1. La notificación a la compradora se implementa en Historia 6.1. Aquí solo creamos el registro de Conversation.

**AC5 — Rechazar encargo**
- Dado que rechazo una solicitud PENDING
- Cuando confirmo el rechazo en un modal de confirmación
- Entonces el `status` cambia a `REJECTED`
- Y la solicitud se mueve al histórico (deja de mostrar botones de acción)
- Y veo un toast: "Solicitud rechazada"

## Tasks/Subtasks

- [x] T1: Añadir modelo `CustomOrderRequest` al schema de Prisma
  - [x] T1.1: Añadir enum `CustomOrderStatus { PENDING ACCEPTED REJECTED }` a `prisma/schema.prisma`
  - [x] T1.2: Añadir modelo `CustomOrderRequest` con campos: id, buyerId, artisanId, description, budgetInCents (optional Int), status, deletedAt, createdAt, updatedAt
  - [x] T1.3: Añadir relaciones `customOrderRequests` a modelo `User` (como buyer y como artisan)
  - [x] T1.4: Ejecutar `npx prisma migrate dev --name add-custom-order-request`
  - [x] T1.5: Ejecutar `npx prisma generate`

- [x] T2: Server actions para encargos
  - [x] T2.1: Crear `src/app/(artisan)/studio/pedidos/actions.ts` con `"use server";`
  - [x] T2.2: Implementar `acceptCustomOrder(requestId)` — verifica sesión + rol ARTISAN + ownership, cambia status a ACCEPTED, hace upsert de Conversation, revalidatePath
  - [x] T2.3: Implementar `rejectCustomOrder(requestId)` — verifica sesión + rol ARTISAN + ownership, cambia status a REJECTED, revalidatePath

- [x] T3: Server action para la compradora
  - [x] T3.1: Crear `src/app/(buyer)/artisan/[id]/actions.ts` con `"use server";`
  - [x] T3.2: Implementar `submitCustomOrderRequest(artisanId, data)` — verifica sesión + rol BUYER, Zod, crea CustomOrderRequest
  - [x] T3.3: Schema Zod: `description` (string, min 10, max 500 chars), `budgetInCents` (number, int, positive, optional)

- [x] T4: Formulario de encargo en perfil público (`/artisan/[id]`)
  - [x] T4.1: Crear `src/app/(buyer)/artisan/[id]/CustomOrderForm.tsx` — Client Component
  - [x] T4.2: Mostrar el formulario solo si `session?.user?.role === "BUYER"` y `!isOwnProfile`
  - [x] T4.3: Campos: textarea descripción + input precio (en euros, convertir a cents al enviar), botón "Solicitar encargo"
  - [x] T4.4: Integrar en `src/app/(buyer)/artisan/[id]/page.tsx` — pasarle `session` y `artisanId`
  - [x] T4.5: Toast de éxito con `sonner` tras envío exitoso

- [x] T5: Página `/studio/pedidos` (reemplazar el placeholder)
  - [x] T5.1: Actualizar `src/app/(artisan)/studio/pedidos/page.tsx` — Server Component que carga `CustomOrderRequest` del artesano con datos de la compradora (nombre, imagen)
  - [x] T5.2: Separar en dos listas: PENDING (con acciones) y ACCEPTED/REJECTED (histórico)
  - [x] T5.3: Crear `src/app/(artisan)/studio/pedidos/PedidosView.tsx` — Client Component con los botones de aceptar/rechazar y modales de confirmación
  - [x] T5.4: Empty state si no hay solicitudes

- [x] T6: UI de producto vendido en perfil público (AC1)
  - [x] T6.1: Verificar en `src/components/artisan/ArtisanProfileTabs.tsx` — badge "Vendido" ya presente desde H2.2 ✅

- [x] T7: Verificación — typecheck + build sin errores

## Dev Notes

### ⚠️ Dependencias de otras historias — qué NO implementar aquí

| Funcionalidad | Historia | Qué hacemos en 2.3 |
|---|---|---|
| SOLD automático al pagar | H5.3 (Stripe webhook) | Solo UI — mostramos el badge si status=SOLD |
| Mensajería entre usuario y artesana | H4.1 | Creamos el registro `Conversation` pero sin UI de chat |
| Notificación a compradora al aceptar | H6.1 | No — solo creamos la Conversation |

### Modelo Prisma a crear — CustomOrderRequest

Añadir en `prisma/schema.prisma` ANTES del modelo Order (para mantener orden lógico):

```prisma
enum CustomOrderStatus {
  PENDING
  ACCEPTED
  REJECTED
}

model CustomOrderRequest {
  id            String            @id @default(cuid())
  buyerId       String
  artisanId     String
  description   String
  budgetInCents Int?
  status        CustomOrderStatus @default(PENDING)
  deletedAt     DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  buyer   User @relation("BuyerCustomOrders", fields: [buyerId], references: [id])
  artisan User @relation("ArtisanCustomOrders", fields: [artisanId], references: [id])
}
```

Añadir en el modelo `User`:
```prisma
  customOrdersAsBuyer   CustomOrderRequest[] @relation("BuyerCustomOrders")
  customOrdersAsArtisan CustomOrderRequest[] @relation("ArtisanCustomOrders")
```

### Modelo Conversation — ya existe, usarlo para aceptar encargos

```prisma
// Ya en el schema — NO modificar
model Conversation {
  id        String    @id @default(cuid())
  buyerId   String
  artisanId String
  @@unique([buyerId, artisanId])  // ← importante para el upsert
  ...
}
```

El `upsert` al aceptar un encargo:
```typescript
await db.conversation.upsert({
  where: { buyerId_artisanId: { buyerId: request.buyerId, artisanId: session.user.id } },
  create: { buyerId: request.buyerId, artisanId: session.user.id },
  update: {},  // ya existe — no modificar
});
```

### Schema Zod para submitCustomOrderRequest

```typescript
const submitSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Describe el encargo con al menos 10 caracteres")
    .max(500, "La descripción no puede superar 500 caracteres"),
  budgetInCents: z
    .number()
    .int()
    .positive("El presupuesto debe ser mayor que 0")
    .optional(),
});
```

### Server action — `acceptCustomOrder`

```typescript
export async function acceptCustomOrder(requestId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  const request = await db.customOrderRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    select: { artisanId: true, buyerId: true, status: true },
  });
  if (!request) return { error: { code: "NOT_FOUND" as const } };
  if (request.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (request.status !== "PENDING") return { error: { code: "ALREADY_PROCESSED" as const } };

  // Transacción: cambiar status + crear/reutilizar conversación
  await db.$transaction([
    db.customOrderRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    }),
    db.conversation.upsert({
      where: { buyerId_artisanId: { buyerId: request.buyerId, artisanId: session.user.id } },
      create: { buyerId: request.buyerId, artisanId: session.user.id },
      update: {},
    }),
  ]);

  revalidatePath("/studio/pedidos");
  return { success: true as const };
}
```

### Patrón de los server actions — igual que H2.2

```typescript
// En actions.ts — siempre:
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

// Retorno: siempre { error: { code: "..." } } | { success: true }
// Auth: verificar sesión y rol antes de cualquier operación
// Ownership: request.artisanId === session.user.id
```

### Query de pedidos en `/studio/pedidos/page.tsx`

```typescript
const requests = await db.customOrderRequest.findMany({
  where: { artisanId: session.user.id, deletedAt: null },
  include: {
    buyer: { select: { id: true, name: true, image: true } },
  },
  orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  // PENDING primero (asc: ACCEPTED < PENDING < REJECTED lexicográficamente — NO, necesita orderBy manual)
});

// Ordenar en código: pending primero, luego accepted/rejected por fecha desc
const pending = requests.filter((r) => r.status === "PENDING");
const processed = requests.filter((r) => r.status !== "PENDING");
```

### Formulario de encargo — solo visible para BUYER no propietario

```tsx
// En /artisan/[id]/page.tsx — pasar al componente:
const isBuyer = session?.user?.role === "BUYER";
const canRequestOrder = !isOwnProfile && isBuyer;

// En el JSX:
{canRequestOrder && (
  <CustomOrderForm artisanId={artisan.id} />
)}
```

### Diseño visual — sistema establecido

```
Layout principal: <main className="bg-[--bg]">
Contenedor: <div className="mx-auto max-w-lg px-4 py-8">
Título: font-display text-xl font-bold text-[--text]
Botón aceptar: bg-[#3d5a4f] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#4a6b5e]
Botón rechazar: border border-red-200 text-red-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-red-50
Toast: usar sonner (ya instalado) — import { toast } from "sonner"
Modal confirmación: usar Dialog de src/components/ui/dialog.tsx (ya existe)
Empty state: icono Package de lucide-react (ya usado en el placeholder)
Precio en formulario: el campo muestra euros (float), al enviar convertir × 100 a cents
```

### Guardianes críticos

1. **Solo rol BUYER puede enviar solicitudes** — verificar en la server action
2. **Solo la artesana propietaria puede aceptar/rechazar** — `request.artisanId === session.user.id`
3. **Solo solicitudes PENDING se pueden procesar** — verificar `status === "PENDING"` antes de aceptar/rechazar
4. **Upsert de Conversation** — usar `@@unique([buyerId, artisanId])` para evitar duplicados
5. **Transacción en acceptCustomOrder** — cambio de status + creación de Conversation deben ser atómicos
6. **`deletedAt: null`** en todas las queries de CustomOrderRequest
7. **El formulario NO aparece** si el usuario no está autenticado, es la propia artesana, o es otra artesana

### Estado actual de archivos

**`src/app/(artisan)/studio/pedidos/page.tsx` — MODIFICAR**
Estado actual: placeholder con icono Package y texto "Próximamente". Tiene auth guard (sesión + rol ARTISAN). Hay que reemplazar el contenido por la query real y el componente PedidosView.

**`src/app/(buyer)/artisan/[id]/page.tsx` — MODIFICAR**
Estado actual: carga artesano con productos y processUpdates. Renderiza ArtisanHeader + ArtisanProfileTabs. Añadir CustomOrderForm condicionalmente para compradores (no propietarios).

**`src/components/artisan/ArtisanProfileTabs.tsx` — VERIFICAR (posiblemente no modificar)**
En H2.2 se añadieron badges de estado sobre las imágenes de producto ("Vendido"/"En stock"). Verificar que los productos SOLD ya aparecen correctamente. Si ya está bien, T6.1 es ✅.

## Dev Agent Record

### Completion Notes
- Añadido modelo `CustomOrderRequest` + enum `CustomOrderStatus` al schema de Prisma con migración `20260602100330_add_custom_order_request`
- Server actions de artesana: `acceptCustomOrder` (con upsert transaccional de Conversation) y `rejectCustomOrder`
- Server action de compradora: `submitCustomOrderRequest` con validación Zod
- Actions de follow/unfollow recuperadas en el mismo archivo (existían antes de esta historia)
- `CustomOrderForm.tsx`: formulario con textarea + presupuesto en euros (convertido a cents), validación inline, estado de enviado
- `/studio/pedidos/page.tsx`: reemplazado el placeholder por query real con separación pending/processed
- `PedidosView.tsx`: lista con modales de confirmación Dialog para aceptar/rechazar, empty state
- Badge "Vendido" en perfil público ya presente desde H2.2 — T6 verificado sin cambios
- Typecheck y lint pasan sin errores

### Debug Log
- Al crear `actions.ts` en `/artisan/[id]/` se sobreescribieron las funciones `followArtisan`/`unfollowArtisan` que ya existían → recuperadas en el mismo archivo combinando las tres acciones

## Change Log
- 2026-06-02: Historia creada (create-story, Historia 2.3)
- 2026-06-02: Historia implementada (dev-story, Historia 2.3)

## File List
- `prisma/schema.prisma` — añadido enum `CustomOrderStatus` + modelo `CustomOrderRequest` + relaciones en `User`
- `prisma/migrations/20260602100330_add_custom_order_request/migration.sql` — migración generada
- `src/app/(artisan)/studio/pedidos/actions.ts` — NEW: `acceptCustomOrder`, `rejectCustomOrder`
- `src/app/(artisan)/studio/pedidos/page.tsx` — UPDATE: reemplazado placeholder por query real
- `src/app/(artisan)/studio/pedidos/PedidosView.tsx` — NEW: Client Component con listas + modales
- `src/app/(buyer)/artisan/[id]/actions.ts` — UPDATE: añadido `submitCustomOrderRequest` (conservadas `followArtisan`/`unfollowArtisan`)
- `src/app/(buyer)/artisan/[id]/CustomOrderForm.tsx` — NEW: formulario de encargo para compradora
- `src/app/(buyer)/artisan/[id]/page.tsx` — UPDATE: integrado `CustomOrderForm` para compradores
