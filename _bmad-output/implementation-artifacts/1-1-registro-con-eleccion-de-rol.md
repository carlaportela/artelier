# Story 1.1: Registro con elección de rol

Status: done

## Story

Como visitante,
quiero registrarme eligiendo si soy artesana o compradora,
para acceder a la plataforma con la experiencia adecuada a mi perfil.

## Acceptance Criteria

1. **[Pantalla de registro]** Dado que soy visitante y accedo a `/register`, cuando veo la pantalla de registro, entonces hay una elección clara de rol: "Artesana / Productora" y "Compradora", y cada opción tiene un icono que comunica el rol sin jerga técnica.

2. **[Registro artesana]** Dado que elijo "Artesana" y completo email + contraseña + localidad, cuando envío el formulario, entonces mi cuenta se crea con `role: 'ARTISAN'` en la base de datos, la contraseña se almacena con hash bcrypt coste mínimo 12, y soy redirigida a `/studio/dashboard`.

3. **[Registro compradora]** Dado que elijo "Compradora" y completo email + contraseña + localidad, cuando envío el formulario, entonces mi cuenta se crea con `role: 'BUYER'` y soy redirigida a `/feed`.

4. **[Email duplicado]** Dado que introduzco un email ya registrado, cuando envío el formulario, entonces veo un error inline en el campo email: "Este email ya está registrado", y el formulario no se envía.

5. **[Campos obligatorios]** Dado que omito un campo obligatorio, cuando intento enviar el formulario, entonces el campo afectado muestra su error específico junto a él, nunca un mensaje genérico.

## Tasks / Subtasks

- [x] Task 1: Instalar bcryptjs y añadir `locality` al modelo User (AC: 2, 3)
  - [x] `npm install bcryptjs`
  - [x] `npm install -D @types/bcryptjs`
  - [x] Añadir `locality String?` al modelo User en `prisma/schema.prisma`
  - [x] Ejecutar `npx prisma migrate dev --name add-user-locality`
  - [x] Verificar que `npm run typecheck` sigue pasando

- [x] Task 2: Implementar `authorize()` en `src/server/auth/config.ts` (AC: 2, 3)
  - [x] Importar `bcryptjs` y `z` de zod
  - [x] Implementar la función `authorize()`: buscar user por email, comparar hash bcrypt, retornar user o null
  - [x] Eliminar el comentario `// authorize() implemented in Historia 1.2`
  - [x] Verificar `npm run typecheck`

- [x] Task 3: Crear schema Zod de registro (AC: 1, 2, 3, 4, 5)
  - [x] Crear `src/lib/validations/auth.ts`
  - [x] Definir `registerSchema`: email (zod email), password (min 8), locality (min 2), role (enum ARTISAN | BUYER)
  - [x] Exportar el tipo `RegisterInput = z.infer<typeof registerSchema>`

- [x] Task 4: Crear Server Action de registro (AC: 2, 3, 4, 5)
  - [ ] Crear `src/app/(auth)/register/actions.ts` con directiva `"use server"`
  - [x] Validar input con `registerSchema.safeParse()` — retornar errores de campo si falla
  - [x] Verificar unicidad de email con `db.user.findUnique()` — retornar error en campo `email` si existe
  - [x] Hashear contraseña con `hash(password, 12)` de bcryptjs
  - [x] Crear usuario con `db.user.create({ data: { email, password: hashedPassword, role, locality } })`
  - [x] Llamar `signIn("credentials", { email, password, redirectTo: role === "ARTISAN" ? "/studio/dashboard" : "/feed" })` de `~/server/auth`
  - [x] Manejar error `NEXT_REDIRECT` (Auth.js lo lanza para redirigir — es comportamiento esperado, NO es un error real)

- [x] Task 5: Crear auth layout (AC: 1)
  - [x] Crear `src/app/(auth)/layout.tsx`
  - [x] Layout centrado verticalmente, sin BottomNav ni top nav
  - [x] Fondo `bg-[--bg]`, ancho máximo del formulario 400px centrado

- [x] Task 6: Crear página de registro con selector de rol (AC: 1, 2, 3, 5)
  - [x] Crear `src/app/(auth)/register/page.tsx`
  - [x] Paso 1: Selector de rol — dos tarjetas grandes con icono y label ("Artesana / Productora", "Compradora")
  - [x] Al seleccionar rol, mostrar el formulario (email + contraseña + localidad) en la misma página
  - [x] Usar `useForm()` de `react-hook-form` con `zodResolver(registerSchema)`
  - [x] Validación inline `mode: "onBlur"` — errores aparecen al salir del campo
  - [x] Submit llama al Server Action con `useTransition()` para estado de carga
  - [x] Mostrar error de email duplicado en el campo email (no en toast global)
  - [x] Deshabilitar el botón submit durante el envío

