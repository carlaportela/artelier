# Story 0.1: Inicialización del proyecto T3

Status: ready-for-dev

## Story

Como desarrolladora,
quiero inicializar el proyecto con T3 Stack (sin tRPC) y shadcn/ui con el schema Prisma completo,
para tener el stack base, estructura de directorios y modelo de datos listos para implementar funcionalidades desde el primer día.

## Acceptance Criteria

1. **[Compilación]** Dado que ejecuto el comando de inicialización de T3 con TypeScript ✓ · Tailwind ✓ · Auth.js ✓ · Prisma ✓ · tRPC ✗, cuando completo la configuración, entonces `npm run build` y `npm run dev` arrancан sin errores.

2. **[shadcn/ui]** Dado que el proyecto está inicializado, cuando ejecuto `npx shadcn@latest init` con New York style, CSS variables, Zinc, entonces `src/components/ui/` existe con los 10 componentes base instalados y `components.json` está en la raíz con la configuración correcta.

3. **[Estructura]** Dado que el proyecto está configurado, cuando reviso la estructura de directorios, entonces existen `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/hooks/`, `src/stores/`, `src/i18n/messages/` con sus archivos base, y `auth.config.ts` existe en la raíz del proyecto separado de `src/lib/auth.ts`.

4. **[Variables de entorno]** Dado que el proyecto está configurado, cuando reviso `.env.example`, entonces documenta todas las variables: `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET` con valores de ejemplo.

5. **[Prisma schema]** Dado que ejecuto `npx prisma migrate dev --name init`, cuando la migración se completa, entonces todos los modelos (User, Product, Order, Message, Conversation, Dispute, Seal, ProductSeal, Follow, ProcessUpdate, TransactionLog) existen en la base de datos, todas las entidades excepto TransactionLog tienen campo `deletedAt DateTime?`, y `npm run build` sigue compilando sin errores.

## Tasks / Subtasks

- [ ] Task 1: Inicializar T3 Stack (AC: 1)
  - [ ] Ejecutar `npm create t3-app@latest artelier` — opciones: TypeScript ✓, Tailwind CSS ✓, Auth.js ✓, Prisma ✓, tRPC ✗
  - [ ] Verificar `npm run build` pasa sin errores
  - [ ] Ejecutar `npx shadcn@latest init` — New York style, CSS variables, Zinc base color
  - [ ] Verificar `src/components/ui/` creado y `components.json` en raíz

- [ ] Task 2: Instalar componentes shadcn/ui base (AC: 2)
  - [ ] `npx shadcn@latest add button input card dialog tabs badge avatar sheet separator sonner`
  - [ ] Verificar que los 10 componentes están en `src/components/ui/`

- [ ] Task 3: Crear estructura de directorios adicional (AC: 3)
  - [ ] Crear `src/types/api.ts` — tipos `ApiResponse<T>`, `ApiError` con forma `{ error: { code: string; message: string; fields?: unknown } }`
  - [ ] Crear `src/types/index.ts` — re-exporta tipos Prisma + tipos de dominio
  - [ ] Crear `src/hooks/` con `.gitkeep`
  - [ ] Crear `src/stores/cart.ts` — store Zustand vacío (stub) para el carrito
  - [ ] Crear `src/i18n/config.ts` — next-intl: locales `['es']`, defaultLocale `'es'`
  - [ ] Crear `src/i18n/messages/es.json` — objeto vacío `{}` (se rellena en historias posteriores)

- [ ] Task 4: Configurar auth.config.ts y src/lib/auth.ts (AC: 3)
  - [ ] Crear `auth.config.ts` en raíz: solo `providers: [Credentials({ ... })]`, **sin importar Prisma** (Edge-safe)
  - [ ] Crear/actualizar `src/lib/auth.ts`: importa `auth.config.ts` + callbacks de sesión en BD con Prisma + RBAC en token/session
  - [ ] Crear `src/lib/db.ts`: singleton de Prisma client con patrón de prevención de hot-reload en dev

