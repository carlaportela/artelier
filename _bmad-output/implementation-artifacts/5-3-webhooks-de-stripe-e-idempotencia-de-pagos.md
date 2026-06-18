# Historia 5.3: Webhooks de Stripe e idempotencia de pagos

Status: ready-for-dev

## Story

Como sistema,
quiero procesar los eventos de Stripe de forma segura e idempotente,
para garantizar que ningún pago se procese dos veces aunque Stripe reenvíe el mismo evento.

## Acceptance Criteria

**AC1 — Verificación de firma del webhook**
- **Dado** que Stripe envía un evento `payment_intent.succeeded` al endpoint `POST /api/webhooks/stripe`
- **Cuando** el endpoint recibe la request con cabecera `stripe-signature`
- **Entonces** verifica la firma con `stripe.webhooks.constructEvent` usando `STRIPE_WEBHOOK_SECRET`
- **Y** si la firma es inválida, devuelve `400 Bad Request` sin procesar nada
- **Y** si `STRIPE_WEBHOOK_SECRET` no está configurado, devuelve `503 Service Unavailable`

**AC2 — Idempotencia: evento duplicado ignorado**
- **Dado** que el webhook recibe un evento con `id: "evt_..."` y firma válida
- **Cuando** ya existe un `Order` en la base de datos con ese `stripeEventId`
- **Entonces** devuelve `200 OK` sin volver a crear el pedido
- **Y** no se envían emails doblados

**AC3 — Creación de Order en primera recepción**
- **Dado** que es la primera vez que llega ese evento
- **Cuando** se procesa correctamente
- **Entonces** se crea un nuevo registro `Order` con:
  - `buyerId`: del payload de Stripe (vía metadata)
  - `artisanId`: del `product.artisanId`
  - `productId`: del payload de Stripe
  - `status: CONFIRMED`
  - `shippingMethod`: del payload de Stripe
  - `priceInCents`, `platformFeeInCents`, `stripeFeeInCents`, `totalInCents`: del payload
  - `stripePaymentIntentId`: del evento
  - `stripeEventId`: del evento (garantiza idempotencia en futuros reenvíos)
- **Y** se actualiza `Product.status: SOLD` para el producto comprado
- **Y** se marca `User.firstSaleCompleted = true` si es la primera venta del artesano (FR49)

**AC4 — Notificaciones por email (fire-and-forget)**
- **Dado** que el Order se ha creado correctamente
- **Cuando** se llama a `sendOrderConfirmation(order)` y `sendNewSale(order)` desde `src/lib/resend.ts`
- **Entonces** se envían los emails transaccionales correspondientes
- **Y** si el envío falla, el error se captura silenciosamente (try/catch sin re-throw) — el webhook devuelve `200 OK` igual
- **Y** el error de email se registra en Sentry para seguimiento

**AC5 — Error interno: reintento automático de Stripe**
- **Dado** que ocurre un error interno (500) al procesar el evento
- **Cuando** el endpoint devuelve `500 Internal Server Error`
- **Entonces** Stripe reintenta el evento con exponential backoff (3 horas, 5 minutos, 1 segundo)
- **Y** el error queda registrado en Sentry con contexto del evento

**AC6 — Rate limiting no se aplica a webhooks**
- **Dado** que Stripe envía múltiples eventos rapidamente
- **Cuando** llegan a `POST /api/webhooks/stripe`
- **Entonces** el rate limiting NO se aplica (este endpoint está exento)
- **Y** se procesan todos los eventos

**AC7 — Campos metadata guardados en Order**
- **Dado** que se crea el Order
- **Cuando** la metadata de Stripe contiene los datos de costes
- **Entonces** se calculan los valores de fees directamente del payload de Stripe, nunca se recalculan en el servidor
- **Y** se valida que los totales coincidan con los datos del `Product` + `shippingMethod` para detectar manipulaciones

## Tasks / Subtasks

- [ ] T1 — Crear endpoint `POST /api/webhooks/stripe`
  - [ ] T1.1: Crear `src/app/api/webhooks/stripe/route.ts`
  - [ ] T1.2: Leer `STRIPE_WEBHOOK_SECRET` desde env — si no existe, devolver `503`
  - [ ] T1.3: Leer raw body de la request (Stripe lo requiere para la firma)
  - [ ] T1.4: Llamar a `stripe.webhooks.constructEvent(body, signature, secret)` con manejo de error → `400` si falla

