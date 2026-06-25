# Historia 5.4: Confirmación de envío, cancelaciones y penalizaciones

Status: ready-for-dev

## Story

Como artesana y compradora,
quiero que el sistema gestione las cancelaciones en 24h, la confirmación del envío por parte de la artesana y las penalizaciones automáticas por incumplimiento,
para que el proceso postventa sea transparente y proteja a ambas partes.

## Acceptance Criteria

**AC1 — Cancelación por comprador en 24h**
- **Dado** que soy compradora y han pasado menos de 24h desde la confirmación del pedido
- **Cuando** accedo al detalle del pedido en `/orders/[id]` y solicito la cancelación
- **Entonces** puedo cancelarla con una justificación (texto obligatorio, mín. 10 caracteres)
- **Y** el importe íntegro se devuelve automáticamente a mi método de pago vía Stripe Refund
- **Y** el `Order.status` pasa a `CANCELLED`
- **Y** el `Product.status` vuelve a `ACTIVE` (el producto está disponible de nuevo para otros compradores)

**AC2 — Cancelación fuera de la ventana de 24h bloqueada**
- **Dado** que soy compradora y han pasado más de 24h desde la confirmación del pedido
- **Cuando** intento cancelar el pedido desde `/orders/[id]`
- **Entonces** el botón de cancelar no aparece (ventana cerrada)
- **Y** si la request se envía directamente a la API, devuelve `409 Conflict` con `CANCELLATION_WINDOW_CLOSED`

**AC3 — Confirmación de envío por artesana**
- **Dado** que soy artesana con un pedido confirmado en `/studio/orders/[id]`
- **Cuando** preparo el envío y pulso "Confirmar envío"
- **Entonces** puedo introducir el número de seguimiento (obligatorio si `shippingMethod === 'PLATFORM' || 'ARTISAN_OWN'`, omitir si `shippingMethod === 'PICKUP'`)
- **Y** si `shippingMethod === 'PICKUP'`, aparece el botón "Marcar como listo para recogida" en lugar de número de seguimiento
- **Y** el `Order.status` pasa a `SHIPPED` (o `READY` si es recogida en persona)
- **Y** el `trackingNumber` se guarda en la base de datos (si aplica)
- **Y** la compradora ve el estado actualizado en su historial de pedidos

**AC4 — Cancelación automática por incumplimiento de plazo**
- **Dado** que la artesana no confirma el envío en el plazo de 72 horas desde la confirmación del pedido
- **Cuando** el Cron Job diario `POST /api/cron/cancel-overdue-orders` detecta el vencimiento
- **Entonces** el `Order.status` pasa a `CANCELLED`
- **Y** el importe íntegro se devuelve a la compradora vía Stripe Refund
- **Y** se aplica una penalización de 5€ (500 céntimos) a la artesana, registrada en `User.pendingPenaltyInCents`
- **Y** el `Product.status` vuelve a `ACTIVE`

**AC5 — Penalización aplicada en siguiente venta**
- **Dado** que una artesana tiene `pendingPenaltyInCents > 0`
- **Cuando** un comprador realiza checkout de un producto suyo
- **Entonces** la penalización pendiente se suma al `application_fee_amount` de Stripe
- **Y** `User.pendingPenaltyInCents` se pone a 0 después de incluirse en el pago
- **Y** la metadata del PaymentIntent refleja `penaltyApplied: "true"` y la cantidad deducida

**AC6 — Primera venta sin comisión de plataforma (FR49)**
- **Dado** que es la primera venta completada de una artesana (`User.firstSaleCompleted === false`)
- **Cuando** un comprador realiza el checkout de un producto suyo
- **Entonces** la `insuranceFee` (2% de comisión de plataforma) no se cobra en esa transacción
- **Y** el `application_fee_amount` de Stripe es `shippingCost + stripeFee` (sin `insuranceFee`)
- **Y** la metadata del PaymentIntent incluye `firstSaleFeeWaived: "true"`

