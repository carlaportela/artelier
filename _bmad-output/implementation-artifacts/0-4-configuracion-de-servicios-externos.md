# Story 0.4: Configuración de servicios externos

Status: review

## Story

Como desarrolladora,
quiero tener los clientes de Resend, Cloudinary y Upstash Redis configurados e instanciados antes de que cualquier épico funcional los necesite,
para que Historia 1.2 (recuperación de contraseña), Historia 2.1 (subida de imágenes) y las rutas con rate limiting puedan implementarse sin dependencias pendientes.

## Acceptance Criteria

1. **[Resend]** Dado que `RESEND_API_KEY` y `RESEND_FROM_EMAIL` están definidos en `.env`, cuando se importa `src/lib/resend.ts`, entonces exporta un singleton `resend` listo para usar en Route Handlers y Server Actions, y `.env.example` documenta ambas variables con valores de ejemplo.

2. **[Cloudinary]** Dado que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` están definidos, cuando `POST /api/upload` recibe un archivo, entonces sube la imagen a Cloudinary y retorna `{ data: { url, publicId } }`, y las credenciales nunca se exponen al cliente.

3. **[Upstash Rate Limiting]** Dado que `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` están definidos, cuando se importa `src/lib/ratelimit.ts`, entonces exporta los siguientes limiters preconfigurados:
   - `authLimiter`: 10 req/min (ventana deslizante)
   - `messageLimiter`: 30 req/min (ventana deslizante)
   - `checkoutLimiter`: 5 req/min (ventana deslizante)
   - `disputeLimiter`: 5 req/hora (ventana deslizante)

4. **[Degradación graceful]** Dado que cualquiera de las tres integraciones no está configurada (variable vacía o ausente), cuando la aplicación arranca en desarrollo, entonces aparece un `console.warn` indicando qué variable falta, y el arranque no se rompe.

## Tasks / Subtasks

- [ ] Task 1: Instalar dependencias de servicios externos (AC: 1, 2, 3)
  - [ ] `npm install resend cloudinary @upstash/ratelimit @upstash/redis`
  - [ ] Verificar `npm run typecheck` sigue pasando

- [ ] Task 2: Crear `src/lib/resend.ts` (AC: 1, 4)
  - [ ] Importar `env` desde `~/env` y crear singleton `Resend`
  - [ ] Añadir `console.warn` si `RESEND_API_KEY` o `RESEND_FROM_EMAIL` no están definidos
  - [ ] Exportar instancia `resend` y constante `FROM_EMAIL`

- [ ] Task 3: Crear `src/lib/cloudinary.ts` (AC: 2, 4)
  - [ ] Configurar SDK de Cloudinary v2 con credenciales desde `env`
  - [ ] Añadir `console.warn` si cualquier variable de Cloudinary no está definida
  - [ ] Exportar instancia `cloudinary` configurada

- [ ] Task 4: Crear `src/app/api/upload/route.ts` (AC: 2)
  - [ ] Route Handler `POST` que recibe `FormData` con campo `file`
  - [ ] Validar que existe el archivo; retornar 400 si no
  - [ ] Retornar 503 con error descriptivo si Cloudinary no está configurado
  - [ ] Subir a Cloudinary en carpeta `"artelier"` y retornar `{ data: { url, publicId } }`
  - [ ] Formato de error: `{ error: { code: string, message: string } }`

- [ ] Task 5: Crear `src/lib/ratelimit.ts` (AC: 3, 4)
  - [ ] Crear cliente Redis con variables de Upstash desde `env`
  - [ ] Si variables no están definidas: exportar limiters con fallback no-op (siempre permite, no crashea)
  - [ ] Añadir `console.warn` en desarrollo si las variables de Upstash no están definidas
  - [ ] Exportar los 4 limiters: `authLimiter`, `messageLimiter`, `checkoutLimiter`, `disputeLimiter`

- [ ] Task 6: Verificación final (AC: 1, 2, 3, 4)
  - [ ] `npm run typecheck` — must pass
  - [ ] `npm run build` (con `SKIP_ENV_VALIDATION=true`) — must pass
  - [ ] Confirmar que con variables vacías el build NO falla (degradación graceful)

## Dev Notes

### Dependencias a instalar

```bash
npm install resend cloudinary @upstash/ratelimit @upstash/redis
```

Versiones aproximadas (usar latest en el momento de implementar):
- `resend` — cliente oficial de Resend para Node.js
- `cloudinary` — SDK v2 de Cloudinary
- `@upstash/ratelimit` — librería de rate limiting de Upstash
- `@upstash/redis` — cliente HTTP para Upstash Redis (no requiere conexión TCP)

### Variables de entorno

`src/env.js` ya tiene todas las variables definidas como `.optional()`. `.env.example` también está completo. **No hay que modificar ninguno de los dos archivos.**

```javascript
// Ya definidas en src/env.js:
RESEND_API_KEY: z.string().optional(),
RESEND_FROM_EMAIL: z.string().optional(),
CLOUDINARY_CLOUD_NAME: z.string().optional(),
CLOUDINARY_API_KEY: z.string().optional(),
CLOUDINARY_API_SECRET: z.string().optional(),
UPSTASH_REDIS_REST_URL: z.string().optional(),
UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
```

`emptyStringAsUndefined: true` está activo — strings vacíos se tratan como `undefined`.

### Patrón de acceso a env vars

Siempre importar desde `~/env`, nunca `process.env` directamente:

```typescript
import { env } from "~/env";
// Correcto: env.RESEND_API_KEY
// Incorrecto: process.env.RESEND_API_KEY
```

### `src/lib/resend.ts` — implementación de referencia

```typescript
import { Resend } from "resend";
import { env } from "~/env";

