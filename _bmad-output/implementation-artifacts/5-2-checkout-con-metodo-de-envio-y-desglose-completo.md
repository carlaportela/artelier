# Historia 5.2: Checkout con método de envío y desglose completo de costes

Status: ready-for-dev

## Story

Como compradora,
quiero elegir el método de envío durante el checkout y ver el desglose completo del coste total antes de confirmar el pago,
para tomar una decisión informada y saber exactamente qué protección tengo según el envío que elija.

## Acceptance Criteria

**AC1 — Selector de método de envío y desglose actualizado en tiempo real**
- **Dado** que accedo al checkout en `/checkout?productId=xxx`
- **Cuando** veo la pantalla de pago
- **Entonces** hay un selector de método de envío: "Envío con la plataforma" / "Envío propio de la artesana" / "Recogida en persona"
- **Y** al seleccionar cada opción el desglose se actualiza en tiempo real con el total correcto

**AC2 — Desglose con envío de la plataforma**
- **Dado** que selecciono "Envío con la plataforma"
- **Cuando** el desglose se actualiza
- **Entonces** se muestran líneas separadas: precio del producto + coste de envío + comisión de plataforma (%) + comisión de seguro (%) + fee Stripe = **Total**
- **Y** el botón de pago muestra el total: "Pagar XX,XX€"

**AC3 — Aviso y checkbox para envío no garantizado**
- **Dado** que selecciono "Envío propio de la artesana" o "Recogida en persona"
- **Cuando** el desglose se actualiza
- **Entonces** aparece un aviso: "Sin envío de la plataforma, el seguimiento y la protección ante incidencias son limitados"
- **Y** debo marcar un checkbox confirmando que entiendo las implicaciones antes de poder pagar

**AC4 — Aviso legal para productos perecederos o personalizados**
- **Dado** que el producto es de tipo `PERISHABLE` o `UNIQUE` (personalizado/pieza única)
- **Cuando** veo el checkout
- **Entonces** hay un aviso sobre la excepción al derecho de desistimiento (Art. 103 Directiva 2011/83/UE)
- **Y** debo marcar un checkbox de aceptación separado antes de poder confirmar

**AC5 — Pago exitoso**
- **Dado** que confirmo el pago y Stripe procesa la transacción correctamente
- **Cuando** Stripe me redirige a la `success_url`
- **Entonces** veo una pantalla de confirmación: "Tu pedido está en camino" con enlace a inicio
- **Y** (en H5.3) el webhook de Stripe creará el Order y actualizará Product.status → SOLD

**AC6 — Pago fallido**
- **Dado** que el pago falla en Stripe
- **Cuando** Stripe me redirige a la `cancel_url`
- **Entonces** vuelvo a `/checkout?productId=xxx` con mis opciones conservadas

**AC7 — Rate limiting**
- **Dado** que el endpoint `/api/checkout` recibe más de 5 requests por minuto desde la misma IP
- **Cuando** el rate limiter evalúa la request
- **Entonces** devuelve `429 Too Many Requests`

**AC8 — Producto no disponible**
- **Dado** que el producto ya está vendido (`status: SOLD`) o no existe
- **Cuando** accedo al checkout
- **Entonces** veo un mensaje de error y un enlace para volver al catálogo

## Tasks / Subtasks

- [ ] T1 — Conectar botón "Comprar" del producto al checkout
  - [ ] T1.1: En `src/app/(buyer)/product/[id]/page.tsx` — convertir el `<button>` existente de "Comprar" en un `<Link href={/checkout?productId=${product.id}}>` para la versión desktop
  - [ ] T1.2: Hacer lo mismo para la versión mobile del botón (hay dos versiones en el mismo archivo)

- [ ] T2 — Crear página de checkout
  - [ ] T2.1: Crear `src/app/(buyer)/checkout/page.tsx` — Server Component que lee `productId` de searchParams, verifica que el producto existe y está `ACTIVE`, y pasa los datos al form
  - [ ] T2.2: Si el producto no existe o no está `ACTIVE` → mostrar mensaje de error con link al catálogo
  - [ ] T2.3: Crear `src/app/(buyer)/checkout/CheckoutForm.tsx` — Client Component con selector de envío + desglose reactivo + checkboxes legales + botón "Pagar"
  - [ ] T2.4: El desglose calcula en el cliente: `total = priceInCents + shippingCostInCents + platformFeeInCents + insuranceFeeInCents + stripeFeeInCents`
  - [ ] T2.5: Los checkboxes de AC3 y AC4 bloquean el botón de pago hasta ser marcados