**AC7 — Cron Job protegido**
- **Dado** que `POST /api/cron/cancel-overdue-orders` recibe una request
- **Cuando** la request no incluye `Authorization: Bearer {CRON_SECRET}`
- **Entonces** devuelve `401 Unauthorized` sin procesar nada
- **Y** si no hay pedidos vencidos, devuelve `{ data: { cancelled: 0 } }`

**AC8 — Listado de pedidos de artesana**
- **Dado** que soy artesana autenticada en `/studio/orders`
- **Cuando** la página carga
- **Entonces** veo todos mis pedidos activos (no cancelados) con: nombre del producto, nombre del comprador, estado, fecha y total
- **Y** si no hay pedidos, aparece el empty state: "Todavía no tienes ningún pedido"

## Tasks / Subtasks

- [x] T1 — Migración de base de datos
  - [x] T1.1: Añadir `cancellationReason String?` al modelo `Order` en `prisma/schema.prisma`
  - [x] T1.2: Añadir `pendingPenaltyInCents Int @default(0)` al modelo `User` en `prisma/schema.prisma`
  - [x] T1.3: Ejecutar `npx prisma migrate dev --name add_cancellation_and_penalty_fields`

- [x] T2 — API: cancelación por comprador
  - [x] T2.1: Crear `src/app/api/orders/[orderId]/cancel/route.ts` con método `POST`
  - [x] T2.2: Verificar autenticación y rol `BUYER`
  - [x] T2.3: Cargar el pedido y verificar que pertenece al comprador autenticado
  - [x] T2.4: Verificar que `order.status === 'CONFIRMED'` y `order.createdAt > now - 24h`
  - [x] T2.5: Crear Stripe Refund con `stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })`
  - [x] T2.6: Actualizar `Order.status = CANCELLED`, `Order.cancellationReason` en transacción
  - [x] T2.7: Reactivar producto: `Product.status = ACTIVE` si el tipo no era PERISHABLE (verificar `expiresAt`)
  - [x] T2.8: Llamar a stub `sendCancellationEmail(order)` en fire-and-forget

- [ ] T3 — API: confirmación de envío por artesana
  - [ ] T3.1: Crear `src/app/api/orders/[orderId]/confirm-shipment/route.ts` con método `POST`
  - [ ] T3.2: Verificar autenticación y rol `ARTISAN`
  - [ ] T3.3: Cargar el pedido y verificar que `order.artisanId === session.user.id`
  - [ ] T3.4: Verificar que `order.status === 'CONFIRMED' || 'IN_PREPARATION' || 'READY'`
  - [ ] T3.5: Validar body con Zod: `{ trackingNumber?: string }` — requerido si `shippingMethod !== 'PICKUP'`
  - [ ] T3.6: Actualizar `Order.status = SHIPPED` (o `READY` si `shippingMethod === 'PICKUP'`) y guardar `trackingNumber`
  - [ ] T3.7: Llamar a stub `sendShipmentConfirmedEmail(order)` en fire-and-forget

- [ ] T4 — API Cron: cancelación automática por incumplimiento
  - [ ] T4.1: Crear `src/app/api/cron/cancel-overdue-orders/route.ts` con método `POST`
  - [ ] T4.2: Proteger con `Authorization: Bearer {CRON_SECRET}` (mismo patrón que `expire-products`)
  - [ ] T4.3: Buscar pedidos con `status === 'CONFIRMED'` y `createdAt < now - 72h`
  - [ ] T4.4: Para cada pedido vencido: crear Stripe Refund, actualizar `Order.status = CANCELLED`, reactivar producto
  - [ ] T4.5: Aplicar penalización: `User.pendingPenaltyInCents += PENALTY_AMOUNT_CENTS` al artesano
  - [ ] T4.6: Llamar a stub `sendOrderCancelledBySystemEmail(order)` para comprador y artesana (fire-and-forget)