- [x] Task 7: Crear páginas stub para las redirecciones (AC: 2, 3)
  - [x] Crear `src/app/studio/dashboard/page.tsx` — stub mínimo: `<h1>Studio Dashboard</h1>` (se implementa en H1.3)
  - [x] Crear `src/app/feed/page.tsx` — stub mínimo: `<h1>Feed</h1>` (se implementa en H3.x)

- [x] Task 8: Actualizar claves i18n (AC: 1, 5)
  - [x] Añadir claves en `src/i18n/messages/es.json` bajo `auth`: `locality`, `chooseRole`, `artisan`, `buyer`, `artisanDescription`, `buyerDescription`, `emailExists`, `passwordMin`, `localityRequired`

- [x] Task 9: Verificación final (AC: 1, 2, 3, 4, 5)
  - [x] `npm run typecheck` — must pass
  - [x] `npm run build` con `SKIP_ENV_VALIDATION=true` — must pass
  - [x] Manual: flujo completo artesana — registro → redirect a `/studio/dashboard`
  - [x] Manual: flujo completo compradora — registro → redirect a `/feed`
  - [x] Manual: email duplicado → error inline en campo email
  - [x] Manual: campos vacíos → errores específicos por campo

### Review Findings

- [x] [Review][Patch] Envolver `user.create` + `session.create` en `db.$transaction()` — previene usuarios huérfanos si falla la sesión y maneja la race condition de email duplicado con error P2002 [src/app/(auth)/register/actions.ts:36-55]
- [x] [Review][Patch] Normalizar email a minúsculas antes de guardarlo y buscarlo — `User@Example.com` y `user@example.com` pasan el check de duplicado como emails distintos [src/app/(auth)/register/actions.ts:22, src/lib/validations/auth.ts:4]
- [x] [Review][Patch] Usar claves i18n (`useTranslations`) en `page.tsx` en lugar de strings hardcodeados — las claves existen en `es.json` pero no se consumen [src/app/(auth)/register/page.tsx]
- [x] [Review][Patch] Añadir `.trim()` al campo `locality` en Zod schema — `min(2)` acepta strings solo con espacios [src/lib/validations/auth.ts:5]
- [x] [Review][Patch] Guardar `messages[0]` con null-coalescing en el handler de errores del form — `messages[0]` puede ser `undefined` si el servidor devuelve array vacío [src/app/(auth)/register/page.tsx:99]
- [x] [Review][Patch] Eliminar campo `password` del objeto user devuelto por `authorize()` — el hash no debería propagarse por callbacks [src/server/auth/config.ts:42]
- [x] [Review][Defer] Sin rate limiting en la Server Action de registro — deferred, necesita infraestructura, fuera de scope de esta historia
- [x] [Review][Defer] Sesión manual bypassa ciclo de vida de Auth.js (sin rotación, sin `updateAge`) — deferred, workaround documentado e inevitable con Auth.js v5 + Credentials + database sessions
- [x] [Review][Defer] Cast unsafe de `user.role` en session callback — deferred, pre-existing de H0.3
- [x] [Review][Defer] Nombre de cookie hardcodeado, frágil si Auth.js cambia — deferred, contrato de Auth.js v5
- [x] [Review][Defer] Email enumeration por diferencia de timing entre EMAIL_EXISTS y hash — deferred, hardening de seguridad futuro
- [x] [Review][Defer] Sin longitud máxima en campos del formulario — deferred, hardening futuro
- [x] [Review][Defer] Estado del formulario persiste al volver al selector de rol (errores stale) — deferred, UX polish futuro
- [x] [Review][Defer] `isPending` no desactiva el botón de volver durante el envío — deferred, UX polish futuro
- [x] [Review][Defer] Mensajes de error de Zod hardcodeados (`passwordMin`, `localityRequired`) — deferred, i18n en Zod requiere patrón diferente (función de mensajes o schema dinámico)
- [x] [Review][Defer] `emailExists` hardcodeado en server action — deferred, i18n en server actions requiere patrón diferente

## Dev Notes

### Contexto del proyecto