- [ ] T2 — Procesar evento `payment_intent.succeeded`
  - [ ] T2.1: Extraer `event.id` (stripeEventId), `event.data.object.id` (paymentIntentId) y `event.data.object.metadata`
  - [ ] T2.2: Buscar si ya existe `Order` con `stripeEventId === event.id` → si existe, devolver `200` sin procesar más
  - [ ] T2.3: Si no existe, extraer del metadata: `productId`, `buyerId`, `shippingMethod`, `priceInCents`, `platformFeeInCents`, `stripeFeeInCents`, `totalInCents`
  - [ ] T2.4: Validar que el `Product` existe, está `ACTIVE` y no está borrado
  - [ ] T2.5: Validar que el `Product.artisanId` existe y tiene `stripeAccountId` configurado

- [ ] T3 — Crear el registro Order
  - [ ] T3.1: Crear `Order` en la base de datos con todos los campos requeridos
  - [ ] T3.2: Actualizar `Product.status = SOLD` (solo si `Product.type !== PERISHABLE` — los perecederos se manejan en H5.4)
  - [ ] T3.3: Verificar si es la primera venta completada: buscar órdenes anteriores del artesano → si no hay otras completadas, marcar `User.firstSaleCompleted = true` (FR49)

- [ ] T4 — Enviar notificaciones por email
  - [ ] T4.1: Importar `sendOrderConfirmation` y `sendNewSale` desde `src/lib/resend.ts` (estas funciones deben existir aunque estén stub hasta H6.1)
  - [ ] T4.2: Llamar a ambas funciones dentro de un `try/catch` — capturar error silenciosamente sin romper el flujo del webhook
  - [ ] T4.3: Si hay error en email, registrar en Sentry con `captureException(error)` + contexto del Order
  - [ ] T4.4: Devolver `200 OK` sea cual sea el resultado del email

- [ ] T5 — Manejo de errores y logging
  - [ ] T5.1: Errores de verificación de firma → `400 Bad Request` + no registrar en Sentry
  - [ ] T5.2: Errores de validación (producto no existe, etc.) → `409 Conflict` + registrar en Sentry
  - [ ] T5.3: Errores internos (inesperados) → `500 Internal Server Error` + registrar en Sentry con stack trace completo
  - [ ] T5.4: Transacción de BD: si falla la creación de Order, devolver `500` y dejar que Stripe reintente

- [ ] T6 — Validación cruzada de fees
  - [ ] T6.1: Implementar función `validateCheckoutFees(product, shippingMethod, metadata)` en `src/lib/fees.ts`
  - [ ] T6.2: Esta función recalcula los fees localmente y compara con los del metadata del evento
  - [ ] T6.3: Si no coinciden (diferencia > 1 céntimo), registrar en Sentry como anomalía pero PERMITIR la creación del Order (no bloquear)
  - [ ] T6.4: Incluir las diferencias en el log de Sentry para auditoría

- [ ] T7 — Typecheck y build
  - [ ] T7.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T7.2: `npm run build` — debe pasar sin errores
  - [ ] T7.3: Verificar que no hay warnings no resueltos

## Dev Notes

### Flujo técnico completo

```
Compradora → Stripe → Stripe procesa pago → payment_intent.succeeded ✓
        ↓
Stripe envía POST /api/webhooks/stripe
        ↓
1. Verificar firma con STRIPE_WEBHOOK_SECRET
   ├─ Inválida → 400 (Stripe reintenta)
   └─ Válida → siguiente
        ↓
2. Buscar si ya existe Order con stripeEventId
   ├─ Existe → 200 OK (idempotencia)
   └─ No existe → siguiente
        ↓
3. Crear Order + actualizar Product.status → SOLD
   ├─ Éxito → siguiente
   └─ Error → 500 (Stripe reintenta)
        ↓
4. Marcar firstSaleCompleted si aplica (FR49)
        ↓
5. Enviar emails (fire-and-forget, no bloquea)
   ├─ Éxito → log en Sentry (info)
   └─ Fallo → log en Sentry (error)
        ↓
Devolver 200 OK
```

**IMPORTANTE:** El Order se crea SOLO por webhook en H5.3. El checkout (H5.2) no crea Order — solo crea Stripe Session y redirige a confirmación visual.

### Por qué idempotencia con stripeEventId

Stripe puede reenviar el mismo evento múltiples veces:
1. Reintento por timeout transitorio
2. Webhook fallido, reintento automático con backoff exponencial
3. Reintento manual del administrador de Stripe

Guardando `event.id` en `Order.stripeEventId`, garantizamos que:
- Primer reenvío: se crea Order
- Siguientes reenvíos: se encuentra Order, devolvemos `200` sin duplicar

**Esto es mejor que usar `stripePaymentIntentId` para idempotencia** porque:
- `paymentIntent.id` puede existir en estados REQUIRES_PAYMENT_METHOD o REQUIRES_CONFIRMATION antes de succeeded
- `event.id` es único para cada intento de webhook — no hay ambigüedad

### Firma de webhook — lectura de raw body