- [ ] T5 — Modificar checkout para primera venta (FR49) y penalizaciones pendientes
  - [ ] T5.1: En `src/app/api/checkout/route.ts`, cargar `artisan.firstSaleCompleted` y `artisan.pendingPenaltyInCents` junto con `stripeAccountId`
  - [ ] T5.2: Si `firstSaleCompleted === false`, calcular `applicationFee = fees.shippingCost + fees.stripeFee` (sin `insuranceFee`)
  - [ ] T5.3: Si `pendingPenaltyInCents > 0`, sumar al `application_fee_amount` y añadir a metadata
  - [ ] T5.4: Actualizar metadata del PaymentIntent con `firstSaleFeeWaived` y `penaltyApplied` según corresponda
  - [ ] T5.5: **IMPORTANTE**: `pendingPenaltyInCents` se resetea a 0 en el webhook (H5.3), no en el checkout — añadir reset en `src/app/api/webhooks/stripe/route.ts` dentro de la transacción

- [x] T6 — Stubs de emails en resend.ts
  - [x] T6.1: Añadir `sendCancellationEmail(order: Order): Promise<void>` — stub en `src/lib/resend.ts`
  - [x] T6.2: Añadir `sendShipmentConfirmedEmail(order: Order): Promise<void>` — stub
  - [x] T6.3: Añadir `sendOrderCancelledBySystemEmail(order: Order): Promise<void>` — stub

- [ ] T7 — UI: detalle de pedido para comprador
  - [ ] T7.1: Crear `src/app/(buyer)/orders/[id]/page.tsx` — Server Component
  - [ ] T7.2: Cargar pedido por `id` verificando que `buyerId === session.user.id`
  - [ ] T7.3: Mostrar: nombre producto (imagen si disponible), estado, artesana, fecha, desglose de costes, tracking (si existe)
  - [ ] T7.4: Mostrar botón "Cancelar pedido" solo si `status === 'CONFIRMED'` y `createdAt > now - 24h`
  - [ ] T7.5: El botón de cancelar abre un diálogo con campo de justificación (Client Component: `CancelOrderDialog.tsx`)
  - [ ] T7.6: Añadir enlace "Ver pedido" en `src/app/(buyer)/orders/page.tsx` para cada pedido de la lista
  - [ ] T7.7: Añadir traducciones necesarias en `es.json` (ver sección Dev Notes)

- [ ] T8 — UI: panel de pedidos de artesana
  - [ ] T8.1: Crear `src/app/(studio)/studio/orders/page.tsx` — Server Component
  - [ ] T8.2: Listar pedidos de la artesana autenticada (no cancelados), ordenados por `createdAt desc`
  - [ ] T8.3: Crear `src/app/(studio)/studio/orders/[id]/page.tsx` — detalle con botón "Confirmar envío"
  - [ ] T8.4: Mostrar `ConfirmShipmentForm.tsx` (Client Component) solo si `status === 'CONFIRMED' || 'IN_PREPARATION'`
  - [ ] T8.5: El formulario pide número de seguimiento (o checkbox "Listo para recogida" si `PICKUP`)
  - [ ] T8.6: Añadir traducciones en `es.json`

- [ ] T9 — Configuración de Cron Job
  - [ ] T9.1: Añadir entrada en `vercel.json` para el nuevo cron (ejecutar a las 3am diario)

- [ ] T10 — Typecheck y build
  - [ ] T10.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T10.2: `npm run build` — debe pasar sin errores

## Dev Notes

### Constantes de negocio — definir en src/lib/order-constants.ts (NUEVO)

```typescript
// Ventana de cancelación del comprador: 24 horas
export const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

// Plazo para que la artesana confirme envío: 72 horas
export const SHIPPING_DEADLINE_MS = 72 * 60 * 60 * 1000;

// Penalización por incumplimiento: 5€
export const PENALTY_AMOUNT_CENTS = 500;
```

