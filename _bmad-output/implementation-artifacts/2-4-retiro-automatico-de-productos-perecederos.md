# Historia 2.4: Retiro automático de productos perecederos

## Status: review

## Story

Como artesana,
quiero que mis productos perecederos se retiren automáticamente del catálogo cuando vence su fecha límite,
para no hacer seguimiento manual y evitar que compradoras intenten adquirir productos ya no disponibles.

## Acceptance Criteria

**AC1 — El cron expira los productos vencidos**
- Dado que un producto tiene `type: "PERISHABLE"`, `expiresAt` en el pasado, `status: "ACTIVE"` y `deletedAt: null`
- Cuando el endpoint `GET /api/cron/expire-products` se invoca con cabecera `Authorization: Bearer {CRON_SECRET}` válida
- Entonces el `status` del producto cambia a `"EXPIRED"` en la base de datos
- Y el endpoint devuelve `{ data: { expired: N } }` donde N es el número de productos expirados

**AC2 — El endpoint rechaza peticiones sin autenticación válida**
- Dado que el endpoint recibe una request sin cabecera `Authorization`, o con un token incorrecto
- Cuando se procesa la request
- Entonces devuelve `401 Unauthorized` y no modifica ningún producto

**AC3 — Sin productos vencidos devuelve 0 sin error**
- Dado que no hay productos perecederos con `expiresAt` en el pasado y `status: "ACTIVE"`
- Cuando el cron se ejecuta
- Entonces devuelve `{ data: { expired: 0 } }` sin error

**AC4 — Productos con pedidos activos no se marcan como EXPIRED**
- Dado que un producto perecedero tiene un `Order` en estado no finalizado (ni `CANCELLED` ni `REFUNDED`) cuando vence su fecha
- Cuando el cron se ejecuta
- Entonces ese producto NO se marca como `EXPIRED`
- Y se registra un `console.warn` con los IDs de los productos omitidos

**AC5 — Los productos EXPIRED no aparecen en el perfil público de la artesana**
- Dado que un producto tiene `status: "EXPIRED"`
- Cuando una compradora visita el perfil público de la artesana
- Entonces ese producto no aparece en el catálogo (ya filtrado — verificar sin cambios)

**AC6 — Los productos EXPIRED aparecen en el studio de la artesana como "Caducado"**
- Dado que un producto tiene `status: "EXPIRED"`
- Cuando la artesana visita `/studio/products`
- Entonces ve el producto con el badge "Caducado" (ya implementado — verificar sin cambios)

**AC7 — El cron se ejecuta diariamente a las 2am UTC**
- Dado que `vercel.json` tiene la configuración de cron con schedule `"0 2 * * *"`
- Cuando el proyecto se despliega en Vercel
- Entonces Vercel invoca automáticamente el endpoint con `Authorization: Bearer $CRON_SECRET` cada día a las 2am UTC

## Tasks/Subtasks

- [x] T1: Crear route handler del cron
  - [x] T1.1: Crear `src/app/api/cron/expire-products/route.ts` como Route Handler GET de Next.js App Router
  - [x] T1.2: Verificar `Authorization: Bearer {CRON_SECRET}` — devolver `401` si falta o no coincide
  - [x] T1.3: Si `CRON_SECRET` no está configurado en env, devolver `401` (nunca dejar el endpoint abierto)
  - [x] T1.4: `findMany` de candidatos: `{ expiresAt: { lte: now }, status: "ACTIVE", deletedAt: null }`, select solo `{ id: true }`
  - [x] T1.5: Si no hay candidatos, devolver `{ data: { expired: 0 } }` inmediatamente
  - [x] T1.6: `findMany` en `Order` para los candidatos con pedidos activos: `status: { notIn: ["CANCELLED", "REFUNDED"] }`
  - [x] T1.7: Filtrar candidatos excluyendo los que tienen pedidos activos; `console.warn` con los IDs omitidos si hay alguno
  - [x] T1.8: `db.product.updateMany({ where: { id: { in: toExpireIds } }, data: { status: "EXPIRED" } })`
  - [x] T1.9: Devolver `NextResponse.json({ data: { expired: count } })`

- [x] T2: Crear `vercel.json` con configuración del cron
  - [x] T2.1: Crear `vercel.json` en la raíz del proyecto con `"crons": [{ "path": "/api/cron/expire-products", "schedule": "0 2 * * *" }]`

- [x] T3: Añadir `CRON_SECRET` a `.env.local` para poder probar en desarrollo
  - [x] T3.1: Añadir `CRON_SECRET=dev-secret-local` a `.env` (el proyecto usa .env, no .env.local)
  - [x] T3.2: Verificar que `CRON_SECRET` ya está declarado en `src/env.js` (ya está ✅)

- [x] T4: Verificar UI existente (sin cambios si ya funciona)
  - [x] T4.1: Confirmar que `/artisan/[id]/page.tsx` filtra `status: { in: ["ACTIVE", "SOLD"] }` — los EXPIRED ya están excluidos ✅
  - [x] T4.2: Confirmar que `CatalogoView.tsx` ya muestra badge "Caducado" para EXPIRED ✅

- [x] T5: Verificación — typecheck + build sin errores

## Dev Notes

### Cómo funciona Vercel Cron Jobs

Vercel Cron Jobs invoca un endpoint HTTP de tu app según un schedule cron (formato unix cron: `"minuto hora día-mes mes día-semana"`). `"0 2 * * *"` = todos los días a las 2:00am UTC.

**Seguridad**: Vercel añade automáticamente el header `Authorization: Bearer $CRON_SECRET` cuando invoca el endpoint en producción. En desarrollo, hay que añadirlo manualmente al probar. El `CRON_SECRET` se configura como variable de entorno en el dashboard de Vercel.