Stripe requiere el **raw body sin parsear** para verificar la firma. Next.js por defecto parsea el body JSON automáticamente. Para obtener el raw body:

```typescript
const body = await req.text();  // ← raw string, no JSON
const signature = headers().get('stripe-signature')!;

// stripe.webhooks.constructEvent necesita raw body
const event = stripe.webhooks.constructEvent(body, signature, secret);
```

Si pasas `JSON.stringify(await req.json())`, la verificación fallará.

### Metadata structure — de H5.2 al webhook

En H5.2, el endpoint `/api/checkout` crea Stripe Session con:

```typescript
metadata: {
  productId,
  buyerId,
  shippingMethod,
  priceInCents,
  platformFeeInCents,
  stripeFeeInCents,
  totalInCents,
}
```

En H5.3, el webhook lee esta metadata desde `payment_intent.metadata`:

```typescript
const {
  productId,
  buyerId,
  shippingMethod,
  priceInCents,
  platformFeeInCents,
  stripeFeeInCents,
  totalInCents,
} = event.data.object.metadata;
```

**Todos estos campos son strings en metadata de Stripe.** Convertir a números con `parseInt()`.

### Campos a validar en webhook

```typescript
// ✓ Validación de datos de evento
const event = stripe.webhooks.constructEvent(...);
if (event.type !== 'payment_intent.succeeded') {
  return NextResponse.json({ received: true }); // ignorar otros eventos
}

const paymentIntent = event.data.object;
if (!paymentIntent.metadata) {
  return NextResponse.json(
    { error: { code: 'INVALID_METADATA' } },
    { status: 400 }
  );
}

// ✓ Validación de idempotencia
const existingOrder = await db.order.findUnique({
  where: { stripeEventId: event.id }
});
if (existingOrder) {
  return NextResponse.json({ received: true });
}

// ✓ Validación de producto y artesano
const product = await db.product.findUnique({
  where: { id: productId },
  include: { artisan: true }
});
if (!product || product.status !== 'ACTIVE') {
  return NextResponse.json(
    { error: { code: 'PRODUCT_UNAVAILABLE' } },
    { status: 409 }
  );
}

if (!product.artisan.stripeAccountId) {
  return NextResponse.json(
    { error: { code: 'ARTISAN_UNAVAILABLE' } },
    { status: 409 }
  );
}
```

### Creación atómica de Order

```typescript
// ✓ Transacción: crear Order + actualizar Product en una sola transacción
const [order] = await db.$transaction([
  db.order.create({
    data: {
      buyerId,
      artisanId: product.artisanId,
      productId,
      status: 'CONFIRMED',
      shippingMethod,
      priceInCents: parseInt(priceInCents),
      platformFeeInCents: parseInt(platformFeeInCents),
      stripeFeeInCents: parseInt(stripeFeeInCents),
      totalInCents: parseInt(totalInCents),
      stripePaymentIntentId: paymentIntent.id,
      stripeEventId: event.id,
    },
  }),
  db.product.update({
    where: { id: productId },
    data: { status: 'SOLD' },
  }),
]);
```

**Si algo falla en la transacción, Prisma revierte automáticamente.**

### firstSaleCompleted — solo para artesana

```typescript
// ✓ Buscar órdenes anteriores completadas del artesano
const previousOrders = await db.order.findMany({
  where: {
    artisanId: product.artisanId,
    status: 'ACCEPTED', // solo órdenes completadas
    createdAt: { lt: new Date() }, // no incluir la que acabamos de crear
  },
  take: 1,
});

// Si no hay órdenes previas completadas, es la primera venta
if (previousOrders.length === 0) {
  await db.user.update({
    where: { id: product.artisanId },
    data: { firstSaleCompleted: true },
  });
}
```

**Nota:** En la orden actual el status es `CONFIRMED`, no `ACCEPTED`. `ACCEPTED` lo pone el comprador o el cron en H6.3. Aquí buscamos órdenes **previas**.

### Envío de emails — stub hasta H6.1

Hasta que H6.1 implemente el envío real:

```typescript
// src/lib/resend.ts
export async function sendOrderConfirmation(order: Order): Promise<void> {
  // TODO: Implementar en H6.1
  console.log(`[TODO] Enviar email de confirmación: Orden ${order.id}`);
}

export async function sendNewSale(order: Order): Promise<void> {
  // TODO: Implementar en H6.1
  console.log(`[TODO] Enviar email de nueva venta: Orden ${order.id}`);
}
```

En H5.3, estas funciones existen pero son stubs. El webhook las llama dentro de try/catch para que H6.1 solo tenga que cambiar el body sin tocar el webhook.

### Logging y Sentry

