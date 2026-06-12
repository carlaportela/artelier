# Historia 5.1: Onboarding de Artesana en Stripe Connect

Status: ready-for-dev

## Story

Como artesana,
quiero conectar mi cuenta bancaria con Stripe Connect,
para poder recibir los pagos de mis ventas directamente en mi cuenta.

## Acceptance Criteria

**AC1 — Aviso al intentar publicar sin Stripe conectado**
- **Dado** que soy artesana autenticada sin `stripeAccountId` en mi perfil
- **Cuando** accedo a `/studio/products/new`
- **Entonces** veo un banner de aviso: "Conecta tu cuenta bancaria para poder vender" con un CTA "Conectar ahora"
- **Y** el formulario de publicación no está disponible hasta completar el onboarding

**AC2 — Creación de Stripe Express Account y redirección**
- **Dado** que pulso "Conectar ahora" o "Conectar cuenta bancaria"
- **Cuando** se llama a `POST /api/artisan/stripe-connect`
- **Entonces** se crea una Stripe Connect Express account vía API de Stripe
- **Y** el `stripeAccountId` (ej. `acct_xxx`) se guarda inmediatamente en `User.stripeAccountId`
- **Y** se genera un `AccountLink` con `return_url` y `refresh_url` correctos
- **Y** soy redirigida al flujo de onboarding de Stripe (KYC delegado a Stripe)

**AC3 — Retorno con onboarding completado**
- **Dado** que completo el onboarding en Stripe y Stripe me redirige a `return_url`
- **Cuando** llego a `/studio/stripe-onboarding`
- **Entonces** veo el mensaje: "Tu cuenta bancaria está conectada. Ya puedes vender."
- **Y** un enlace a "Ir a mis productos" (`/studio/products`)

**AC4 — Manejo de onboarding incompleto o expirado**
- **Dado** que el enlace de onboarding expira o el proceso queda incompleto
- **Cuando** Stripe me redirige a `refresh_url` en `/studio/stripe-onboarding/refresh`
- **Entonces** se genera automáticamente un nuevo AccountLink para mi cuenta existente
- **Y** soy redirigida sin fricción al nuevo flujo de onboarding de Stripe

**AC5 — Idempotencia: no crear cuenta duplicada**
- **Dado** que ya tengo `stripeAccountId` en mi perfil
- **Cuando** se llama a `POST /api/artisan/stripe-connect`
- **Entonces** no se crea una nueva cuenta en Stripe
- **Y** se genera un nuevo AccountLink para la cuenta existente y se devuelve la URL

## Tasks / Subtasks

- [ ] T1 — Instalar Stripe SDK y crear cliente singleton
  - [ ] T1.1: `npm install stripe` — instalar el paquete oficial de Stripe para Node.js
  - [ ] T1.2: Crear `src/lib/stripe.ts` — cliente Stripe singleton que lee `env.STRIPE_SECRET_KEY`
  - [ ] T1.3: Si `STRIPE_SECRET_KEY` no está configurado, exportar `null` (misma convención que `src/lib/cloudinary.ts`)

- [ ] T2 — API `POST /api/artisan/stripe-connect`
  - [ ] T2.1: Crear `src/app/api/artisan/stripe-connect/route.ts`
  - [ ] T2.2: Verificar sesión y que el usuario tiene `role === "ARTISAN"` → 401/403 si no
  - [ ] T2.3: Si `user.stripeAccountId` ya existe → saltar creación, usar cuenta existente
  - [ ] T2.4: Si no existe → `stripe.accounts.create({ type: "express", country: "ES", email: user.email })` → guardar `account.id` en `User.stripeAccountId`
  - [ ] T2.5: Generar `AccountLink` con `stripe.accountLinks.create({ account, refresh_url, return_url, type: "account_onboarding" })`
  - [ ] T2.6: `return_url` = `${BASE_URL}/studio/stripe-onboarding`
  - [ ] T2.7: `refresh_url` = `${BASE_URL}/studio/stripe-onboarding/refresh`
  - [ ] T2.8: Devolver `{ data: { url: accountLink.url } }`
  - [ ] T2.9: Si Stripe no está configurado (`stripe === null`) → 503 con `{ error: { code: "SERVICE_UNAVAILABLE", message: "Servicio de pagos no configurado" } }`

