---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/ux-design-specification.md']
workflowType: 'architecture'
project_name: 'artelier'
user_name: 'Maldita'
date: '2026-05-12'
---

# Architecture Decision Document

_Este documento se construye de forma colaborativa a través del proceso paso a paso. Las secciones se añaden secuencialmente conforme avanzamos en cada decisión arquitectónica juntas._

---

## Project Context Analysis

### Requirements Overview

**Requisitos Funcionales (50 FRs organizados en 10 dominios):**

- **Gestión de usuarios (FR1–FR7):** Registro con dos tipos de perfil, autenticación, recuperación de contraseña, derechos RGPD (eliminación, exportación, cookies)
- **Perfil artesano (FR8–FR11):** Perfil público editable, pestaña de contenidos (proceso), solicitud de sellos, estadísticas básicas
- **Perfil comprador (FR12–FR14):** Perfil privado, seguir artesanos, historial de compras
- **Catálogo y productos (FR15–FR20):** 3 tipos de producto (único, perecedero con fecha, personalizado); stock auto-agota al comprar; retiro automático de perecederos
- **Descubrimiento y búsqueda (FR21–FR25):** Páginas públicas indexables por SEO, feed cronológico, filtros por localidad/categoría/sello
- **Mensajería (FR26–FR29):** Chat privado artesano↔comprador con polling 5-10s, adjuntos de imagen, historial completo
- **Pagos y transacciones (FR30–FR37):** Stripe Connect Express, desglose de costes visible, cancelación 24h, 3 métodos de envío, penalización automática por incumplimiento
- **Notificaciones (FR38–FR40):** Email transaccional para ventas, mensajes, seguidores, nuevos productos, confirmación de pedido (LSSI)
- **Disputas y confianza (FR41–FR44):** Flujo de estados con evidencias, rol árbitro admin, política diferenciada por tipo de producto
- **Administración (FR45–FR50):** Panel de gestión de sellos, disputas, moderación, métricas básicas, estados de pedido visibles al comprador

**Requisitos No Funcionales críticos:**

- **Rendimiento:** LCP < 2.5s en 3G, checkout < 5s, polling mensajes < 10s latencia, CLS < 0.1
- **Seguridad:** HTTPS/TLS 1.2+, bcrypt coste 12, sin almacenamiento de datos de tarjeta, datos en servidores UE, sesiones 30 días, 2FA para admin
- **Escalabilidad:** 100→10.000 usuarios sin cambio estructural; 10x tráfico en eventos de 48h sin interrupción de pagos; 50.000 productos sin degradación de búsqueda
- **Accesibilidad:** WCAG 2.1 AA, teclado-navegable en flujo de compra, contraste 4.5:1
- **Integraciones:** Stripe Connect ≥99.9% tasa de éxito, emails transaccionales < 2 minutos, reintentos automáticos ante fallos de Stripe API
- **Cumplimiento:** RGPD/LOPDGDD, LSSI, PCI-DSS vía Stripe, Directiva EU 2011/83/UE devoluciones, retención de logs de transacciones 5 años

**Scale & Complexity:**

- Primary domain: Marketplace fullstack web-first (SSR/SSG) → V2 mobile Flutter
- Complexity level: Media-Alta (marketplace de dos lados, Stripe Connect, RBAC 3 roles, cumplimiento legal múltiple)
- Subsistemas arquitectónicos: 10 (Auth/RBAC, Catálogo+Stock, Pagos+Stripe, Mensajería, Email, Sellos, Disputas, Descubrimiento, Admin, Cumplimiento Legal)

### Technical Constraints & Dependencies

- **Frontend decidido:** Next.js (SSR/SSG) + Tailwind CSS + shadcn/ui + componentes custom
- **Pagos:** Stripe Connect Express (KYC delegado, distribución automática de comisiones)
- **Mensajería MVP:** Polling → la API debe estar diseñada para migración transparente a WebSockets en V2
- **Mobile V2:** Flutter sobre la misma API REST — API agnóstica del cliente desde el inicio
- **Infraestructura:** Servidores UE obligatorio (RGPD NFR9)
- **Desarrollo:** Equipo de 1 desarrolladora fullstack, proyecto personal autofinanciado — complejidad máxima justificada solo por requisito real