- [ ] T3 — Crear endpoint `POST /api/checkout`
  - [ ] T3.1: Crear `src/app/api/checkout/route.ts`
  - [ ] T3.2: Rate limiting con `checkoutLimiter` — 429 si excede límite
  - [ ] T3.3: Verificar sesión → 401 si no autenticada; verificar `role === "BUYER"` → 403 si no
  - [ ] T3.4: Verificar que el producto existe, está `ACTIVE` y pertenece a una artesana con `stripeAccountId` → 409 si no disponible
  - [ ] T3.5: Verificar que Stripe está configurado (`stripe === null` → 503)
  - [ ] T3.6: Calcular fees en el servidor (misma lógica que el cliente para verificación cruzada)
  - [ ] T3.7: Crear Stripe Checkout Session con `transfer_data.destination: artisan.stripeAccountId`, line items, `success_url`, `cancel_url`
  - [ ] T3.8: Devolver `{ data: { url: session.url } }`

- [ ] T4 — Crear página de éxito
  - [ ] T4.1: Crear `src/app/(buyer)/checkout/success/page.tsx` — Server Component
  - [ ] T4.2: Leer `session_id` de searchParams y verificar con Stripe que `payment_status === 'paid'`
  - [ ] T4.3: Mostrar pantalla de confirmación con mensaje y enlace a `/feed`
  - [ ] T4.4: Si `payment_status !== 'paid'` → mostrar "El pago está siendo procesado" (puede estar pendiente)

- [ ] T5 — Typecheck y build
  - [ ] T5.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T5.2: `npm run build` — debe pasar sin errores

## Dev Notes

### Flujo técnico completo

```
Compradora en /product/[id]
        ↓ pulsa "Comprar"
/checkout?productId=xxx  (Server Component carga producto)
        ↓ CheckoutForm.tsx (Client Component)
  - Selector envío → desglose reactivo
  - Checkboxes legales si aplica
  - "Pagar XX,XX€"
        ↓ POST /api/checkout { productId, shippingMethod }
  - Rate limiting
  - Auth + role check
  - Producto disponible + artesana tiene Stripe
  - Calcular fees
  - stripe.checkout.sessions.create(...)
  - { data: { url } }
        ↓ router.push(url) → Stripe gestiona tarjeta + 3DS
        ↓ Stripe redirige a success_url
/checkout/success?session_id=xxx
  - Verificar payment_status === 'paid'
  - Mostrar confirmación
        ↓ (H5.3: webhook payment_intent.succeeded → crear Order + SOLD)
```

**IMPORTANTE:** El registro `Order` NO se crea en H5.2. Se crea en H5.3 mediante webhook con idempotencia via `stripeEventId`. En H5.2 solo mostramos confirmación visual al usuario.

### Por qué Stripe Checkout Sessions (no Stripe Elements)

Stripe Checkout Sessions es la forma más robusta y simple:
- No requiere `@stripe/react-stripe-js` en el frontend
- Stripe gestiona automáticamente 3DS, reintento de tarjetas, wallets (Apple Pay, Google Pay)
- Mismo patrón que `StripeConnectButton` — POST que devuelve URL + router.push

### Estructura de fees

Los porcentajes deben ser constantes en un archivo de configuración. Usar estos valores de referencia (confirmar con PM antes de producción):

```typescript
// src/lib/fees.ts
export const PLATFORM_FEE_RATE = 0.08;   // 8% — comisión plataforma (al artesano)
export const INSURANCE_FEE_RATE = 0.02;  // 2% — comisión seguro (al comprador)
export const STRIPE_FEE_RATE = 0.015;    // 1.5% — fee Stripe
export const STRIPE_FEE_FIXED = 25;      // €0.25 en céntimos
export const PLATFORM_SHIPPING_COST = 490; // €4.90 en céntimos (envío plataforma)
```

**Cálculo de fees (SIEMPRE EN CÉNTIMOS):**

```typescript
const price = product.priceInCents; // ej: 3800 = 38,00€
const shippingCost = shippingMethod === "PLATFORM" ? PLATFORM_SHIPPING_COST : 0;
const subtotal = price + shippingCost;
const insuranceFee = Math.round(subtotal * INSURANCE_FEE_RATE);
const stripeFee = Math.round(subtotal * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
// platformFee se descuenta al artesano en transfer_data, no lo paga el comprador
const total = subtotal + insuranceFee + stripeFee;
```