Esto permite ajustar los plazos sin buscar números mágicos en el código.

### Migración Prisma — cambios exactos al modelo

```prisma
model Order {
  // ... campos existentes ...
  trackingNumber        String?        // ← YA EXISTE en schema.prisma
  cancellationReason    String?        // ← NUEVO — razón de cancelación del comprador
  // ... resto sin cambios
}

model User {
  // ... campos existentes ...
  firstSaleCompleted    Boolean  @default(false)  // ← YA EXISTE
  pendingPenaltyInCents Int      @default(0)      // ← NUEVO — penalización pendiente de cobrar
}
```

**IMPORTANTE:** Ejecutar `npx prisma migrate dev --name add_cancellation_and_penalty_fields` después de los cambios.

### API: Cancelación por comprador (POST /api/orders/[orderId]/cancel)

```typescript
// Patrón completo del endpoint
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) { /* 401 */ }
  if (session.user.role !== 'BUYER') { /* 403 */ }

  const { orderId } = await params;
  
  const order = await db.order.findFirst({
    where: { id: orderId, buyerId: session.user.id, deletedAt: null },
    include: { product: { select: { id: true, type: true, expiresAt: true } } }
  });
  
  if (!order) { /* 404 */ }
  if (order.status !== 'CONFIRMED') { /* 409 CANCELLATION_NOT_ALLOWED */ }
  
  const windowExpired = Date.now() - order.createdAt.getTime() > CANCELLATION_WINDOW_MS;
  if (windowExpired) { /* 409 CANCELLATION_WINDOW_CLOSED */ }

  // Leer y validar body
  const body = await req.json() as Record<string, unknown>;
  const reason = String(body.reason ?? '').trim();
  if (reason.length < 10) { /* 422 */ }

  // Stripe refund
  if (!stripe) { /* 503 */ }
  await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });

  // Transacción BD: cancelar orden + reactivar producto
  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancellationReason: reason }
    });
    
    // Solo reactivar si el producto no es perecedero vencido
    const canReactivate = order.product.type !== 'PERISHABLE' || 
      !order.product.expiresAt || 
      order.product.expiresAt > new Date();
    
    if (canReactivate) {
      await tx.product.update({
        where: { id: order.productId },
        data: { status: 'ACTIVE' }
      });
    }
  });

  // Email fire-and-forget
  void sendCancellationEmail(order).catch(console.error);

  return NextResponse.json({ data: { cancelled: true } });
}
```

### API: Confirmación de envío (POST /api/orders/[orderId]/confirm-shipment)

```typescript
// Esquema de validación Zod
const confirmShipmentSchema = z.object({
  trackingNumber: z.string().optional(),
}).refine(
  // Esta validación necesita acceso al shippingMethod del order, se hace manualmente:
  // si shippingMethod !== 'PICKUP', trackingNumber es requerido
);

// Lógica de estado resultante según shippingMethod:
// PLATFORM → SHIPPED (con tracking)
// ARTISAN_OWN → SHIPPED (con tracking)
// PICKUP → READY (sin tracking, producto listo para recoger)
```

### Cron: Cancelación automática (POST /api/cron/cancel-overdue-orders)