### Cross-Cutting Concerns Identified

1. **Autenticación y autorización (RBAC)** — 3 roles con permisos distintos en todos los endpoints
2. **Seguridad** — HTTPS, sanitización de inputs, protección CSRF, bcrypt, 2FA admin
3. **Observabilidad y logging** — logs de transacciones con retención 5 años, errores de pago
4. **RGPD** — soft-delete con anonimización, exportación de datos, consentimiento de cookies, datos en UE
5. **SEO** — SSR en páginas públicas, meta tags, Open Graph, URLs canónicas, sitemap
6. **Performance** — Core Web Vitals, optimización de imágenes, caché de páginas SSG
7. **Escalabilidad** — arquitectura stateless, infraestructura elástica para picos de eventos de 48h

---

## Starter Template Evaluation

### Primary Technology Domain

Marketplace fullstack web-first (SSR/SSG) con API REST — Next.js como framework único para frontend y backend en el MVP. Flutter consumirá la misma API REST en V2.

### Starter Options Considered

| Starter | Incluye | Decisión |
|---|---|---|
| **create-next-app** (v16.2.6) | Next.js + TS + Tailwind + App Router | Descartado — nada de auth ni ORM, demasiado setup manual para 10 subsistemas |
| **T3 Stack** (create-t3-app) | Next.js + TS + Tailwind + Auth.js + Prisma/Drizzle + tRPC opcional | **Seleccionado** — sin tRPC para mantener REST puro |
| **Next.js Boilerplate (ixartz)** | Next.js + TS + Tailwind + Drizzle + tooling | Descartado — sin auth incluida |

### Selected Starter: T3 Stack (sin tRPC)

**Rationale:** T3 sin tRPC proporciona el equilibrio óptimo para Artelier: auth (Auth.js v5) y ORM (Prisma) listos desde el día 1, con Route Handlers REST nativos de Next.js compatibles con Flutter V2 sin cambios de API.

**Initialization Command:**

