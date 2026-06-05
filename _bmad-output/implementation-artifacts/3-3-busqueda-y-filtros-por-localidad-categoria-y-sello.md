# Story 3.3: Búsqueda y filtros por localidad, categoría y sello

Status: ready-for-dev

## Story

Como usuaria (visitante o registrada),
quiero buscar productos de artesanas y artesanos por localidad, categoría, sello de verificación o nombre,
para encontrar lo que me interesa sin navegar todo el catálogo.

## Acceptance Criteria

**AC1 — Filtro por localidad**
- **Dado** que accedo a `/search` y selecciono una localidad
- **Cuando** el filtro se aplica
- **Entonces** el feed muestra solo productos de esa localidad
- **Y** el filtro activo es visible con opción de eliminarlo

**AC2 — Filtro por categoría**
- **Dado** que selecciono una categoría
- **Cuando** el filtro se aplica
- **Entonces** solo aparecen productos de esa categoría
- **Y** los filtros de localidad y categoría son combinables entre sí y con el resto

**AC3 — Filtro por sello**
- **Dado** que selecciono un sello verificado (Km 0, Ecológico…)
- **Cuando** el filtro se aplica
- **Entonces** solo aparecen productos que tienen ese sello aprobado

**AC4 — Búsqueda por texto**
- **Dado** que escribo texto en el buscador
- **Cuando** se aplica la búsqueda
- **Entonces** aparecen productos cuyo nombre contiene el texto buscado
- **O** productos de artesanas y artesanos cuyo nombre contiene el texto buscado
- **Y** la búsqueda por texto es combinable con los filtros de localidad, categoría y sello

**AC5 — Paginación con "Cargar más"**
- **Dado** que el resultado tiene más de 20 items
- **Cuando** llego al final de la lista y pulso "Cargar más"
- **Entonces** se carga la siguiente página con cursor pagination
- **Y** los filtros activos se mantienen al cargar más

**AC6 — Empty state sin resultados**
- **Dado** que no hay resultados para los filtros seleccionados
- **Cuando** la búsqueda se completa
- **Entonces** se muestra "No encontramos nada con estos filtros" con CTA para limpiar filtros

**AC7 — Acceso público**
- **Dado** que soy visitante sin cuenta
- **Cuando** accedo a `/search`
- **Entonces** puedo ver y usar los filtros sin necesidad de registrarme

**AC8 — Filtros en URL**
- **Dado** que aplico filtros
- **Cuando** copio la URL y la abro en otra pestaña
- **Entonces** los mismos filtros están activos y se muestran los mismos resultados

## Decisiones de diseño

- **Búsqueda por texto:** busca en nombre de producto Y nombre de artesana. No se busca en descripción (full-text search — diferido a V2).
- **Artesanas como resultado directo:** diferido a H3.5 o V2. H3.3 muestra solo productos (filtrados por nombre de artesana si se escribe en el buscador).
- **Sin filtro de precio** en esta historia.
- **Filtros en URL:** los filtros forman parte de la URL para que sean compartibles e indexables.

## Tasks / Subtasks

- [ ] T0 — Extraer CATEGORIES a fichero compartido
  - [ ] T0.1: Crear `src/lib/categories.ts` con las constantes CATEGORIES y PERISHABLE_CATEGORIES
  - [ ] T0.2: Actualizar `NewProductWizard.tsx` para importar desde `src/lib/categories.ts` en lugar de definirlas inline

- [ ] T1 — Crear endpoint `GET /api/search`
  - [ ] T1.1: Crear `src/app/api/search/route.ts`
  - [ ] T1.2: Leer `q`, `category`, `locality`, `sealId`, `cursor` de searchParams — todos opcionales
  - [ ] T1.3: Sin validación de sesión — endpoint público
  - [ ] T1.4: Query Prisma con filtros opcionales combinables + cursor pagination (take + 1)
  - [ ] T1.5: Retornar `{ data: { items, nextCursor, hasMore } }`
  - [ ] T1.6: try/catch distinguiendo cursor inválido (P2025 → 400) de error genérico (→ 500)