```typescript
export async function POST(req: Request) {
  // Verificar CRON_SECRET (mismo patrón que expire-products pero es POST no GET)
  const expectedToken = env.CRON_SECRET;
  if (!expectedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${expectedToken}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deadline = new Date(Date.now() - SHIPPING_DEADLINE_MS);

  // Buscar pedidos CONFIRMED con más de 72h de antigüedad
  const overdueOrders = await db.order.findMany({
    where: {
      status: 'CONFIRMED',
      createdAt: { lte: deadline },
      deletedAt: null,
    },
    include: { product: { select: { id: true, type: true, expiresAt: true } } }
  });

  if (overdueOrders.length === 0) {
    return NextResponse.json({ data: { cancelled: 0 } });
  }

  let cancelledCount = 0;
  
  for (const order of overdueOrders) {
    try {
      // 1. Stripe refund
      if (stripe) {
        await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
      }
      
      // 2. BD en transacción: cancelar + reactivar producto + penalizar artesana
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', cancellationReason: 'Cancelado automáticamente por incumplimiento de plazo de envío' }
        });
        
        const canReactivate = order.product.type !== 'PERISHABLE' || 
          !order.product.expiresAt || order.product.expiresAt > new Date();
        if (canReactivate) {
          await tx.product.update({ where: { id: order.productId }, data: { status: 'ACTIVE' } });
        }
        
        // Penalización
        await tx.user.update({
          where: { id: order.artisanId },
          data: { pendingPenaltyInCents: { increment: PENALTY_AMOUNT_CENTS } }
        });
      });
      
      // 3. Email fire-and-forget
      void sendOrderCancelledBySystemEmail(order).catch(console.error);
      cancelledCount++;
    } catch (error) {
      console.error(`[cron/cancel-overdue-orders] Error procesando pedido ${order.id}:`, error);
      // Continuar con el siguiente pedido, no abortar todo el cron
    }
  }

  return NextResponse.json({ data: { cancelled: cancelledCount } });
}
```

**NOTA CLAVE:** El cron usa `POST` (distinto a expire-products que usa `GET`). Vercel Cron Jobs pueden usar tanto GET como POST — se usa POST porque cancela pedidos (operación de escritura semánticamente). El patrón de autenticación es idéntico.

### Checkout: primera venta y penalización pendiente (modificar checkout/route.ts)

```typescript
// Modificar la consulta del producto para incluir datos del artesano:
const product = await db.product.findFirst({
  where: { id: productId, status: 'ACTIVE', deletedAt: null },
  select: {
    id: true,
    name: true,
    priceInCents: true,
    type: true,
    artisanId: true,  // ← AÑADIR para buscar datos del artesano
    artisan: { 
      select: { 
        stripeAccountId: true,
        firstSaleCompleted: true,      // ← AÑADIR para FR49
        pendingPenaltyInCents: true,   // ← AÑADIR para AC5
      } 
    },
  },
});

// Calcular fees con lógica de primera venta y penalización:
const fees = calcFees(product.priceInCents, shippingMethod);
const isFirstSale = !product.artisan.firstSaleCompleted;
const pendingPenalty = product.artisan.pendingPenaltyInCents;

// application_fee_amount = lo que retiene la plataforma
let applicationFee = fees.shippingCost + fees.insuranceFee + fees.stripeFee;
if (isFirstSale) {
  applicationFee = fees.shippingCost + fees.stripeFee; // sin insuranceFee (FR49)
}
if (pendingPenalty > 0) {
  applicationFee += pendingPenalty; // penalización pendiente
}

// Metadata del PaymentIntent — añadir campos nuevos:
metadata: {
  // ... campos existentes ...
  firstSaleFeeWaived: String(isFirstSale),      // "true" | "false"
  penaltyApplied: String(pendingPenalty > 0),    // "true" | "false"
  penaltyInCents: String(pendingPenalty),         // "0" o cantidad
}
```

### Webhook (modificar route.ts): reset de penalización tras pago exitoso

```typescript
// Dentro de la transacción de creación del Order, al final:
// Si había penalización pendiente, resetear a 0
const penaltyInCents = parseInt(metadata.penaltyInCents ?? '0', 10);
if (!isNaN(penaltyInCents) && penaltyInCents > 0) {
  await tx.user.update({
    where: { id: activeProduct.artisanId },
    data: { pendingPenaltyInCents: 0 }
  });
}
```

