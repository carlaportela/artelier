# Story 3.2: Feed personalizado con paginación "Cargar más"

Status: done

## Story

Como compradora registrada,
quiero un feed cronológico de productos de las artesanas que sigo con paginación por cursor,
para descubrir novedades sin perder items aunque se publiquen nuevos mientras navego.

## Acceptance Criteria

**AC1 — Feed personalizado cargado en servidor (SSR inicial)**
- **Dado** que soy compradora autenticada y accedo a `/feed`
- **Cuando** la página carga
- **Entonces** veo los 20 productos más recientes de las artesanas que sigo, en orden cronológico inverso (más nuevos primero)
- **Y** cada producto se muestra con el `ProductCard` existente en `src/components/ProductCard.tsx`
- **Y** la página es SSR (renderizada en servidor, sin spinner de carga inicial)

**AC2 — Botón "Cargar más" con cursor pagination**
- **Dado** que hay más de 20 productos en mi feed
- **Cuando** llego al final de la lista y pulso "Cargar más"
- **Entonces** se llama a `GET /api/feed?cursor=<lastId>&take=20`
- **Y** los nuevos productos se añaden al feed sin reemplazar los anteriores (append)
- **Y** si `hasMore: false`, el botón desaparece

**AC3 — Sin duplicados aunque se publiquen productos nuevos**
- **Dado** que una artesana publica un producto nuevo mientras estoy en el feed
- **Cuando** pulso "Cargar más"
- **Entonces** no aparecen productos duplicados ni saltos en el orden (cursor pagination lo garantiza)

**AC4 — Empty state: no sigo a nadie**
- **Dado** que soy compradora registrada pero no sigo a ninguna artesana
- **Cuando** accedo a `/feed`
- **Entonces** veo un empty state con el texto "Todavía no sigues a ninguna artesana" y un CTA "Descubrir artesanas" que lleva a `/` (catálogo público)

**AC5 — Empty state: sigo artesanas pero no tienen productos activos**
- **Dado** que sigo artesanas pero ninguna tiene productos ACTIVE
- **Cuando** accedo a `/feed`
- **Entonces** veo un empty state con el texto "Las artesanas que sigues aún no tienen productos publicados"

**AC6 — Solo accesible para compradoras autenticadas**
- **Dado** que accedo a `/feed` sin sesión o siendo artesana
- **Entonces** soy redirigida a `/` (el middleware ya lo gestiona para no autenticadas; añadir redirect para artesanas)

## Decisión de diseño: Botón "Cargar más" vs Scroll infinito automático

El épico original especificaba `IntersectionObserver` (scroll automático). Se cambia a **botón "Cargar más"** por decisión consciente de producto:
- Más ético: la usuaria tiene control sobre cuánto consume
- Más afín a la visión de Artelier (slow commerce, no engagement adictivo)
- Referencia: Etsy usa este mismo patrón
- El comportamiento sin duplicados y la cursor pagination son idénticos en ambas implementaciones

## Tasks / Subtasks

- [ ] T1 — Crear endpoint `GET /api/feed` con cursor pagination (AC2, AC3)
  - [ ] T1.1: Crear `src/app/api/feed/route.ts` como Route Handler
  - [ ] T1.2: Validar sesión con `getServerSession()` — retornar 401 si no autenticada o no BUYER
  - [ ] T1.3: Leer `cursor` y `take` de los query params (`take` max 20, default 20)
  - [ ] T1.4: Query Prisma: productos ACTIVE, deletedAt null, de artesanas que la compradora sigue, ordenados por `createdAt desc`
  - [ ] T1.5: Implementar lógica `take + 1` para detectar `hasMore` y calcular `nextCursor`
  - [ ] T1.6: Retornar `{ data: { items, nextCursor, hasMore } }` siguiendo el patrón de respuesta del proyecto

- [ ] T2 — Implementar página `/feed` con SSR inicial y estado cliente (AC1, AC4, AC5, AC6)
  - [ ] T2.1: Convertir `src/app/(buyer)/feed/page.tsx` de placeholder a Server Component real
  - [ ] T2.2: Fetch inicial SSR de los primeros 20 productos (misma lógica que T1 pero directamente con Prisma, sin pasar por la API)
  - [ ] T2.3: Redirect si `session.user.role === "ARTISAN"` → `/studio/products`
  - [ ] T2.4: Render condicional: empty state "no sigues a nadie" / empty state "sin productos" / grid con productos
  - [ ] T2.5: Pasar `initialProducts`, `initialNextCursor`, `initialHasMore` como props a un Client Component `FeedClient`