- [ ] T2 — Crear página `/search`
  - [ ] T2.1: Crear `src/app/(buyer)/search/page.tsx` como Server Component
  - [ ] T2.2: Leer `q`, `category`, `locality`, `sealId` de la prop `searchParams`
  - [ ] T2.3: Fetch en paralelo (Promise.all): localities distintas, seals disponibles, primera página de productos
  - [ ] T2.4: Pasar `initialProducts`, `initialNextCursor`, `initialHasMore`, `localities`, `seals` y filtros activos a SearchClient

- [ ] T3 — Crear SearchClient con filtros y paginación
  - [ ] T3.1: Crear `src/app/(buyer)/search/SearchClient.tsx` como Client Component (`"use client"`)
  - [ ] T3.2: Input de texto para búsqueda libre (`q`) con debounce de 300ms antes de navegar
  - [ ] T3.3: Chips de filtro para categoría, localidad y sello — seleccionables, uno activo a la vez por tipo
  - [ ] T3.4: Chips activos visibles con X para eliminar el filtro individualmente
  - [ ] T3.5: Cambio de filtro → `router.push('/search?...')` → re-render del Server Component con nuevos resultados
  - [ ] T3.6: Botón "Cargar más" — mismo patrón que FeedClient: fetch a `/api/search?cursor=X&q=Y&...` y append
  - [ ] T3.7: Empty state cuando `initialProducts.length === 0`

## Dev Notes

### Estructura de archivos

```
src/lib/categories.ts                    ← NUEVO: constante CATEGORIES compartida
src/app/api/search/route.ts              ← NUEVO: endpoint de búsqueda pública
src/app/(buyer)/search/page.tsx          ← NUEVO: Server Component
src/app/(buyer)/search/SearchClient.tsx  ← NUEVO: Client Component con filtros y paginación
```

Modificados:
```
src/app/(artisan)/studio/products/new/NewProductWizard.tsx  ← importar CATEGORIES desde lib
```

### Buyer layout — ya tiene AppHeader, AppFooter y contenedor

`src/app/(buyer)/layout.tsx` ya envuelve con `AppHeader`, `AppFooter` y el contenedor `mx-auto w-full flex-1 max-w-lg md:max-w-2xl lg:max-w-4xl`. La search page NO debe añadirlos de nuevo. `export const dynamic = "force-dynamic"` también ya está en el layout.

La search page solo necesita:
```tsx
return <main className="px-4 py-8">...</main>;
```

### Categorías — constante compartida

Las categorías están actualmente definidas inline en `NewProductWizard.tsx`. Extraerlas a un fichero compartido para que SearchClient también pueda usarlas:

```typescript
// src/lib/categories.ts
export const CATEGORIES = [
  "Joyería y bisutería",
  "Cerámica y alfarería",
  "Textil y costura",
  "Madera",
  "Papel y encuadernación",
  "Pintura y dibujo",
  "Fotografía",
  "Alimentación",
  "Perfumería y cosmética natural",
  "Otros",
] as const;

export const PERISHABLE_CATEGORIES: readonly string[] = [
  "Alimentación",
  "Perfumería y cosmética natural",
];
```

### Filtros opcionales en Prisma — spread condicional

Todos los filtros son opcionales y combinables. El patrón para construir el `where`:

```typescript
const where = {
  deletedAt: null,
  status: "ACTIVE" as const,
  ...(q ? {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { artisan: { name: { contains: q, mode: "insensitive" as const } } },
    ],
  } : {}),
  ...(category ? { category } : {}),
  ...(locality ? { locality } : {}),
  ...(sealId ? { seals: { some: { sealId } } } : {}),
};
```

**Por qué `as const` en `mode`:** TypeScript infiere `mode` como `string` en lugar del literal `"insensitive"` que Prisma espera. El `as const` fuerza el tipo correcto.

### Locality filter — reutilizar LocalidadSelect

Ya existe `src/components/LocalidadSelect.tsx` con autocompletado de municipios de España. Reutilizarlo para el filtro de localidad en SearchClient. Cuando el usuario selecciona una localidad, llamar a `applyFilter("locality", value)`. El valor almacenado en `Product.locality` está en formato "Municipio, Provincia" — mismo formato que genera LocalidadSelect.

### Seals — tabla Seal

```typescript
const seals = await db.seal.findMany({
  where: { deletedAt: null },
  select: { id: true, name: true },
  orderBy: { name: "asc" },
});
```