**IMPORTANTE:** Este cambio va DENTRO de `src/app/api/webhooks/stripe/route.ts` en la transacción existente, no en una nueva transacción. Así si falla el reset, toda la transacción se revierte y Stripe reintenta.

### vercel.json — añadir segundo cron

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-products",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cancel-overdue-orders",
      "schedule": "0 3 * * *"
    }
  ]
}
```

El cron se ejecuta a las 3am (1h después que expire-products) para no solapar operaciones.

### UI: páginas de pedidos

**Para comprador (`/orders/[id]`):**
- Server Component que carga el pedido con `buyerId === session.user.id`
- Mostrar: imagen producto (si existe), nombre, artesana, fecha, estado (badge), desglose de costes, tracking si existe
- Botón "Cancelar pedido" solo si `status === 'CONFIRMED' && (Date.now() - order.createdAt.getTime()) < CANCELLATION_WINDOW_MS`
- `CancelOrderDialog.tsx` (Client Component con `'use client'`): Dialog de shadcn/ui con textarea para justificación y botón confirmar que llama al API

**Para artesana (`/studio/orders/[id]`):**
- Server Component que carga el pedido con `artisanId === session.user.id`
- Mostrar: producto comprado, comprador, fecha, estado, tracking actual si existe
- `ConfirmShipmentForm.tsx` (Client Component): visible solo si `status === 'CONFIRMED'`
  - Si `shippingMethod !== 'PICKUP'`: input de número de seguimiento
  - Si `shippingMethod === 'PICKUP'`: mensaje "Marca el pedido como listo para recogida"
  - Botón: "Confirmar envío" / "Marcar como listo para recogida"

### Claves i18n a añadir en es.json

```json
// Dentro de "account" existente:
"orderDetail": "Detalle del pedido",
"cancelOrder": "Cancelar pedido",
"cancelOrderConfirm": "Confirmar cancelación",
"cancelOrderReason": "Motivo de la cancelación",
"cancelOrderReasonPlaceholder": "Explica el motivo de tu cancelación (mínimo 10 caracteres)",
"orderCancelled": "Pedido cancelado correctamente. El reembolso llegará en 5-10 días hábiles.",
"cancellationWindowClosed": "La ventana de cancelación de 24h ha expirado",
"trackingNumber": "Número de seguimiento",

// Nueva sección "studio":
"studio": {
  "orders": {
    "title": "Mis pedidos",
    "noOrders": "Todavía no tienes ningún pedido",
    "confirmShipment": "Confirmar envío",
    "markAsReady": "Marcar como listo para recogida",
    "trackingNumber": "Número de seguimiento",
    "trackingNumberPlaceholder": "Ej: 1Z999AA10123456784",
    "shipmentConfirmed": "¡Envío confirmado! La compradora ha sido notificada.",
    "orderFrom": "Pedido de",
    "confirmedOn": "Confirmado el"
  }
}
```

### Estado de producto al cancelar — lógica de reactivación

```
Cancelación de pedido CONFIRMED → ¿reactivar producto?
├─ type = UNIQUE → Product.status = ACTIVE  (pieza única vuelve a estar disponible)
├─ type = STANDARD → Product.status = ACTIVE
└─ type = PERISHABLE → verificar si expiresAt > now
   ├─ Aún vigente (expiresAt > now) → Product.status = ACTIVE
   └─ Ya expirado (expiresAt <= now) → NO reactivar (dejar SOLD/EXPIRED según estado anterior)
      Note: en la práctica PERISHABLE con expiresAt pasada ya fue marcado EXPIRED por el cron de expire-products