- [ ] Task 5: Definir schema Prisma completo (AC: 5)
  - [ ] Definir enum `Role { ARTISAN BUYER ADMIN }`
  - [ ] Definir enum `ProductType { UNIQUE PERISHABLE STANDARD }`
  - [ ] Definir enum `ProductStatus { ACTIVE SOLD EXPIRED DELETED }`
  - [ ] Definir enum `OrderStatus { CONFIRMED IN_PREPARATION READY SHIPPED DELIVERED ACCEPTED CANCELLED REFUNDED IN_DISPUTE }`
  - [ ] Definir enum `DisputeStatus { OPEN RETURN_REQUESTED RETURN_IN_TRANSIT ESCALATED RESOLVED REJECTED }`
  - [ ] Definir enum `SealRequestStatus { PENDING APPROVED REJECTED }`
  - [ ] Definir modelo `User` (ver Dev Notes para campos completos)
  - [ ] Definir modelo `Product` con `type`, `status`, `expiresAt?`, `deletedAt?`
  - [ ] Definir modelo `Order` con `stripePaymentIntentId`, `stripeEventId`, `status`, `shippingMethod`
  - [ ] Definir modelo `Message` y `Conversation`
  - [ ] Definir modelo `Dispute` con `status`
  - [ ] Definir modelo `Seal` y `ProductSeal`
  - [ ] Definir modelo `Follow`
  - [ ] Definir modelo `ProcessUpdate`
  - [ ] Definir modelo `TransactionLog` **sin** `deletedAt` (retención forzada 5 años)
  - [ ] Ejecutar `npx prisma migrate dev --name init`
  - [ ] Verificar `npm run build` pasa sin errores tras migración

- [ ] Task 6: Crear .env.example (AC: 4)
  - [ ] Documentar las 13 variables requeridas con valores de ejemplo descriptivos

- [ ] Task 7: Instalar dependencias adicionales de historias cercanas
  - [ ] `npm install next-intl zustand react-hook-form @hookform/resolvers zod`
  - [ ] Verificar `npm run build` sigue pasando

## Dev Notes

### Comando exacto de inicialización (AR1)

```bash
npm create t3-app@latest artelier
# En el setup interactivo seleccionar:
#   ✓ TypeScript
#   ✓ Tailwind CSS
#   ✓ Auth.js (NextAuth v5)
#   ✓ Prisma
#   ✗ tRPC  ← deseleccionar
cd artelier
npx shadcn@latest init
# Opciones: New York style · CSS variables · Zinc base color
```

[Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]

### SEPARACIÓN CRÍTICA: auth.config.ts vs src/lib/auth.ts (AR4)

El middleware de Next.js corre en **Edge Runtime** y **no puede importar Prisma**. Esta separación es obligatoria:

| Archivo | Ubicación | Puede importar Prisma | Usado por |
|---|---|---|---|
| `auth.config.ts` | Raíz del proyecto | ❌ NO | `src/middleware.ts`, `src/lib/auth.ts` |
| `src/lib/auth.ts` | `src/lib/` | ✅ SÍ | Route Handlers, Server Components |

```typescript
// auth.config.ts (raíz) — SOLO providers, sin Prisma
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        // Validación básica sin BD — la BD se accede en src/lib/auth.ts callbacks
        return null // se implementa en Historia 1.2
      }
    })
  ],
} satisfies NextAuthConfig
```

```typescript
// src/lib/auth.ts — importa auth.config + Prisma callbacks
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "~/lib/db"
import authConfig from "../../auth.config" // importa la config Edge-safe

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  ...authConfig,
})
```