- [ ] T3 — Crear `FeedClient` con botón "Cargar más" (AC2)
  - [ ] T3.1: Crear `src/app/(buyer)/feed/FeedClient.tsx` como Client Component (`"use client"`)
  - [ ] T3.2: Estado: `products` (inicializado con `initialProducts`), `nextCursor`, `hasMore`, `isLoading`
  - [ ] T3.3: Función `loadMore`: llama a `GET /api/feed?cursor=<nextCursor>&take=20`, hace append de los nuevos productos al estado
  - [ ] T3.4: Render: grid de `ProductCard` + botón "Cargar más" (visible solo si `hasMore`) + spinner durante carga

- [ ] T4 — Grid y estilos (AC1)
  - [ ] T4.1: Usar el mismo grid responsive que la home pública: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
  - [ ] T4.2: Botón "Cargar más" centrado bajo el grid, estilo secundario (borde verde, fondo transparente)
  - [ ] T4.3: Empty states con icono y CTA apropiado

## Dev Notes

### Estructura de archivos a crear/modificar

```
src/app/api/feed/route.ts          ← NUEVO: endpoint de paginación
src/app/(buyer)/feed/page.tsx      ← MODIFICAR: de placeholder a página real (SSR)
src/app/(buyer)/feed/FeedClient.tsx ← NUEVO: Client Component con botón cargar más
```

### Patrón de cursor pagination (arquitectura oficial del proyecto)

```typescript
// En route.ts y en el fetch SSR de page.tsx:
const take = 20;
const products = await db.product.findMany({
  take: take + 1,           // pedimos 1 más para saber si hay siguiente página
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,    // con cursor: saltar el cursor mismo
  orderBy: { createdAt: "desc" },
  where: {
    deletedAt: null,
    status: "ACTIVE",
    artisan: {
      followers: {
        some: { followerId: session.user.id }  // solo de artesanas que sigo
      }
    }
  },
  select: {
    id: true,
    name: true,
    priceInCents: true,
    status: true,
    imageUrls: true,
    expiresAt: true,
    artisan: { select: { name: true, image: true } }
  }
});

const hasMore = products.length > take;
const items = hasMore ? products.slice(0, take) : products;
const nextCursor = hasMore ? items[items.length - 1]?.id : null;

return NextResponse.json({ data: { items, nextCursor, hasMore } });
```

**Por qué `take + 1`:** Si pedimos 21 y nos devuelven 21, hay más. Si nos devuelven 20 o menos, ya no hay. Entonces cortamos a 20 para mostrar. Es el truco estándar de cursor pagination.

**Por qué `skip: cursor ? 1 : 0`:** El cursor apunta al último item ya mostrado. Con `skip: 1` lo saltamos y empezamos desde el siguiente.

### Patrón de respuesta de la API (definido en arquitectura)

```typescript
// Éxito con paginación:
return NextResponse.json({ data: { items, nextCursor, hasMore } })

// Error 401:
return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 })
```

### Feed SSR inicial en page.tsx — fetch directo con Prisma (no pasar por la API)

El SSR inicial no debe llamar a `/api/feed` desde el servidor — eso añade latencia innecesaria (HTTP interno). En lugar de eso, la page.tsx llama directamente a Prisma con la misma query. La API solo la usan las llamadas cliente (el botón "Cargar más").

### ProductCard existente — reutilizar sin modificar

El componente `src/components/ProductCard.tsx` ya existe y funciona. NO crearlo de nuevo. Acepta esta prop:

```typescript
{
  product: {
    id: string;
    name: string;
    priceInCents: number;
    status: "ACTIVE" | "SOLD" | "EXPIRED";
    imageUrls: string[];
    expiresAt: Date | null;
    artisan: { name: string | null; image: string | null };
  }
}
```

### Buyer layout — ya tiene AppHeader y AppFooter

`src/app/(buyer)/layout.tsx` ya envuelve con `AppHeader` y `AppFooter`. La feed page NO debe añadirlos de nuevo.

### Autenticación: getServerSession()

```typescript
import { getServerSession } from "~/server/auth/session";
const session = await getServerSession();
// session?.user.id, session?.user.role
```

### Relación Follow en Prisma

```prisma
model Follow {
  followerId  String
  followingId String   // ID de la artesana seguida
  follower    User @relation("Follower", ...)
  following   User @relation("Following", ...)
}
```

Para filtrar productos de artesanas seguidas por la compradora:
```typescript
where: {
  artisan: {
    followers: {
      some: { followerId: userId }
    }
  }
}
```