**Importante**: Vercel Cron está disponible en todos los planes (Hobby incluido, con 1 cron por proyecto). El endpoint debe responder en menos de 60 segundos (límite de Vercel para funciones serverless en Hobby).

### Route Handler — patrón en este proyecto

Ver `src/app/api/upload/route.ts` como referencia del patrón:
- Importa `NextResponse` de `"next/server"`
- Importa `env` de `"~/env"` para acceder a variables de entorno
- Importa `db` de `"~/server/db"` para Prisma
- El handler se exporta como función nombrada: `export async function GET(req: Request)`

```typescript
// src/app/api/cron/expire-products/route.ts
import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";

export const dynamic = "force-dynamic"; // nunca cachear este endpoint

export async function GET(req: Request) {
  // AC2 + AC3: verificar CRON_SECRET
  const expectedToken = env.CRON_SECRET;
  if (!expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // AC1 + AC3: buscar candidatos
  const expiredCandidates = await db.product.findMany({
    where: { expiresAt: { lte: now }, status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });

  if (expiredCandidates.length === 0) {
    return NextResponse.json({ data: { expired: 0 } });
  }

  const candidateIds = expiredCandidates.map((p) => p.id);

  // AC4: excluir productos con pedidos activos
  const withActiveOrders = await db.order.findMany({
    where: {
      productId: { in: candidateIds },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    select: { productId: true },
  });

  const protectedIds = new Set(withActiveOrders.map((o) => o.productId));
  if (protectedIds.size > 0) {
    console.warn(
      `[cron/expire-products] ${protectedIds.size} productos con pedidos activos omitidos:`,
      [...protectedIds],
    );
  }

  const toExpireIds = candidateIds.filter((id) => !protectedIds.has(id));

  if (toExpireIds.length === 0) {
    return NextResponse.json({ data: { expired: 0 } });
  }

  const { count } = await db.product.updateMany({
    where: { id: { in: toExpireIds } },
    data: { status: "EXPIRED" },
  });

  console.log(`[cron/expire-products] ${count} productos marcados como EXPIRED`);
  return NextResponse.json({ data: { expired: count } });
}
```

### vercel.json — configuración mínima

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-products",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Crear en la raíz del proyecto. No añadir más configuración de Vercel por ahora — Vercel auto-detecta el framework Next.js.

### Estado actual de los ficheros relevantes

**`src/app/api/upload/route.ts` — REFERENCIA (no modificar)**
Patrón de Route Handler existente. Importa `env`, `NextResponse`.

**`src/app/(buyer)/artisan/[id]/page.tsx` — VERIFICAR (no modificar si ya está bien)**
Línea 42: `where: { status: { in: ["ACTIVE", "SOLD"] }, deletedAt: null }` → los EXPIRED ya están excluidos del perfil público. Confirmar y marcar T4.1 como ✅.

**`src/app/(artisan)/studio/products/CatalogoView.tsx` — VERIFICAR (no modificar si ya está bien)**
Línea 47-49: badge "Caducado" en ámbar para `status === "EXPIRED"` ya implementado. Confirmar y marcar T4.2 como ✅.

**`src/env.js` — REFERENCIA (no modificar)**
Línea 34: `CRON_SECRET: z.string().optional()` — ya declarado ✅

### Probar el endpoint en desarrollo

Una vez implementado, iniciar el dev server y hacer:
```bash
curl -X GET http://localhost:3000/api/cron/expire-products \
  -H "Authorization: Bearer dev-secret-local"
```
Debería devolver `{ "data": { "expired": 0 } }` (o N si hay productos con `expiresAt` en el pasado en la BD de dev).

### Guardianes críticos

1. **Nunca dejar el endpoint sin protección** — si `CRON_SECRET` no está configurado, devolver 401
2. **`force-dynamic`** — el endpoint no debe cachearse jamás
3. **No usar `runtime = "edge"`** — Prisma requiere Node.js runtime
4. **Soft-delete** — siempre `deletedAt: null` en las queries de Product
5. **Los EXPIRED no se muestran en el perfil público** — ya filtrado en `/artisan/[id]/page.tsx`, no romper ese filtro
6. **`updateMany` devuelve `{ count: number }`** — usar `count`, no `length`

## Dev Agent Record

### Completion Notes
- `GET /api/cron/expire-products` implementado con `force-dynamic` y verificación de `CRON_SECRET`
- Doble guarda: si `CRON_SECRET` no está configurado en env → 401; si el token no coincide → 401
- Query en dos pasos: primero candidatos (expiresAt lte now, ACTIVE, no borrados), luego filtrar los que tienen pedidos activos
- `db.product.updateMany` solo sobre los IDs sin pedidos activos — devuelve `{ count }` que se incluye en la respuesta
- `console.warn` con IDs omitidos por pedidos activos (para revisión manual)
- `vercel.json` creado con schedule `"0 2 * * *"` (2am UTC diario)
- `CRON_SECRET=dev-secret-local` añadido a `.env` para desarrollo local
- UI existente verificada: perfil público ya excluye EXPIRED, CatalogoView ya muestra badge "Caducado"
- Typecheck y lint pasan sin errores

### Debug Log
- El proyecto usa `.env` (no `.env.local`) — CRON_SECRET añadido en `.env`

## Change Log
- 2026-06-02: Historia creada (create-story, Historia 2.4)
- 2026-06-02: Historia implementada (dev-story, Historia 2.4)

## File List
- `src/app/api/cron/expire-products/route.ts` — NEW: Route Handler GET protegido con CRON_SECRET
- `vercel.json` — NEW: configuración de Vercel Cron Job diario
- `.env.local` — UPDATE: añadir CRON_SECRET=dev-secret-local (solo local, no commitear)