[Source: _bmad-output/planning-artifacts/architecture.md#Boundary Rules]

### Prisma singleton en dev (src/lib/db.ts)

Next.js dev server con hot-reload puede crear múltiples instancias de Prisma. Patrón estándar:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

T3 puede generar este archivo automáticamente — revisar si ya existe antes de crearlo.

### Schema Prisma completo (AR2)

T3 genera modelos de Auth.js (Account, Session, VerificationToken, User base) — **mantenerlos todos** y extender el modelo `User` con campos propios:

```prisma
// Enums
enum Role {
  ARTISAN
  BUYER
  ADMIN
}

enum ProductType {
  UNIQUE      // pieza única, stock = 1
  PERISHABLE  // tiene expiresAt
  STANDARD    // otros
}

enum ProductStatus {
  ACTIVE
  SOLD
  EXPIRED
  DELETED
}

enum OrderStatus {
  CONFIRMED
  IN_PREPARATION
  READY
  SHIPPED
  DELIVERED
  ACCEPTED
  CANCELLED
  REFUNDED
  IN_DISPUTE
}

enum DisputeStatus {
  OPEN
  RETURN_REQUESTED
  RETURN_IN_TRANSIT
  ESCALATED
  RESOLVED
  REJECTED
}

enum SealRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ShippingMethod {
  PLATFORM
  ARTISAN_OWN
  PICKUP
}

// Extender User con campos de negocio
model User {
  // campos generados por Auth.js (no eliminar):
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // campos propios de Artelier:
  role                Role      @default(BUYER)
  password            String?   // hash bcrypt cost 12
  stripeAccountId     String?   // Stripe Connect Express
  firstSaleCompleted  Boolean   @default(false) // FR49: primera venta sin comisión
  twoFactorSecret     String?   // TOTP para admin (AR5)
  twoFactorEnabled    Boolean   @default(false)
  suspended           Boolean   @default(false)
  deletedAt           DateTime? // soft-delete (RGPD)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // relaciones:
  products        Product[]
  orders          Order[]        @relation("BuyerOrders")
  artisanOrders   Order[]        @relation("ArtisanOrders")
  conversations   Conversation[]
  sentMessages    Message[]
  follows         Follow[]       @relation("Follower")
  followers       Follow[]       @relation("Following")
  disputes        Dispute[]
  processUpdates  ProcessUpdate[]
  sealRequests    SealRequest[]
}

model Product {
  id          String        @id @default(cuid())
  artisanId   String
  artisan     User          @relation(fields: [artisanId], references: [id])
  name        String
  description String
  priceInCents Int          // SIEMPRE en céntimos — nunca floats
  type        ProductType
  status      ProductStatus @default(ACTIVE)
  expiresAt   DateTime?     // solo para PERISHABLE
  imageUrls   String[]      // publicIds de Cloudinary
  category    String
  locality    String
  deletedAt   DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  orders        Order[]
  seals         ProductSeal[]
  sealRequests  SealRequest[]
}

model Order {
  id                    String      @id @default(cuid())
  buyerId               String
  buyer                 User        @relation("BuyerOrders", fields: [buyerId], references: [id])
  artisanId             String
  artisan               User        @relation("ArtisanOrders", fields: [artisanId], references: [id])
  productId             String
  product               Product     @relation(fields: [productId], references: [id])
  status                OrderStatus @default(CONFIRMED)
  shippingMethod        ShippingMethod
  priceInCents          Int
  platformFeeInCents    Int
  stripeFeeInCents      Int
  totalInCents          Int
  stripePaymentIntentId String      @unique
  stripeEventId         String      @unique // idempotencia de webhooks
  trackingNumber        String?
  paidOut               Boolean     @default(false)
  deletedAt             DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  disputes Dispute[]
}

model Conversation {
  id          String    @id @default(cuid())
  participant User      @relation(fields: [participantId], references: [id])
  participantId String
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  messages Message[]
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  content        String
  imageUrl       String?      // publicId Cloudinary
  readAt         DateTime?
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())
}

model Dispute {
  id        String        @id @default(cuid())
  orderId   String
  order     Order         @relation(fields: [orderId], references: [id])
  openedBy  String
  opener    User          @relation(fields: [openedBy], references: [id])
  reason    String
  status    DisputeStatus @default(OPEN)
  deletedAt DateTime?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model Seal {
  id          String        @id @default(cuid())
  name        String        @unique
  type        String        // PRODUCT | PROFILE
  isAutomatic Boolean       @default(false)
  deletedAt   DateTime?
  createdAt   DateTime      @default(now())

  productSeals  ProductSeal[]
  sealRequests  SealRequest[]
}

model ProductSeal {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  sealId    String
  seal      Seal     @relation(fields: [sealId], references: [id])
  createdAt DateTime @default(now())

  @@unique([productId, sealId])
}

model SealRequest {
  id          String            @id @default(cuid())
  artisanId   String
  artisan     User              @relation(fields: [artisanId], references: [id])
  productId   String?           // null = badge de perfil
  product     Product?          @relation(fields: [productId], references: [id])
  sealId      String
  seal        Seal              @relation(fields: [sealId], references: [id])
  status      SealRequestStatus @default(PENDING)
  justification String?
  rejectReason  String?
  deletedAt   DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  follower    User     @relation("Follower", fields: [followerId], references: [id])
  followingId String
  following   User     @relation("Following", fields: [followingId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
}

model ProcessUpdate {
  id        String   @id @default(cuid())
  artisanId String
  artisan   User     @relation(fields: [artisanId], references: [id])
  content   String
  imageUrl  String?
  deletedAt DateTime?
  createdAt DateTime @default(now())
}

model TransactionLog {
  id          String   @id @default(cuid())
  // SIN deletedAt — retención mínima 5 años por cumplimiento fiscal (NFR12, AR2)
  // Soft-delete BLOQUEADO programáticamente: nunca añadir deletedAt a este modelo
  orderId     String?
  eventType   String
  payload     Json
  createdAt   DateTime @default(now())
}
```

[Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
[Source: _bmad-output/planning-artifacts/epics.md#Epic 0 — ARs: AR2]

### Reglas de estructura (Architecture)

- **NUNCA** modificar archivos en `/components/ui/` — regenerar con `npx shadcn@latest add [component]`
- **NUNCA** importar Prisma client en Client Components
- **NUNCA** importar `src/lib/auth.ts` en `src/middleware.ts` — solo `auth.config.ts`
- Server Components por defecto — `'use client'` solo si imprescindible
- `src/env.js` (no `.ts`) es la convención de T3 — ampliar con todas las vars del proyecto

[Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines]

### Soft-delete: regla crítica para todas las queries futuras

Todas las queries Prisma sobre entidades con `deletedAt` DEBEN incluir `where: { deletedAt: null }`. Esta regla aplica en TODAS las historias posteriores.

```typescript
// CORRECTO — siempre filtrar soft-deleted
const products = await db.product.findMany({
  where: { deletedAt: null, status: 'ACTIVE' }
})

// INCORRECTO — devuelve registros eliminados
const products = await db.product.findMany()
```

[Source: _bmad-output/planning-artifacts/architecture.md#Gap Analysis Results — Soft-delete pattern]

### Cantidades monetarias

Siempre en **céntimos** (enteros) en BD y API — nunca floats. Conversión solo en capa de presentación.

```typescript
// BD: price = 3800 → representa 38,00 €
// Display: (price / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
```

### Variables de entorno (.env.example)

```
# Base de datos (Neon PostgreSQL, región EU Frankfurt)
DATABASE_URL="postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/artelier?sslmode=require"

# Auth.js
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe Connect Express
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="artelier-cloud"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (emails transaccionales)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@artelier.es"

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Vercel Cron (retiro automático de productos perecederos)
CRON_SECRET="generate-secure-random-string"
```

### Componentes shadcn/ui a instalar

```bash
npx shadcn@latest add button input card dialog tabs badge avatar sheet separator sonner
```

El componente `toast` de shadcn ha sido reemplazado por `sonner` en versiones recientes — usar `sonner`.

### Dependencias adicionales para historias próximas

Instalar ahora para evitar conflictos de versiones más adelante:

```bash
npm install next-intl zustand react-hook-form @hookform/resolvers zod
```

Stripe, Cloudinary, Resend y Upstash se instalan en Historia 0.4.

### Archivos que T3 genera y NO tocar

- `src/env.js` — ampliar (no reemplazar) con las nuevas variables
- `src/app/api/auth/[...nextauth]/route.ts` — no modificar
- Modelos Auth.js en `prisma/schema.prisma` (Account, Session, VerificationToken) — mantener y extender

### Project Structure Notes

Los route groups de App Router usan paréntesis `(auth)`, `(buyer)`, `(artisan)`, `(shared)` — no afectan a las URLs pero agrupan layouts. En esta historia solo se necesita crear la estructura base de directorios; las pages concretas se crean en historias posteriores.

El archivo `src/env.js` de T3 usa `@t3-oss/env-nextjs` para validar variables en build time con Zod — si `DATABASE_URL` no está definida, el build falla con mensaje claro.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Historia 0.1 Inicialización del proyecto T3]
- ARs cubiertos: AR1 (T3 init), AR2 (Prisma schema), AR4 (auth.config.ts separación)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