### Colores y estilos del botón "Cargar más"

Color final decidido: verde menta (`#3d5a4f` al 55% de opacidad) — mismo color que la tercera banderilla del logo, da cohesión visual con el header.
```tsx
className="cursor-pointer rounded-full bg-[#3d5a4f]/55 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d5a4f]/40 disabled:cursor-not-allowed disabled:opacity-50"
```

### Lo que NO hace H3.2 (no implementar)

- Scroll infinito automático (IntersectionObserver) — decisión de producto, se usa botón
- Filtros y búsqueda — H3.3
- Notificaciones de nuevos productos de artesanas seguidas — Épico 6
- Skeleton loaders — puede ser un spinner simple en el botón durante la carga

### Aprendizajes de H3.1 relevantes

- `export const dynamic = "force-dynamic"` ya está en `(buyer)/layout.tsx` — no añadirlo en la page
- El buyer layout ya tiene `max-w-lg md:max-w-2xl lg:max-w-4xl` — usar dentro de `<main>` con `px-4 py-8`
- Los Route Handlers en Next.js 15 usan `import { NextResponse } from "next/server"` y `export async function GET(req: Request)`
- Validar siempre `deletedAt: null` en queries de productos

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- T1: `src/app/api/feed/route.ts` creado — endpoint GET con cursor pagination, validación de sesión y rol BUYER, query Prisma filtrando por artesanas seguidas.
- T2: `src/app/(buyer)/feed/page.tsx` implementado — SSR inicial con Prisma directo, dos empty states (sin seguidos / sin productos), redirect para artesanas. Título "¿Qué es lo último?" en GND con subtítulo. Eliminado `src/app/feed/page.tsx` (placeholder en conflicto).
- T3: `src/app/(buyer)/feed/FeedClient.tsx` creado — Client Component con useState, botón "Cargar más" en verde menta, append de productos sin reemplazar los anteriores.
- Decisión de producto: botón "Cargar más" en lugar de scroll infinito automático (más ético, más afín a la visión de Artelier).
- Decisión de UI: botón color `#3d5a4f/55` (verde menta) por coherencia visual con banderillas del logo.
- Idea anotada para V2: feed híbrido con recomendaciones basadas en preferencias de la compradora.

### File List

**Nuevos:**
- `src/app/api/feed/route.ts`
- `src/app/(buyer)/feed/FeedClient.tsx`

**Actualizados:**
- `src/app/(buyer)/feed/page.tsx`

**Eliminados:**
- `src/app/feed/page.tsx` (placeholder en conflicto con la nueva ruta)

### Review Findings

#### Decision Needed
- [x] [Review][Decision] D1 — AC4: CTA del empty state apunta a `/search` en lugar de `/` — decisión de producto confirmada, `/search` se implementará en H3.3
- [x] [Review][Decision] D2 — AC5: texto "Las artesanas y artesanos..." en lugar de "Las artesanas..." — cambio inclusivo confirmado

#### Patches
- [x] [Review][Patch] P1 — `loadMore` no comprueba `res.ok` antes de parsear — crash silencioso en errores HTTP. Fix: `if (!res.ok) throw new Error(...)` [FeedClient.tsx]
- [x] [Review][Patch] P2 — `expiresAt` tipado como `Date` pero llega como `string` tras JSON. Fix: conversión `new Date(item.expiresAt as unknown as string)` [FeedClient.tsx]
- [x] [Review][Patch] P3 — `followCount` consultado después de productos — ineficiente. Fix: mover `followCount` antes de la query de productos [page.tsx]
- [x] [Review][Patch] P4 — Sin try/catch en query Prisma del endpoint para cursor inválido. Fix: envolver en try/catch con 400 [route.ts]

#### Deferred
- [x] [Review][Defer] W1 — API devuelve 401 para artesanas (debería ser 403) — patrón de toda la app, diferido
- [x] [Review][Defer] W2 — Sin aria-live en estado de carga — accesibilidad, polish futuro
- [x] [Review][Defer] W3 — Race condition teórica en doble click — prevenida por disabled={isLoading}
- [x] [Review][Defer] W4 — Cursor sin validación de ownership — Prisma usa queries parametrizadas, riesgo bajo

### Change Log

- 2026-06-04: Historia creada. Decisión de producto: botón "Cargar más" en lugar de scroll infinito automático.
- 2026-06-05: Implementación completa — T1, T2, T3 completados. Build ok. Status → done.
- 2026-06-05: Code review — 2 decisions confirmadas, 4 patches aplicados, 4 diferidos. Build ok.
