# Story 1.1: Registro con elección de rol

Status: ready-for-dev

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

- [ ] Task 1: Instalar bcryptjs y añadir `locality` al modelo User (AC: 2, 3)
  - [ ] `npm install bcryptjs`
  - [ ] `npm install -D @types/bcryptjs`
  - [ ] Añadir `locality String?` al modelo User en `prisma/schema.prisma`
  - [ ] Ejecutar `npx prisma migrate dev --name add-user-locality`
  - [ ] Verificar que `npm run typecheck` sigue pasando

- [ ] Task 2: Implementar `authorize()` en `src/server/auth/config.ts` (AC: 2, 3)
  - [ ] Importar `bcryptjs` y `z` de zod
  - [ ] Implementar la función `authorize()`: buscar user por email, comparar hash bcrypt, retornar user o null
  - [ ] Eliminar el comentario `// authorize() implemented in Historia 1.2`
  - [ ] Verificar `npm run typecheck`

- [ ] Task 3: Crear schema Zod de registro (AC: 1, 2, 3, 4, 5)
  - [ ] Crear `src/lib/validations/auth.ts`
  - [ ] Definir `registerSchema`: email (zod email), password (min 8), locality (min 2), role (enum ARTISAN | BUYER)
  - [ ] Exportar el tipo `RegisterInput = z.infer<typeof registerSchema>`

- [ ] Task 4: Crear Server Action de registro (AC: 2, 3, 4, 5)
  - [ ] Crear `src/app/(auth)/register/actions.ts` con directiva `"use server"`
  - [ ] Validar input con `registerSchema.safeParse()` — retornar errores de campo si falla
  - [ ] Verificar unicidad de email con `db.user.findUnique()` — retornar error en campo `email` si existe
  - [ ] Hashear contraseña con `hash(password, 12)` de bcryptjs
  - [ ] Crear usuario con `db.user.create({ data: { email, password: hashedPassword, role, locality } })`
  - [ ] Llamar `signIn("credentials", { email, password, redirectTo: role === "ARTISAN" ? "/studio/dashboard" : "/feed" })` de `~/server/auth`
  - [ ] Manejar error `NEXT_REDIRECT` (Auth.js lo lanza para redirigir — es comportamiento esperado, NO es un error real)

- [ ] Task 5: Crear auth layout (AC: 1)
  - [ ] Crear `src/app/(auth)/layout.tsx`
  - [ ] Layout centrado verticalmente, sin BottomNav ni top nav
  - [ ] Fondo `bg-[--bg]`, ancho máximo del formulario 400px centrado

- [ ] Task 6: Crear página de registro con selector de rol (AC: 1, 2, 3, 5)
  - [ ] Crear `src/app/(auth)/register/page.tsx`
  - [ ] Paso 1: Selector de rol — dos tarjetas grandes con icono y label ("Artesana / Productora", "Compradora")
  - [ ] Al seleccionar rol, mostrar el formulario (email + contraseña + localidad) en la misma página
  - [ ] Usar `useForm()` de `react-hook-form` con `zodResolver(registerSchema)`
  - [ ] Validación inline `mode: "onBlur"` — errores aparecen al salir del campo
  - [ ] Submit llama al Server Action con `useTransition()` para estado de carga
  - [ ] Mostrar error de email duplicado en el campo email (no en toast global)
  - [ ] Deshabilitar el botón submit durante el envío

- [ ] Task 7: Crear páginas stub para las redirecciones (AC: 2, 3)
  - [ ] Crear `src/app/studio/dashboard/page.tsx` — stub mínimo: `<h1>Studio Dashboard</h1>` (se implementa en H1.3)
  - [ ] Crear `src/app/feed/page.tsx` — stub mínimo: `<h1>Feed</h1>` (se implementa en H3.x)

- [ ] Task 8: Actualizar claves i18n (AC: 1, 5)
  - [ ] Añadir claves en `src/i18n/messages/es.json` bajo `auth`: `locality`, `chooseRole`, `artisan`, `buyer`, `artisanDescription`, `buyerDescription`, `emailExists`, `passwordMin`, `localityRequired`

- [ ] Task 9: Verificación final (AC: 1, 2, 3, 4, 5)
  - [ ] `npm run typecheck` — must pass
  - [ ] `npm run build` con `SKIP_ENV_VALIDATION=true` — must pass
  - [ ] Manual: flujo completo artesana — registro → redirect a `/studio/dashboard`
  - [ ] Manual: flujo completo compradora — registro → redirect a `/feed`
  - [ ] Manual: email duplicado → error inline en campo email
  - [ ] Manual: campos vacíos → errores específicos por campo

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

### Debug Log References

### Completion Notes List

### File List

### Change Log