if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
  console.warn(
    "[Artelier] Resend no configurado: RESEND_API_KEY y/o RESEND_FROM_EMAIL ausentes. " +
    "Los emails transaccionales no funcionarán."
  );
}

export const resend = new Resend(env.RESEND_API_KEY);
export const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "noreply@artelier.es";
```

Nota: `new Resend(undefined)` no lanza — simplemente fallará cuando se intente enviar un email. Esto es el comportamiento correcto para degradación graceful.

### `src/lib/cloudinary.ts` — implementación de referencia

```typescript
import { v2 as cloudinary } from "cloudinary";
import { env } from "~/env";

if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  console.warn(
    "[Artelier] Cloudinary no configurado: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY " +
    "y/o CLOUDINARY_API_SECRET ausentes. Las subidas de imágenes no funcionarán."
  );
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
```

### `src/app/api/upload/route.ts` — implementación de referencia

```typescript
import { NextResponse } from "next/server";
import { cloudinary } from "~/lib/cloudinary";
import { env } from "~/env";

export async function POST(req: Request) {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Servicio de imágenes no configurado" } },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: { code: "MISSING_FILE", message: "No se proporcionó ningún archivo" } },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "artelier",
  });

  return NextResponse.json({
    data: { url: result.secure_url, publicId: result.public_id },
  });
}
```

### `src/lib/ratelimit.ts` — implementación de referencia

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

type RateLimiter = { limit: (id: string) => Promise<{ success: boolean }> };

// Fallback no-op: siempre permite, no necesita Redis
const noopLimiter: RateLimiter = {
  limit: async () => ({ success: true }),
};

function createLimiter(requests: number, window: string): RateLimiter {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Artelier] Upstash Redis no configurado: UPSTASH_REDIS_REST_URL y/o " +
        "UPSTASH_REDIS_REST_TOKEN ausentes. Rate limiting desactivado."
      );
    }
    return noopLimiter;
  }

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

export const authLimiter = createLimiter(10, "60 s");
export const messageLimiter = createLimiter(30, "60 s");
export const checkoutLimiter = createLimiter(5, "60 s");
export const disputeLimiter = createLimiter(5, "1 h");
```

Nota: el `console.warn` se emite una vez por limiter (en el momento de la importación del módulo). Para evitar spam en los logs, el check `NODE_ENV !== "production"` limita el warning a desarrollo.

### Estructura de archivos a crear

```
src/
├── lib/
│   ├── cloudinary.ts       ← NUEVO
│   ├── resend.ts           ← NUEVO
│   └── ratelimit.ts        ← NUEVO
└── app/
    └── api/
        └── upload/
            └── route.ts    ← NUEVO
```

### Archivos existentes a NO modificar

- `src/env.js` — ya configurado correctamente
- `.env.example` — ya documentado
- `src/server/auth/config.ts` — no relacionado
- `src/server/auth/config.edge.ts` — scaffolding para H1.2, no tocar

### Formato de respuesta API

Seguir el patrón establecido en `src/types/api.ts`:
- Éxito: `{ data: { ... } }`
- Error: `{ error: { code: string, message: string } }`

### Contexto del proyecto: por qué estos servicios

- **Resend**: emails transaccionales (recuperación contraseña H1.2, confirmación pedido H6.1, nuevo mensaje H4.x)
- **Cloudinary**: imágenes de productos (H2.1), fotos de perfil (H1.3), adjuntos en mensajes (H4.3), evidencias de disputas (H7.3)
- **Upstash Redis**: rate limiting en rutas críticas. También en H0.3's deferred work: RBAC en middleware (H1.2) usará Upstash para cachear `sessionId → role`

### Learnings de historias anteriores

- Importar siempre `env` desde `~/env`, nunca `process.env`
- Los singletons se exportan directamente, no como funciones factory
- El `src/lib/` existente ya tiene `utils.ts` (función `cn()`) — no modificar
- `emptyStringAsUndefined: true` en `env.js` trata strings vacíos como undefined — las comprobaciones `if (!env.VAR)` funcionan correctamente para ambos casos

### Testing

Esta historia no requiere tests unitarios — los servicios son wrappers thin alrededor de SDKs externos. La verificación es:
1. `npm run typecheck` — tipos correctos
2. `npm run build` con `SKIP_ENV_VALIDATION=true` — sin errores de compilación
3. Manual: verificar que con variables vacías en `.env`, la app arranca y muestra los `console.warn` esperados

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Historia 0.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — External Services, Rate Limiting]
- [Source: src/env.js — Variables de entorno ya configuradas]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md — RBAC con Upstash deferred H1.2]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Instalados: resend, cloudinary, @upstash/ratelimit, @upstash/redis (12 paquetes en total)
- `Duration` type de `@upstash/ratelimit` requerido en `createLimiter` — `string` genérico no satisface el tipo de `slidingWindow`
- `console.warn` de Cloudinary aparece dos veces en el build (Next.js evalúa módulos server-side en dos pasadas) — comportamiento esperado, en producción solo una vez
- AC4 verificado: sin variables de Cloudinary la app arranca y muestra warning descriptivo
- `npm run typecheck` ✅ y `npm run build` ✅

### File List

- `src/lib/resend.ts` (NUEVO)
- `src/lib/cloudinary.ts` (NUEVO)
- `src/lib/ratelimit.ts` (NUEVO)
- `src/app/api/upload/route.ts` (NUEVO)
- `package.json` (MODIFICADO — nuevas dependencias)
- `package-lock.json` (MODIFICADO — lockfile actualizado)