```

### Patrones del proyecto que NO se deben romper

- **Auth:** `getServerSession()` de `~/server/auth/session` — en webhooks/cron no aplica
- **DB:** `db` de `~/server/db` — siempre singleton
- **Stripe:** `stripe` de `~/lib/stripe` — siempre verificar `if (!stripe)` antes de usar
- **Respuesta API éxito:** `{ data: ... }`
- **Respuesta API error:** `{ error: { code, message } }`
- **Env vars:** siempre `env` de `~/env`, nunca `process.env` directo
- **Dinero:** SIEMPRE en céntimos, nunca floats
- **Transacciones:** `db.$transaction([...])` cuando se modifiquen múltiples modelos
- **Componentes:** Server Component por defecto, `'use client'` solo para interactividad real
- **rutas de sesión:** `~/server/auth/session` no `next-auth` directamente

### Dependencias con otras historias

| Historia | Relación |
|---|---|
| H5.2 (Checkout) | Se modifica para añadir primera venta sin comisión y penalización pendiente |
| H5.3 (Webhook) | Se modifica para resetear `pendingPenaltyInCents` tras pago exitoso |
| H6.1 (Emails) | Implementará el contenido real de `sendCancellationEmail`, `sendShipmentConfirmedEmail`, `sendOrderCancelledBySystemEmail` |
| H6.2 (Timeline) | Esta historia añade los estados que H6.2 mostrará en el timeline |

### Archivos a CREAR (NUEVOS)

```
src/lib/order-constants.ts
src/app/api/orders/[orderId]/cancel/route.ts
src/app/api/orders/[orderId]/confirm-shipment/route.ts
src/app/api/cron/cancel-overdue-orders/route.ts
src/app/(buyer)/orders/[id]/page.tsx
src/app/(buyer)/orders/[id]/CancelOrderDialog.tsx
src/app/(studio)/studio/orders/page.tsx
src/app/(studio)/studio/orders/[id]/page.tsx
src/app/(studio)/studio/orders/[id]/ConfirmShipmentForm.tsx
```

### Archivos a MODIFICAR (UPDATE)

```
prisma/schema.prisma                        ← añadir cancellationReason en Order, pendingPenaltyInCents en User
vercel.json                                 ← añadir cron cancel-overdue-orders
src/lib/resend.ts                           ← añadir 3 stubs de email
src/app/api/checkout/route.ts               ← FR49 primera venta + penalización pendiente
src/app/api/webhooks/stripe/route.ts        ← reset pendingPenaltyInCents tras pago exitoso
src/app/(buyer)/orders/page.tsx             ← añadir enlace "Ver detalle" en cada pedido
src/i18n/messages/es.json                   ← nuevas claves UI
```

### Revisión de H5.3 — Review Findings pendientes

La historia H5.3 tiene varios `[Review][Patch]` pendientes (en su sección de Review Findings). Antes de mergear H5.4, revisar si alguno aplica a los archivos que H5.4 modifica (principalmente `webhooks/stripe/route.ts`). Los más relevantes para H5.4:

- **Race condition en idempotencia** — ya fue corregida en H5.3 (idempotencia dentro de transacción)
- **firstSaleCompleted logic** — H5.4 añade el reset de `pendingPenaltyInCents` en la misma transacción; asegurarse de no introducir regresión

### Orden de implementación recomendado

1. `prisma/schema.prisma` + migración (bloquea el resto)
2. `src/lib/order-constants.ts` (constantes usadas en varios archivos)
3. `src/lib/resend.ts` (stubs)
4. `src/app/api/checkout/route.ts` (FR49 + penalización)
5. `src/app/api/webhooks/stripe/route.ts` (reset penalización)
6. `src/app/api/orders/[orderId]/cancel/route.ts`
7. `src/app/api/orders/[orderId]/confirm-shipment/route.ts`
8. `src/app/api/cron/cancel-overdue-orders/route.ts`
9. `vercel.json`
10. UI: páginas de detalle y studio orders
11. `src/i18n/messages/es.json`

## Dev Agent Record

### Completion Notes
_(rellenar al completar)_

### Debug Log
_(rellenar si hay problemas)_

## File List

_(rellenar al completar)_

## Change Log

_(rellenar al completar)_