**Nunca usar floats para dinero.** Siempre `Math.round()` para céntimos.

### Stripe Checkout Session — parámetros clave

```typescript
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [
    { price_data: { currency: "eur", product_data: { name: product.name }, unit_amount: product.priceInCents }, quantity: 1 },
    // añadir líneas para envío, seguro, etc.
  ],
  payment_intent_data: {
    transfer_data: {
      destination: artisan.stripeAccountId,
      // amount: artisan recibe priceInCents - platformFeeInCents
    },
  },
  success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${base}/checkout?productId=${productId}`,
});
```

**`{CHECKOUT_SESSION_ID}` es un template literal de Stripe** — lo reemplaza Stripe automáticamente, NO es JS.

### Esquema Prisma — campos ya existentes, sin migración

```prisma
enum ShippingMethod { PLATFORM  ARTISAN_OWN  PICKUP }
enum ProductType    { UNIQUE  PERISHABLE  STANDARD }
enum ProductStatus  { ACTIVE  SOLD  EXPIRED }

model Order {
  priceInCents          Int
  platformFeeInCents    Int   // plataforma + seguro combinados en BD
  stripeFeeInCents      Int
  totalInCents          Int
  shippingMethod        ShippingMethod
  stripePaymentIntentId String @unique
  stripeEventId         String @unique  // viene del webhook → H5.3
}

model User {
  stripeAccountId    String?   // de H5.1
  firstSaleCompleted Boolean @default(false)  // FR49 — se gestiona en H5.3
}
```

**No se requiere migración de BD.** Todos los campos ya existen.

### Rate limiting — patrón ya existente

`checkoutLimiter` ya está definido en `src/lib/ratelimit.ts` como 5 req / 60s:

```typescript
import { checkoutLimiter } from "~/lib/ratelimit";

const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success } = await checkoutLimiter.limit(ip);
if (!success) {
  return NextResponse.json(
    { error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas solicitudes. Inténtalo más tarde." } },
    { status: 429 },
  );
}
```

### Checkboxes legales — cuándo mostrarlos

```typescript
// AC3: envío sin garantía
const needsShippingWarning = shippingMethod === "ARTISAN_OWN" || shippingMethod === "PICKUP";

// AC4: excepción desistimiento
const needsLegalWarning = product.type === "PERISHABLE" || product.type === "UNIQUE";
```

Ambos checkboxes son independientes. El botón "Pagar" está `disabled` hasta que los necesarios estén marcados.

### Botón "Comprar" existente en product page

En `src/app/(buyer)/product/[id]/page.tsx` hay **dos versiones** del botón "Comprar" (líneas ~178 y ~193 — móvil y desktop). Ambas deben convertirse en `<Link>`. Verificar el archivo antes de editar.

### Patrones del proyecto que NO se deben romper

- **Auth:** siempre `getServerSession()` de `~/server/auth/session`
- **DB:** siempre `db` de `~/server/db`
- **Stripe:** `stripe` de `~/lib/stripe` — comprobar `stripe === null` antes de usar
- **Respuesta API:** `{ data: ... }` éxito, `{ error: { code, message } }` error
- **Env vars:** siempre a través de `env` de `~/env`, nunca `process.env` directo
- **Dinero:** SIEMPRE en céntimos (enteros), nunca floats
- **BASE_URL para Stripe:** mismo patrón que H5.1 — `env.NEXTAUTH_URL ?? (env.VERCEL_URL ? https://${env.VERCEL_URL} : "http://localhost:3000")`

### Archivos a crear (NUEVOS)

```
src/lib/fees.ts
src/app/(buyer)/checkout/page.tsx
src/app/(buyer)/checkout/CheckoutForm.tsx
src/app/(buyer)/checkout/success/page.tsx
src/app/api/checkout/route.ts
```

### Archivos a modificar (UPDATE)

```
src/app/(buyer)/product/[id]/page.tsx  — convertir botones "Comprar" en Links
```

### Lo que desbloquea esta historia

- **H5.3** webhooks — recibe `checkout.session.completed` → crea Order + actualiza Product.status → SOLD + gestiona firstSaleCompleted (FR49)

## Dev Agent Record

### Completion Notes
_(rellenar al completar)_

### Debug Log
_(rellenar si hay problemas)_

## File List

_(rellenar al completar)_

## Change Log

_(rellenar al completar)_