- [ ] T3 — Página `return_url`: `/studio/stripe-onboarding`
  - [ ] T3.1: Crear `src/app/(artisan)/studio/stripe-onboarding/page.tsx` — Server Component
  - [ ] T3.2: Verificar sesión → redirect a `/login` si no autenticada
  - [ ] T3.3: Leer `user.stripeAccountId` de la BD
  - [ ] T3.4: Si `stripeAccountId` existe → mostrar pantalla de éxito: "Tu cuenta bancaria está conectada. Ya puedes vender." + enlace a `/studio/products`
  - [ ] T3.5: Si no existe → mostrar "El proceso está pendiente. Vuelve a intentarlo." + botón para reiniciar

- [ ] T4 — Página `refresh_url`: `/studio/stripe-onboarding/refresh`
  - [ ] T4.1: Crear `src/app/(artisan)/studio/stripe-onboarding/refresh/page.tsx` — Server Component
  - [ ] T4.2: Verificar sesión → redirect si no autenticada
  - [ ] T4.3: Llamar internamente al endpoint para regenerar AccountLink (o duplicar lógica directamente con el cliente Stripe)
  - [ ] T4.4: `redirect(newAccountLink.url)` — transparente para la artesana

- [ ] T5 — Guard en página de nuevo producto
  - [ ] T5.1: En `src/app/(artisan)/studio/products/new/page.tsx` (Server Component): leer `user.stripeAccountId`
  - [ ] T5.2: Si no tiene `stripeAccountId` → renderizar banner de aviso en lugar del wizard, con botón CTA "Conectar cuenta bancaria" que llame al endpoint y redirija
  - [ ] T5.3: El CTA debe ser un Client Component (`StripeConnectButton`) que llame a `POST /api/artisan/stripe-connect` y haga `router.push(url)`

- [ ] T6 — Typecheck y build
  - [ ] T6.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T6.2: `npm run build` — debe pasar sin errores

## Dev Notes

### Stripe SDK — instalación y singleton

```bash
npm install stripe
```

Versión actual estable (2026): `stripe` v17+. Usar la última disponible.

Crear `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";
import { env } from "~/env";

export const stripe: Stripe | null = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-05-28.basil" })
  : null;
```

> La API version debe coincidir con la que Stripe recomienda al instalar la librería. Consultar el mensaje de `npm install stripe` para la versión exacta del API string.

**Mismo patrón que `src/lib/cloudinary.ts`** — exporta `null` si la variable de entorno no está configurada, y los endpoints comprueban y devuelven 503 si `stripe === null`.

### Variables de entorno necesarias

Las variables ya están declaradas en `src/env.js` como `optional()`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...   (no se usa en H5.1, pero configurar ya)
STRIPE_WEBHOOK_SECRET=whsec_...      (no se usa en H5.1, configurar en H5.3)
```

**Para local:** añadir al `.env.local`. Para Vercel: configurar en el dashboard del proyecto.

Obtener las keys en: https://dashboard.stripe.com/test/apikeys (modo test para desarrollo).

### BASE_URL para callbacks de Stripe

Los `return_url` y `refresh_url` necesitan URL absoluta. Usar la variable de entorno `NEXTAUTH_URL` (ya declarada en `env.js`) como base:

```typescript
const base = env.NEXTAUTH_URL ?? "http://localhost:3000";
const return_url = `${base}/studio/stripe-onboarding`;
const refresh_url = `${base}/studio/stripe-onboarding/refresh`;
```

### Flujo completo de Stripe Connect Express

```
Artesana pulsa CTA
      ↓
POST /api/artisan/stripe-connect
      ↓ (si no tiene cuenta)
stripe.accounts.create({ type: "express", country: "ES" })
      ↓