Esta historia abre el Épico 1 (Autenticación y Perfiles). Es la primera historia funcional para usuarios finales. Depende de:
- **Épico 0 completo**: T3 Stack inicializado, sistema de diseño Tinta y Lino, Auth.js v5 configurado con PrismaAdapter, bcrypt pendiente de instalar
- **`src/server/auth/config.ts`**: Ya existe con `authorize: async () => null` — esta historia lo implementa

### Dependencias a instalar

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

`bcryptjs` es la versión pure-JavaScript de bcrypt — mismos hashes, sin dependencias nativas (no requiere node-gyp). Compatibilidad completa con la especificación bcrypt del proyecto (AR4: bcrypt coste mínimo 12).

### Migración de Prisma

El modelo `User` en `prisma/schema.prisma` **no tiene** un campo `locality`. Hay que añadirlo:

```prisma
model User {
    id                 String    @id @default(cuid())
    name               String?
    email              String?   @unique
    emailVerified      DateTime?
    image              String?
    role               Role      @default(BUYER)
    password           String?
    locality           String?   // ← AÑADIR ESTA LÍNEA
    stripeAccountId    String?
    // ...resto del modelo sin cambios
}
```

Luego ejecutar:
```bash
npx prisma migrate dev --name add-user-locality
```

El campo es `String?` (opcional) porque los usuarios OAuth futuros no lo tendrán. Los usuarios de credentials siempre lo enviarán en el formulario de registro.

### `authorize()` en `src/server/auth/config.ts`

El `authorize()` actual devuelve `null` siempre (scaffolding de H0.3). Esta historia lo implementa porque se necesita para el auto-sign-in post-registro. H1.2 (login) usará exactamente el mismo `authorize()` sin modificaciones adicionales.

```typescript
import bcrypt from "bcryptjs";
import { z } from "zod";

// Dentro del provider Credentials:
authorize: async (credentials) => {
  const parsed = z.object({
    email: z.string().email(),
    password: z.string(),
  }).safeParse(credentials);

  if (!parsed.success) return null;

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user?.password) return null;

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) return null;

  return user;
},
```

**Importante**: `db` ya está importado en el archivo. Solo añadir `import bcrypt from "bcryptjs"` y `import { z } from "zod"` (zod ya es dependencia del proyecto).

### Schema Zod — `src/lib/validations/auth.ts`

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  locality: z.string().min(2, "Introduce tu localidad"),
  role: z.enum(["ARTISAN", "BUYER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

Este archivo crecerá en H1.2 con `loginSchema`. Usar `auth.ts` como nombre porque agrupa todas las validaciones de autenticación.

### Server Action — `src/app/(auth)/register/actions.ts`

```typescript
"use server";

import { hash } from "bcryptjs";
import { signIn } from "~/server/auth";
import { db } from "~/server/db";
import { registerSchema } from "~/lib/validations/auth";

export async function registerUser(data: unknown) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { email, password, locality, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: {
        code: "EMAIL_EXISTS",
        field: "email",
        message: "Este email ya está registrado",
      },
    };
  }

  const hashedPassword = await hash(password, 12);

  await db.user.create({
    data: { email, password: hashedPassword, role, locality },
  });

  // signIn lanza NEXT_REDIRECT — comportamiento correcto, no capturar este error
  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "ARTISAN" ? "/studio/dashboard" : "/feed",
  });
}
```

**Trampa crítica**: `signIn()` de Auth.js lanza un error de tipo `NEXT_REDIRECT` internamente para gestionar la redirección en Next.js App Router. Este NO es un error real — es el mecanismo de redirección de Next.js. Si envuelves el `signIn()` en un try/catch genérico, capturarás este "error" y la redirección no funcionará. Solución: no envolver `signIn()` en try/catch, o si lo haces, re-lanzar el error:

```typescript
// MAL — intercepta NEXT_REDIRECT y rompe la redirección:
try {
  await signIn("credentials", { ... });
} catch (error) {
  console.error(error); // Captura NEXT_REDIRECT, redireccion rota
}

// BIEN — dejar que signIn lance libremente:
await signIn("credentials", {
  email,
  password,
  redirectTo: role === "ARTISAN" ? "/studio/dashboard" : "/feed",
});

// O si necesitas try/catch para otros errores:
import { isRedirectError } from "next/dist/client/components/redirect";
try {
  await signIn("credentials", { ... });
} catch (error) {
  if (isRedirectError(error)) throw error; // Re-lanzar NEXT_REDIRECT
  // manejar otros errores aquí
}
```

### Página de registro — estructura y UX

La ruta es `src/app/(auth)/register/page.tsx`. El grupo `(auth)` es un Route Group de Next.js — no afecta a la URL. La página estará en `/register`.

**Flujo de la UI en dos fases:**

Fase 1 — Selector de rol (sin formulario visible):
```
┌──────────────────────────────┐
│  ¿Cómo quieres usar Artelier? │
│                               │
│ ┌─────────────┐ ┌───────────┐ │
│ │  🎨 Artesana│ │ 🛍 Compradora│
│ │  /Productora│ │            │ │
│ └─────────────┘ └───────────┘ │
└──────────────────────────────┘
```

Fase 2 — Formulario (tras seleccionar rol):
```
┌──────────────────────────────┐
│  ← Artesana / Productora      │
│                               │
│  Email                        │
│  [campo]                      │
│  Contraseña                   │
│  [campo]                      │
│  Localidad                    │
│  [campo]                      │
│                               │
│  [Crear cuenta]               │
│                               │
│  ¿Ya tienes cuenta? Inicia    │
│  sesión                       │
└──────────────────────────────┘
```

Implementación con `useState` para la fase:
```typescript
"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "~/lib/validations/auth";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const [role, setRole] = useState<"ARTISAN" | "BUYER" | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", locality: "", role: "BUYER" },
    mode: "onBlur",
  });

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const result = await registerUser(data);
      if (result?.error) {
        if (result.error.code === "EMAIL_EXISTS") {
          form.setError("email", { message: result.error.message });
        }
        // Errores de validación por campo
        if (result.error.code === "VALIDATION_ERROR" && result.error.fields) {
          Object.entries(result.error.fields).forEach(([field, messages]) => {
            form.setError(field as keyof RegisterInput, {
              message: messages?.[0],
            });
          });
        }
      }
    });
  }

  if (!role) {
    return <RoleSelector onSelect={(r) => { setRole(r); form.setValue("role", r); }} />;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* campos + botón submit */}
    </form>
  );
}
```

### Auth Layout — `src/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[--bg] px-4">
      <div className="w-full max-w-[400px]">
        {children}
      </div>
    </div>
  );
}
```

No incluye BottomNav ni top nav — es un layout limpio centrado para las páginas de auth.

### Páginas stub

```typescript
// src/app/studio/dashboard/page.tsx
export default function StudioDashboardPage() {
  return <main className="p-8"><h1>Studio</h1></main>;
}