### Fetch en paralelo con Promise.all

Las tres queries del Server Component son independientes — ejecutarlas en paralelo:

```typescript
const [localityRows, seals, products] = await Promise.all([
  db.product.findMany({ /* localities */ }),
  db.seal.findMany({ /* seals */ }),
  db.product.findMany({ /* primera página */ }),
]);
```

### URL-driven filters — patrón de actualización en SearchClient

```typescript
import { useRouter, useSearchParams } from "next/navigation";

const router = useRouter();
const searchParams = useSearchParams();

function applyFilter(key: string, value: string | null) {
  const params = new URLSearchParams(searchParams.toString());
  if (value) params.set(key, value);
  else params.delete(key);
  router.push(`/search?${params.toString()}`);
}
```

La navegación dispara un re-render del Server Component con los nuevos filtros en `searchParams`.

### Reset de estado al cambiar filtros — key prop

Cuando los filtros cambian, el Server Component pasa nuevos `initialProducts`. Para que SearchClient resetee su estado automáticamente, usar `key` en la page:

```tsx
<SearchClient
  key={`${q ?? ""}-${category ?? ""}-${locality ?? ""}-${sealId ?? ""}`}
  initialProducts={initialProducts}
  initialNextCursor={initialNextCursor}
  initialHasMore={hasMore}
  localities={localities}
  seals={seals}
  currentQ={q ?? null}
  currentCategory={category ?? null}
  currentLocality={locality ?? null}
  currentSealId={sealId ?? null}
/>
```

Cuando cambia cualquier filtro, la `key` cambia → React desmonta y vuelve a montar SearchClient → todos los estados (`products`, `nextCursor`, `hasMore`) se resetean automáticamente con los nuevos `initialProducts`.

### "Cargar más" — incluir filtros activos en la URL del fetch

El fetch de paginación debe incluir los filtros activos para que los resultados sean consistentes:

```typescript
const params = new URLSearchParams();
if (nextCursor) params.set("cursor", nextCursor);
if (currentQ) params.set("q", currentQ);
if (currentCategory) params.set("category", currentCategory);
if (currentLocality) params.set("locality", currentLocality);
if (currentSealId) params.set("sealId", currentSealId);
const res = await fetch(`/api/search?${params.toString()}`);
```

### Select de productos — mismo que H3.2

```typescript
select: {
  id: true,
  name: true,
  priceInCents: true,
  status: true,
  imageUrls: true,
  expiresAt: true,
  artisan: { select: { name: true, image: true } },
}
```

### SearchClient requiere Suspense en page.tsx

`useSearchParams()` requiere un boundary de Suspense en Next.js 15 para el rendering estático. Envolver SearchClient:

```tsx
import { Suspense } from "react";

<Suspense fallback={<div className="py-20 text-center text-sm text-[--text-muted]">Cargando...</div>}>
  <SearchClient key={...} ... />
</Suspense>
```

### ProductCard existente — reutilizar sin modificar

`src/components/ProductCard.tsx` acepta el mismo tipo de producto que H3.2. NO modificarlo.

### Aprendizajes de H3.2 relevantes

- `expiresAt` llega como string desde JSON en `loadMore` → convertir con `new Date(...)`. Normalizar también en `useState` inicial por consistencia.
- `take + 1` para detectar `hasMore`, `skip: cursor ? 1 : 0` para saltar el cursor.
- En el catch del endpoint: distinguir cursor inválido (duck typing `"code" in error && error.code === "P2025"` → 400) de error genérico (→ 500 + `console.error`).
- El `take` del query param: `parseInt` con `Math.min(rawTake, 20)` para acotar.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

**Nuevos:**
- `src/lib/categories.ts`
- `src/app/api/search/route.ts`
- `src/app/(buyer)/search/page.tsx`
- `src/app/(buyer)/search/SearchClient.tsx`

**Actualizados:**
- `src/app/(artisan)/studio/products/new/NewProductWizard.tsx`

### Change Log

- 2026-06-05: Historia creada. Scope: filtros (localidad, categoría, sello) + búsqueda por texto en nombre de producto y nombre de artesana. Búsqueda de artesanas como resultado directo diferida a H3.5/V2. Filtros en URL para compartibilidad e indexabilidad.