```bash
npm create t3-app@latest artelier
# Setup interactivo:
#   ✓ TypeScript
#   ✓ Tailwind CSS
#   ✓ Auth.js (NextAuth v5)
#   ✓ Prisma
#   ✗ tRPC  ← deseleccionar

cd artelier
npx shadcn@latest init
# New York style · CSS variables · Zinc base color
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript strict mode · Node.js · Next.js 16 App Router

**Styling Solution:**
Tailwind CSS v4 preconfigurado · shadcn/ui añadido post-init

**Build Tooling:**
Turbopack (dev) · Next.js build (prod) · ESLint + Prettier · variables de entorno tipadas con `@t3-oss/env-nextjs`

**Testing Framework:**
No incluido en T3 — se añadirá Vitest + Testing Library en historia de setup

**Code Organization:**
App Router con estructura `/app` · Server Components por defecto · Route Handlers en `/app/api/` para REST · separación clara server/client components

**Development Experience:**
Hot reloading con Turbopack · Prisma Studio para inspección de BD · TypeScript strict para detectar errores en tiempo de compilación

**Note:** La inicialización del proyecto con este comando debe ser la primera historia de implementación.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Decisiones críticas (bloquean implementación):**
- Base de datos: PostgreSQL en Neon (región EU)
- Autenticación: Auth.js v5 con credential provider (email/password) + database sessions
- RBAC: campo `role` en modelo User + middleware de autorización
- File storage: Cloudinary (optimización automática de imágenes)
- Email transaccional: Resend + react-email
- Pagos: Stripe Connect Express con webhooks idempotentes

**Decisiones importantes (dan forma a la arquitectura):**
- Validación: Zod compartido frontend/backend
- Rate limiting: Upstash Redis (@upstash/ratelimit)
- 2FA admin: TOTP con otplib + qrcode
- Estado cliente: Zustand (solo UI state)
- Formularios: React Hook Form + Zod resolvers
- Mensajería: Polling + Page Visibility API (migrable a WebSockets en V2)
- i18n: next-intl instrumentado desde inicio (ES en V1, preparado para GL)

**Decisiones diferidas (post-MVP):**
- WebSockets para mensajería en tiempo real (V2)
- Redis caché para queries frecuentes (cuando haya métricas reales)
- CDN adicional para assets estáticos (V2+)
- OpenTelemetry para observabilidad avanzada (V2+)

### Data Architecture

**Base de datos:** PostgreSQL · Proveedor: Neon (serverless, región EU Frankfurt) · ORM: Prisma (incluido en T3) · Migraciones: `prisma migrate deploy` en CI/CD

**File storage:** Cloudinary · Imágenes de productos, perfiles, mensajes y evidencias de disputas · Transformación automática (resize, WebP, optimización) · next/image + Cloudinary loader para cumplir LCP < 2.5s en 3G

**Validación:** Zod · Schemas definidos una vez, compartidos entre Route Handlers y formularios React · Errores de validación con mensajes en castellano

**Retención de datos:** Soft-delete estándar para la mayoría de entidades · Tabla `TransactionLog` con retención forzada mínima 5 años (cumplimiento fiscal) · soft-delete bloqueado programáticamente para registros de transacción

### Authentication & Security

**Auth provider:** Email/password (Auth.js credential provider) · Sin OAuth social en MVP · Flujo de recuperación de contraseña via Resend

**Sesiones:** Database sessions (tabla `Session` en Prisma) · Expiración: 30 días de inactividad · Revocación inmediata posible desde admin

**RBAC:** Enum `role: 'artisan' | 'buyer' | 'admin'` en modelo `User` · Middleware de Next.js valida rol en Route Handlers protegidos · Sin librería de RBAC externa

**2FA admin:** TOTP (otplib) + QR code (qrcode) · Obligatorio para `role: 'admin'` · Flag `twoFactorVerified` en sesión verificado por middleware del panel admin

**Seguridad adicional:** CSRF tokens vía Auth.js built-in · Rate limiting en endpoints de auth, mensajes y checkout con @upstash/ratelimit · Sanitización de inputs con Zod en todos los endpoints · HTTPS/TLS obligatorio (Vercel lo aplica por defecto)

### API & Communication Patterns

**Diseño de API:** REST via Next.js App Router Route Handlers · URLs en `/app/api/` · Formato de respuesta estandarizado: `{ data } | { error: { code, message, field? } }` · Códigos HTTP semánticos · Compatible con Flutter V2 sin cambios

**Email transaccional:** Resend + react-email · Templates como componentes React · Eventos cubiertos: confirmación de pedido, nueva venta, nuevo mensaje (cuando inactivo), nuevo seguidor, nuevo producto de artesano seguido, recuperación de contraseña

**Mensajería:** Polling `GET /api/messages/[conversationId]?since=timestamp` cada 5-10s · Page Visibility API pausa el polling en pestaña inactiva · Endpoint diseñado para migración transparente a WebSockets en V2

**Webhooks Stripe:** `POST /api/webhooks/stripe` · Verificación de firma con `stripe.webhooks.constructEvent` · Idempotencia via campo `stripeEventId` en BD · Reintentos automáticos con exponential backoff ante fallos temporales

**Rate limiting:** @upstash/ratelimit + Upstash Redis (free tier) · Endpoints protegidos: `/api/auth/*`, `/api/messages/*`, `/api/checkout/*`, `/api/disputes/*`

### Frontend Architecture

**Rendering:** Server Components por defecto · Client Components solo cuando se necesita interactividad (formularios, polling, estado de UI) · SSR para páginas públicas (perfiles, catálogo) · SSG para páginas estáticas (marketing, legales)

**Estado cliente:** Zustand (UI state: modales abiertos, pasos de formulario multi-etapa, estado de mensajería) · Sin React Query — Server Components + `revalidatePath`/`revalidateTag` gestionan el estado de servidor

**Formularios:** React Hook Form + Zod resolvers · Validación inline al salir del campo · Mensajes de error en castellano · Schemas compartidos con validación de API

**Imágenes:** next/image + Cloudinary loader · Lazy loading automático · aspect-ratio fijo en ProductCard para prevenir CLS

**Internacionalización:** next-intl instalado desde inicio · Castellano en V1 · Estructura preparada para gallego (GL) en V3 · Sin overhead visible para usuaria en V1

### Infrastructure & Deployment

**Hosting app:** Vercel · Región: EU (Frankfurt) · Plan Hobby para MVP · Preview deployments automáticos por PR · Escala a Plan Pro con usuarios reales

**Base de datos:** Neon PostgreSQL serverless · Región: EU (Frankfurt) · Branching de BD para entornos dev/staging/prod

**CI/CD:** GitHub Actions · Lint + typecheck + tests en cada PR (bloquea merge si falla) · Deploy automático a Vercel en merge a `main`

**Monitorización de errores:** Sentry · Captura errores frontend y backend · Alertas prioritarias en flujos de pago · Free tier 5.000 errores/mes para MVP

**Variables de entorno:** @t3-oss/env-nextjs (incluido en T3) · Validación con Zod en build time · Sin secretos en repositorio · Entornos: `.env.local` (dev), variables en Vercel dashboard (prod)

### Decision Impact Analysis

**Secuencia de implementación recomendada:**
1. Inicialización del proyecto (T3 + shadcn/ui)
2. Schema Prisma + migraciones iniciales
3. Auth (registro, login, roles)
4. Stripe Connect Express (onboarding artesana)
5. Catálogo y productos (los 3 tipos)
6. Checkout y pagos
7. Mensajería (polling)
8. Notificaciones por email (Resend)
9. Sellos verificados (flujo admin)
10. Panel de administración
11. Disputas y devoluciones
12. Descubrimiento y búsqueda

**Dependencias entre decisiones:**
- Neon + Prisma → base de todo el modelo de datos
- Auth.js + RBAC → prerequisito para cualquier endpoint protegido
- Stripe Connect → prerequisito para catálogo (artesana necesita cuenta Stripe antes de publicar)
- Cloudinary → prerequisito para subida de imágenes en productos y perfiles
- Resend → independiente, se puede añadir en paralelo a cualquier flujo

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Base de datos (Prisma schema):**
- Modelos: `PascalCase` singular → `User`, `Product`, `Order`, `Message`
- Campos: `camelCase` → `userId`, `createdAt`, `stripeAccountId`
- Enums: tipo en `PascalCase`, valores en `SCREAMING_SNAKE_CASE` → `enum Role { ARTISAN BUYER ADMIN }`

**Endpoints API:**
- `kebab-case`, plural → `/api/products`, `/api/artisan-profiles`
- Sub-recursos con ID del padre → `/api/products/[productId]/seals`
- Acciones no CRUD como verbos al final → `/api/orders/[orderId]/confirm-shipment`

**Ficheros y directorios:**
- Componentes React: `PascalCase` → `ProductCard.tsx`
- Ficheros de utilidad, hooks, stores: `camelCase` → `useMessages.ts`
- Directorios: `kebab-case` → `product-card/`, `order-status/`
- Route Handlers: `route.ts` en el directorio del endpoint
- Server Actions: `actions.ts` en el directorio del feature

**TypeScript:**
- Variables y funciones: `camelCase` → `getProductById`, `stripeAccountId`
- Tipos e interfaces: `PascalCase` → `ProductWithArtisan`, `CreateOrderInput`
- Schemas Zod: `camelCase` + sufijo `Schema` → `createProductSchema`
- Constantes: `SCREAMING_SNAKE_CASE` → `MAX_IMAGES_PER_PRODUCT`

### Structure Patterns

**Organización feature-first:**

```
/app
  /(auth)/                    ← páginas de autenticación
  /(artisan)/                 ← páginas protegidas artesana
  /(buyer)/                   ← páginas protegidas comprador
  /(admin)/                   ← panel de administración
  /(public)/                  ← perfiles y catálogo (SSR, indexable)
  /api/
    /auth/                    ← Auth.js handlers (no modificar)
    /webhooks/stripe/
    /products/
    /orders/
    /messages/
    /users/
    /seals/
    /disputes/
  layout.tsx
  page.tsx

/components
  /ui/                        ← shadcn/ui (NO modificar)
  /shared/                    ← componentes reutilizables
  /[feature]/                 ← componentes del feature

/lib
  /db/                        ← Prisma client singleton
  /auth/                      ← Auth.js config
  /stripe/                    ← Stripe client y utilidades
  /cloudinary/                ← upload helpers
  /resend/                    ← templates y función de envío
  /validations/               ← todos los schemas Zod
  /utils/                     ← funciones puras sin side effects

/hooks/                       ← React hooks de cliente únicamente
/store/                       ← Zustand stores
/types/                       ← TypeScript types globales
/prisma
  schema.prisma
  /migrations/
```

**Server vs Client Components:**
- Default: Server Component — sin `'use client'` salvo que sea imprescindible
- `'use client'` solo para: formularios React Hook Form, polling, Zustand, event handlers
- Nunca importar Prisma o Auth.js session desde un Client Component

**Tests:** co-locados junto al fichero que testean → `ProductCard.test.tsx` junto a `ProductCard.tsx`

### Format Patterns

**Respuestas de éxito:**
```typescript
return NextResponse.json({ data: product }, { status: 200 })
return NextResponse.json({ data: products, pagination: { page, pageSize, total, hasMore } })
return NextResponse.json({ success: true }, { status: 200 })
```

**Respuestas de error:**
```typescript
return NextResponse.json({
  error: { code: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' }
}, { status: 404 })

return NextResponse.json({
  error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', fields: zodError.flatten() }
}, { status: 422 })
```

**Códigos HTTP:** `200` GET · `201` creación · `204` delete · `400` request inválido · `401` sin auth · `403` sin permiso · `404` no encontrado · `409` conflicto · `422` validación · `500` error interno

**Fechas:** siempre ISO 8601 en API → `"2026-05-13T10:30:00.000Z"` · display en UI con `Intl.DateTimeFormat` locale `es-ES`

**Cantidades monetarias:** siempre en céntimos (enteros) en BD y API → `price: 3800` (= 38,00 €) · conversión solo en capa de presentación · nunca floats para dinero

### Communication Patterns

**Autenticación en Route Handler:**
```typescript
const session = await auth()
if (!session?.user) {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' } }, { status: 401 })
}
if (session.user.role !== 'ARTISAN') {
  return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Acceso restringido' } }, { status: 403 })
}
```

**Subida de imágenes:** siempre via `POST /api/upload` (nunca credenciales de Cloudinary en el cliente) · devuelve `{ url, publicId }` · el `publicId` se guarda en BD

### Process Patterns

**Error handling en Route Handlers:**
```typescript
try {
  // lógica
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', fields: error.flatten() } }, { status: 422 })
  }
  console.error('[API Error]', error) // → Sentry en producción
  return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } }, { status: 500 })
}
```

**Errores Prisma:** `P2002` → 409 conflict · `P2025` → 404 not found · nunca exponer error Prisma raw al cliente

**Loading states:** Server Components → `loading.tsx` con `<Skeleton>` · Client Components con Server Actions → `useTransition()` + `isPending`

### Enforcement Guidelines

**Todos los agentes DEBEN:**
- Validar inputs con Zod antes de cualquier operación de BD
- Verificar auth y rol al inicio de cada Route Handler protegido
- Usar cantidades monetarias en céntimos (enteros)
- Devolver errores en formato `{ error: { code, message } }`
- Usar `'use client'` solo cuando sea imprescindible
- Nombrar modelos Prisma en PascalCase singular

**Nunca:**
- Modificar ficheros en `/components/ui/` (shadcn/ui)
- Almacenar datos de tarjeta de pago
- Exponer errores de Prisma o stack traces al cliente
- Usar floats para cantidades monetarias
- Importar Prisma client en Client Components
- Hardcodear URLs, claves de API o credenciales