// src/app/feed/page.tsx
export default function FeedPage() {
  return <main className="p-8"><h1>Feed</h1></main>;
}
```

Solo existen para que la redirección post-registro no dé 404. Se implementan en H1.3 (dashboard artesana) y H3.x (feed).

### Middleware y protección de rutas

El middleware actual protege `/studio/*` y `/admin/*`. **`/register` es público** — el matcher incluye todas las rutas pero las condiciones del middleware solo redirigen `/studio` y `/admin`. No hay que modificar el middleware para esta historia.

Sin embargo, `/studio/dashboard` (stub) SÍ está protegida por el middleware: si alguien sin sesión intenta acceder directamente, el middleware redirigirá a `/login`. Esto es el comportamiento correcto.

### Claves i18n a añadir en `es.json`

```json
"auth": {
  "login": "Iniciar sesión",
  "logout": "Cerrar sesión",
  "register": "Registrarse",
  "email": "Correo electrónico",
  "password": "Contraseña",
  "forgotPassword": "¿Olvidaste tu contraseña?",
  "locality": "Localidad",
  "chooseRole": "¿Cómo quieres usar Artelier?",
  "artisan": "Artesana / Productora",
  "buyer": "Compradora",
  "artisanDescription": "Vende tu trabajo artesanal",
  "buyerDescription": "Descubre artesanía única",
  "emailExists": "Este email ya está registrado",
  "passwordMin": "La contraseña debe tener al menos 8 caracteres",
  "localityRequired": "Introduce tu localidad",
  "createAccount": "Crear cuenta",
  "alreadyHaveAccount": "¿Ya tienes cuenta?",
  "signIn": "Inicia sesión"
}
```

### Estructura de archivos

```
CREAR:
src/lib/validations/auth.ts
src/app/(auth)/layout.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/register/actions.ts
src/app/studio/dashboard/page.tsx   ← stub
src/app/feed/page.tsx               ← stub

MODIFICAR:
prisma/schema.prisma                ← añadir locality a User
src/server/auth/config.ts           ← implementar authorize()
src/i18n/messages/es.json           ← añadir claves auth
```

### Componentes shadcn/ui disponibles

Todos instalados en `src/components/ui/`:
- `Button` — botones primarios y secundarios
- `Input` — campos de formulario
- `Card` / `CardContent` — tarjetas de selección de rol
- `Label` — etiquetas de campos accesibles

Usar `cn()` de `~/lib/utils` para combinar clases Tailwind.

### Convenciones del proyecto a respetar

- Importar env vars desde `~/env`, nunca `process.env`
- Importar db desde `~/server/db`
- Importar signIn/auth desde `~/server/auth`
- Respuestas de Server Actions: `{ error: { code, message?, field?, fields? } }` o `undefined` (éxito redirige)
- Nombres de campo en inglés en BD (`locality`, no `localidad`)
- CSS tokens: `bg-[--bg]`, `text-[--text]`, `bg-[--surface]`
- Formularios con React Hook Form + zodResolver
- `"use client"` solo en componentes que necesiten hooks del cliente

### Testing

Esta historia no requiere tests unitarios. La verificación es:
1. `npm run typecheck` — tipos correctos
2. `npm run build` con `SKIP_ENV_VALIDATION=true` — sin errores
3. Manual: flujo completo de registro (artesana y compradora)
4. Manual: email duplicado muestra error inline
5. Manual: campos vacíos muestran errores específicos

Para test manual necesitas una BD real. Ejecutar `npm run dev` con DATABASE_URL apuntando a tu BD local.

### Learnings de historias anteriores

- Importar siempre desde `~/server/auth`, nunca desde `next-auth` directamente
- El `authConfig` en `config.ts` usa PrismaAdapter — NO es edge-safe
- `config.edge.ts` es edge-safe (para middleware) — NO tocar en esta historia
- `emptyStringAsUndefined: true` en env.js — los checks `if (!env.VAR)` funcionan para strings vacíos
- Los singletons se exportan directamente (no como factories)
- CI usa `SKIP_ENV_VALIDATION=true` para build y lint
- Workflow de PR: crear rama `feature/1.1-registro-rol`, implementar, commit, push, PR, code review, merge

### Referencias

- [Source: epics.md — Historia 1.1, Épico 1]
- [Source: architecture.md — AR4 Auth.js v5, AR8 bcrypt, Session strategy]
- [Source: ux-design-specification.md — Flujo de registro, validación inline]
- [Source: src/server/auth/config.ts — authorize() actual]
- [Source: prisma/schema.prisma — modelo User, enum Role]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Auth.js v5 no permite Credentials provider + database sessions vía signIn(). Solución: crear sesión manualmente en Prisma y establecer cookie directamente. Auth.js la lee igual.
- `isRedirectError` no disponible en Next.js 15 desde la ruta esperada. Alternativa: comprobar `error.digest?.startsWith("NEXT_REDIRECT")`. Finalmente innecesario al reemplazar signIn() por sesión manual.
- `locality` añadida al modelo User vía migración `20260520091356_add_user_locality`. Campo `String?` (opcional para usuarios OAuth futuros).
- `label` de shadcn no estaba instalado — instalado con `npx shadcn@latest add label`.
- bcrypt cost 12 verificado en hash de contraseña.
- `eslint-disable` en config.ts eliminado (ya no necesario).
- `prisma migrate reset` necesario antes de añadir locality — BD de Neon tenía drift.
- Todos los ACs verificados manualmente: selector de rol, registro artesana→dashboard, compradora→feed, email duplicado inline, errores por campo.

### File List

- `src/lib/validations/auth.ts` (NUEVO)
- `src/app/(auth)/layout.tsx` (NUEVO)
- `src/app/(auth)/register/page.tsx` (NUEVO)
- `src/app/(auth)/register/actions.ts` (NUEVO)
- `src/app/studio/dashboard/page.tsx` (NUEVO — stub)
- `src/app/feed/page.tsx` (NUEVO — stub)
- `src/server/auth/config.ts` (MODIFICADO — authorize() implementado con bcrypt)
- `prisma/schema.prisma` (MODIFICADO — locality añadido a User)
- `src/i18n/messages/es.json` (MODIFICADO — claves auth ampliadas)
- `package.json` (MODIFICADO — bcryptjs, @types/bcryptjs, react-hook-form, @hookform/resolvers)
- `package-lock.json` (MODIFICADO)
- `prisma/migrations/20260520091356_add_user_locality/` (NUEVO)

### Change Log

- 2026-05-20: Historia 1.1 implementada — registro con elección de rol, sesión manual BD, authorize() con bcrypt