db.user.update({ stripeAccountId: account.id })
      ↓
stripe.accountLinks.create({ account, return_url, refresh_url, type: "account_onboarding" })
      ↓
{ data: { url: "https://connect.stripe.com/..." } }
      ↓
router.push(url) — artesana completa KYC en Stripe
      ↓
Stripe redirige a return_url (/studio/stripe-onboarding)
      ↓
Server Component lee user.stripeAccountId → muestra éxito
```

Si el link expira → Stripe redirige a `refresh_url` → página genera nuevo link → redirect transparente.

### Idempotencia — no crear cuentas duplicadas

**CRÍTICO:** Si `user.stripeAccountId` ya existe, nunca llamar a `stripe.accounts.create()`. Generar solo un nuevo `AccountLink` con la cuenta existente. Esto cubre el caso de artesana que repite el proceso o cuyo link ha expirado.

```typescript
const accountId = user.stripeAccountId ?? (await stripe.accounts.create({
  type: "express",
  country: "ES",
  email: user.email ?? undefined,
})).id;

if (!user.stripeAccountId) {
  await db.user.update({ where: { id: userId }, data: { stripeAccountId: accountId } });
}

const link = await stripe.accountLinks.create({
  account: accountId,
  refresh_url,
  return_url,
  type: "account_onboarding",
});
```

### Esquema Prisma — campo ya existente

`User.stripeAccountId String?` ya está en el schema. **No requiere migración.**

### Guard en nueva publicación

El guard está en `src/app/(artisan)/studio/products/new/page.tsx` (Server Component). Solo necesita:

```typescript
const session = await getServerSession();
const user = await db.user.findUnique({ where: { id: session.user.id }, select: { stripeAccountId: true } });
if (!user?.stripeAccountId) {
  return <StripeConnectPrompt />; // Client Component con el botón CTA
}
return <NewProductWizard />;
```

### StripeConnectButton — Client Component

```typescript
"use client";
export default function StripeConnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    const res = await fetch("/api/artisan/stripe-connect", { method: "POST" });
    const { data } = await res.json();
    router.push(data.url);
  }

  return (
    <button onClick={handleConnect} disabled={loading}>
      {loading ? "Cargando..." : "Conectar cuenta bancaria"}
    </button>
  );
}
```

### Patrones del proyecto que NO se deben romper

- **Autenticación:** siempre `getServerSession()` de `~/server/auth/session` — nunca `auth()` directamente
- **DB:** siempre `db` de `~/server/db` — Prisma client singleton
- **Respuesta API:** `{ data: ... }` éxito, `{ error: { code, message } }` error — nunca formato distinto
- **Role check:** `session.user.role === "ARTISAN"` → 403 si no cumple
- **Layout de studio:** las nuevas páginas en `(artisan)/studio/` ya heredan el layout con `ArtisanBottomNav` automáticamente

### Archivos a crear (NUEVOS)

```
src/lib/stripe.ts
src/app/api/artisan/stripe-connect/route.ts
src/app/(artisan)/studio/stripe-onboarding/page.tsx
src/app/(artisan)/studio/stripe-onboarding/refresh/page.tsx
src/components/StripeConnectButton.tsx   (Client Component)
src/components/StripeConnectPrompt.tsx   (contiene el banner + botón)
```

### Archivos a modificar (UPDATE)

```
src/app/(artisan)/studio/products/new/page.tsx  — añadir guard stripeAccountId
```

### Lo que desbloquea esta historia

- **H5.2** necesita `User.stripeAccountId` para crear PaymentIntent con `transfer_data.destination`
- **H5.3** webhooks de Stripe — también necesita la cuenta creada
- **FR49** primera venta sin comisión — usa `User.firstSaleCompleted` (campo ya existe, se actualiza en H5.3)

## Dev Agent Record

### Completion Notes
_(rellenar al completar)_

### Debug Log
_(rellenar si hay problemas)_

## File List

_(rellenar al completar)_

## Change Log

_(rellenar al completar)_