```typescript
import Sentry from '@sentry/nextjs';

// ✓ Log de evento recibido (info)
Sentry.captureMessage(`Webhook: payment_intent.succeeded received`, 'info', {
  contexts: { event: { id: event.id, paymentIntentId: paymentIntent.id } },
});

// ✓ Log de error (error)
Sentry.captureException(error, {
  contexts: {
    webhook: {
      eventId: event.id,
      orderId: order?.id,
      productId,
    },
  },
});

// ✓ Log de anomalía (warning)
if (feeDifference > 1) {
  Sentry.captureMessage('Fee mismatch in webhook', 'warning', {
    contexts: {
      fee_validation: {
        orderId: order.id,
        expectedTotal: expectedTotal,
        actualTotal: totalInCents,
        difference: feeDifference,
      },
    },
  });
}
```

### Esquema Prisma — campos ya existentes

```prisma
model Order {
  id                    String    @id @default(cuid())
  stripePaymentIntentId String    @unique  // ← viene del paymentIntent.id
  stripeEventId         String    @unique  // ← viene del event.id (CLAVE para idempotencia)
  // ... resto de campos ya existen
}

model Product {
  status ProductStatus @default(ACTIVE)
  // ACTIVE | SOLD | EXPIRED
}

model User {
  firstSaleCompleted Boolean @default(false)  // ← marca si artesano ha completado 1ª venta (FR49)
}
```

**No se requiere migración de BD.** Todos los campos ya existen en schema.prisma.

### Variables de entorno requeridas

```
STRIPE_SECRET_KEY           ← ya existe en .env (H5.1)
STRIPE_WEBHOOK_SECRET       ← NUEVA — configurar en Vercel dashboard para produción, en .env.local para dev
STRIPE_API_VERSION          ← ya existe en src/lib/stripe.ts (2026-05-27.dahlia)
NEXTAUTH_URL                ← ya existe (H5.2)
SENTRY_DSN                  ← ya existe (H0 setup)
```

**Para obtener STRIPE_WEBHOOK_SECRET:**
1. Ir a dashboard.stripe.com → Developers → Webhooks
2. Crear endpoint: `https://<domain>/api/webhooks/stripe`
3. Seleccionar eventos: `payment_intent.succeeded`
4. Copiar "Signing secret" del modal
5. Guardar en `.env.local` y en Vercel dashboard

### Patrones del proyecto que NO se deben romper

- **Auth:** siempre `getServerSession()` de `~/server/auth/session` (aunque en webhooks no aplica)
- **DB:** siempre `db` de `~/server/db`
- **Stripe:** `stripe` de `~/lib/stripe` — comprobar `stripe === null` antes de usar
- **Respuesta API:** `{ data: ... }` éxito, `{ error: { code, message } }` error, `{ received: true }` para webhooks
- **Env vars:** siempre a través de `env` de `~/env`, nunca `process.env` directo
- **Dinero:** SIEMPRE en céntimos (enteros), nunca floats
- **Transacciones:** usar `db.$transaction([...])` cuando se modifiquen múltiples modelos

### Diferencia entre H5.2 y H5.3

| Aspecto | H5.2 (Checkout) | H5.3 (Webhook) |
|---|---|---|
| Quién lo ejecuta | Cliente (NavegadorBrowser) + servidor | Servidor (Stripe) |
| Cuándo ocurre | Al pulsar "Pagar" | Después de que Stripe procesa el pago |
| Qué crea | Stripe Session (no Order) | Order en BD |
| Qué actualiza | Nada | Product.status → SOLD, User.firstSaleCompleted |
| Dónde se guarda data | Stripe (Session) | BD (Order) + Stripe |
| Idempotencia | N/A | Via stripeEventId |

### Archivos a crear (NUEVOS)

```
src/app/api/webhooks/stripe/route.ts
```

### Archivos a modificar (UPDATE)

```
src/lib/resend.ts             ← agregar stubs sendOrderConfirmation, sendNewSale
src/lib/fees.ts               ← agregar función validateCheckoutFees (opcional, para AC6)
src/lib/stripe.ts             ← sin cambios (ya existe)
src/env.ts o env.js           ← agregar STRIPE_WEBHOOK_SECRET a validación
```

### Lo que desbloquea esta historia

- **H5.4** — Confirmación de envío y penalizaciones: usa el Order creado aquí
- **H6.1** — Notificaciones por email: reemplaza los stubs con implementación real
- **H6.2** — Timeline de estados: lee Order.status
- **H6.3** — Aceptación y liberación de pago: consulta Order.status

## Dev Agent Record

### Completion Notes
_(rellenar al completar)_

### Debug Log
_(rellenar si hay problemas)_

## File List

_(rellenar al completar)_

## Change Log

_(rellenar al completar)_
