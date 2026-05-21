# Story 1.2: Login, logout y recuperación de contraseña

Status: done

## Story

Como usuaria registrada,
quiero iniciar y cerrar sesión y recuperar mi contraseña si la olvido,
para acceder de forma segura a mi cuenta en todo momento.

## Acceptance Criteria

1. **[Login correcto]** Dado que accedo a `/login` con credenciales correctas, cuando envío el formulario, entonces se crea una sesión de base de datos (tabla `Session` en Prisma) y soy redirigida a `/studio/dashboard` si soy artesana, o a `/feed` si soy compradora.

2. **[Logout]** Dado que tengo sesión activa y cierro sesión, cuando la acción se procesa, entonces la sesión se elimina de la base de datos y soy redirigida a `/login`.

3. **[Redirect si ya logueada]** Dado que accedo a `/login` ya con sesión activa, cuando el middleware procesa la request, entonces soy redirigida directamente a `/feed` sin mostrar el formulario de login.

4. **[Login incorrecto]** Dado que accedo a `/login` con credenciales incorrectas, cuando envío el formulario, entonces veo: "Email o contraseña incorrectos" (sin especificar cuál) y la sesión no se crea.

5. **[Recuperación de contraseña — solicitud]** Dado que introduzco mi email en `/forgot-password`, cuando envío la solicitud, entonces si el email existe, se envía un enlace de recuperación válido 1 hora vía Resend; y la respuesta siempre dice "Si el email existe, recibirás las instrucciones" (sin revelar si el email está registrado).

6. **[Recuperación de contraseña — reset]** Dado que accedo a `/reset-password?token=xxx` con un token válido, cuando introduzco y confirmo mi nueva contraseña, entonces la contraseña se actualiza con hash bcrypt coste 12, el token se elimina de la BD y soy redirigida a `/login`.

## Tasks / Subtasks

- [x] Task 1: Instalar react-email y crear template de email (AC: 5)
  - [x] `npm install @react-email/components`
  - [x] Crear `src/emails/PasswordReset.tsx` — componente react-email con enlace de reset
  - [x] Verificar `npm run typecheck`

- [x] Task 2: Añadir `loginSchema` al schema Zod de auth (AC: 1, 4)
  - [x] En `src/lib/validations/auth.ts`, añadir `loginSchema`: email + password (sin min de password)
  - [x] Exportar `LoginInput = z.infer<typeof loginSchema>`

- [x] Task 3: Crear Server Action de login (AC: 1, 4)
  - [x] Crear `src/app/(auth)/login/actions.ts` con `"use server"`
  - [x] Validar con `loginSchema.safeParse()` — retornar error de campo si falla
  - [x] Normalizar email a minúsculas: `email.toLowerCase()`
  - [x] Buscar usuario con `db.user.findUnique({ where: { email } })`
  - [x] Si no existe o no tiene `password`: retornar `{ error: { code: "INVALID_CREDENTIALS" } }` (genérico, sin revelar qué falló)
  - [x] Comparar contraseña con `bcrypt.compare(password, user.password)`
  - [x] Si inválido: retornar el mismo error genérico `INVALID_CREDENTIALS`
  - [x] Si válido: crear sesión manualmente en Prisma (mismo patrón que `registerUser`)
  - [x] Poner cookie `authjs.session-token` (o `__Secure-` en producción)
  - [x] `redirect(role === "ARTISAN" ? "/studio/dashboard" : "/feed")`

- [x] Task 4: Crear página de login (AC: 1, 4)
  - [x] Crear `src/app/(auth)/login/page.tsx` con `"use client"`
  - [x] Formulario: email + password con React Hook Form + zodResolver(loginSchema)
  - [x] Mostrar error de credenciales inválidas a nivel de formulario (no por campo)
  - [x] Enlace a `/forgot-password` bajo el botón
  - [x] Enlace a `/register` para crear cuenta
  - [x] `useTranslations("auth")` para todos los strings visibles
  - [x] Botón deshabilitado durante `isPending`

- [x] Task 5: Crear Server Action de logout (AC: 2)
  - [x] Crear `src/app/(auth)/logout/actions.ts` con `"use server"`
  - [x] Leer el sessionToken de la cookie
  - [x] Eliminar la sesión de BD: `db.session.delete({ where: { sessionToken } })`
  - [x] Limpiar la cookie manualmente
  - [x] `redirect("/login")`
  - [x] Añadir el botón de logout a `src/app/studio/dashboard/page.tsx` (stub) para verificar manualmente

- [x] Task 6: Actualizar middleware — redirect a /feed si ya logueado y visita /login (AC: 3)
  - [x] En `src/middleware.ts`, añadir condición: si `pathname === '/login'` && `isLoggedIn` → redirect a `/feed`
  - [x] La condición debe ir ANTES de las protecciones de `/studio` y `/admin`

- [x] Task 7: Crear flujo de recuperación de contraseña (AC: 5, 6)
  - [x] Crear `src/app/(auth)/forgot-password/page.tsx` — formulario con un campo email
  - [x] Crear `src/app/(auth)/forgot-password/actions.ts`:
    - Buscar usuario por email (normalizado a minúsculas)
    - Si existe: eliminar tokens previos del mismo identifier (`db.verificationToken.deleteMany`)
    - Crear `VerificationToken` en BD: `{ identifier: email, token: crypto.randomUUID(), expires: +1h }`
    - Enviar email con Resend usando el template `PasswordReset.tsx`
    - URL de reset: `${process.env.NEXTAUTH_URL}/reset-password?token=xxx`
    - Siempre retornar el mensaje genérico (nunca revelar si el email existe)
  - [x] Crear `src/app/(auth)/reset-password/page.tsx` — formulario: nueva contraseña + confirmar contraseña
  - [x] Crear `src/app/(auth)/reset-password/actions.ts`:
    - Leer el token de la URL (como prop del Server Action o desde searchParams)
    - Buscar en `db.verificationToken.findUnique({ where: { token } })`
    - Si no existe o expirado: retornar `{ error: { code: "INVALID_TOKEN" } }`
    - Hashear nueva contraseña con `hash(password, 12)` de bcryptjs
    - Actualizar `db.user.update({ where: { email: token.identifier }, data: { password: hashedPassword } })`
    - Eliminar el token: `db.verificationToken.delete({ where: { token } })`
    - `redirect("/login")`
  - Typecheck: PASS

- [x] Task 8: Añadir claves i18n (AC: 1, 2, 4, 5, 6)
  - [x] En `src/i18n/messages/es.json`, añadir bajo `auth`:
    - `"loginTitle"`, `"invalidCredentials"`, `"dontHaveAccount"`, `"createOne"`
    - `"forgotPasswordTitle"`, `"forgotPasswordDescription"`, `"sendInstructions"`, `"checkYourEmail"`
    - `"resetPasswordTitle"`, `"newPassword"`, `"confirmPassword"`, `"savePassword"`, `"passwordResetSuccess"`, `"invalidToken"`

- [x] Task 9: Verificación final (AC: 1–6)
  - [x] `npm run typecheck` — PASS
  - [x] `npm run build` con `SKIP_ENV_VALIDATION=true` — PASS
  - [x] Manual: login con artesana existente → redirige a `/studio/dashboard`
  - [x] Manual: login con compradora existente → redirige a `/feed`
  - [x] Manual: credenciales incorrectas → mensaje genérico
  - [x] Manual: visitar `/login` con sesión activa → redirect a `/feed`
  - [x] Manual: logout desde dashboard → sesión eliminada, redirect a `/login`
  - [x] Manual: solicitar recuperación → mensaje genérico (con email válido y con email inventado)

### Review Findings (AI)

- [x] [Review][Decision] Formulario reset-password sin campo "confirmar contraseña" — Resuelto: añadido campo confirmPassword con validación `.refine()` en el schema Zod del cliente. [src/app/(auth)/reset-password/page.tsx]
- [x] [Review][Patch] Race condition en creación de token forgot-password — Resuelto: deleteMany + create envueltos en `db.$transaction(async tx => { ... })`. [src/app/(auth)/forgot-password/actions.ts]
- [x] [Review][Patch] resetPassword no invalida sesiones activas tras el cambio de contraseña — Resuelto: añadido `db.session.deleteMany(...)` como primera operación de la transaction. [src/app/(auth)/reset-password/actions.ts]
- [x] [Review][Patch] Suspense sin prop `fallback` en ResetPasswordPage — Resuelto: añadido `fallback={null}`. [src/app/(auth)/reset-password/page.tsx]
- [x] [Review][Defer] Token UUID almacenado en texto plano en BD — security hardening (hashing del token), no es bug. Práctica estándar para este nivel de app. [src/app/(auth)/forgot-password/actions.ts] — deferred, pre-existing
- [x] [Review][Defer] Sesiones expiradas no se purgan; middleware solo verifica presencia de cookie — limitación arquitectónica pre-existente, el TTL de la cookie coincide con el de la sesión. [src/middleware.ts] — deferred, pre-existing
- [x] [Review][Defer] Usuarios suspendidos/soft-deleted permanecen autenticados hasta expiración de cookie — fuera de scope, requiere feature de admin. [src/middleware.ts] — deferred, pre-existing
- [x] [Review][Defer] Entrypoint dual: Auth.js Credentials + login manual coexisten — workaround conocido y documentado para incompatibilidad Auth.js v5 + database sessions. [src/server/auth/config.ts] — deferred, architectural constraint
- [x] [Review][Defer] Error de envío de email no notificado al usuario (token creado pero email no entregado) — trade-off aceptable; usuario puede reintentar solicitando otro reset. [src/app/(auth)/forgot-password/actions.ts] — deferred, acceptable UX trade-off

## Dev Notes

### Contexto y dependencias

Esta historia completa el Épico 1 de autenticación básica. Depende de:
- **H1.1 completa**: `authorize()` implementado con bcrypt, `registerSchema`, auth layout, i18n base de auth
- **H0.4 completa**: `src/lib/resend.ts` existe con cliente Resend instanciado

### TRAMPA CRÍTICA: Auth.js v5 + Credentials + signIn()

**La misma limitación de H1.1 aplica al login.** Auth.js v5 con `strategy: "database"` y Credentials provider NO permite usar `signIn('credentials', {...})` — lanza `UnsupportedStrategy`. El flujo de login también debe usar sesión manual:

```typescript
// ❌ ESTO NO FUNCIONA con database sessions + Credentials:
await signIn("credentials", { email, password, redirectTo: "/" });

// ✅ ESTO SÍ FUNCIONA — igual que en registerUser:
const sessionToken = crypto.randomUUID();
const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

await db.session.create({ data: { sessionToken, userId: user.id, expires } });

const cookieStore = await cookies();
const isProduction = process.env.NODE_ENV === "production";
cookieStore.set({
  name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
  value: sessionToken,
  expires,
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
});

redirect(user.role === "ARTISAN" ? "/studio/dashboard" : "/feed");
```

No usar `signIn()` importado de `~/server/auth`. Toda la lógica de validación está en el Server Action.

### Validación en el Server Action de login

La validación se hace directamente en el Server Action — NO se llama `signIn()`:

```typescript
// En loginActions.ts:
const user = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
if (!user?.password) {
  return { error: { code: "INVALID_CREDENTIALS" as const } };
}
const valid = await bcrypt.compare(data.password, user.password);
if (!valid) {
  return { error: { code: "INVALID_CREDENTIALS" as const } };
}
// El mismo error genérico para "usuario no existe" y "contraseña incorrecta"
// → previene enumeración de emails
```

**IMPORTANTE:** El `authorize()` en `config.ts` es solo para el flujo de Auth.js interno. En esta implementación manual, NO se llama `authorize()`. La lógica de validación vive en el Server Action.

### Logout — eliminar sesión manualmente

`signOut()` de `~/server/auth` puede funcionar con database sessions + PrismaAdapter (debería eliminar la sesión por sessionToken). Sin embargo, dado que creamos las sesiones manualmente, es más seguro y explícito hacer el logout también manualmente:

```typescript
// src/app/(auth)/logout/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export async function logoutUser() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const sessionToken = cookieStore.get(cookieName)?.value;

  if (sessionToken) {
    // Eliminar sesión de BD — silenciar error si ya no existe
    try {
      await db.session.delete({ where: { sessionToken } });
    } catch {
      // Sesión ya eliminada o no encontrada — ignorar
    }
  }

  cookieStore.delete(cookieName);
  redirect("/login");
}
```

El botón de logout debe ser un `<form action={logoutUser}><button type="submit">Cerrar sesión</button></form>` o bien llamar a la acción desde un handler con `useTransition`.

### VerificationToken para recuperación de contraseña

El modelo `VerificationToken` ya existe en Prisma (creado por Auth.js PrismaAdapter). **No hay migración que hacer.** Su estructura:

```prisma
model VerificationToken {
    identifier String    // email del usuario
    token      String    @unique
    expires    DateTime
    @@unique([identifier, token])
}
```

Flujo completo de recuperación:

```typescript
// 1. Solicitud (forgot-password/actions.ts):
const user = await db.user.findUnique({ where: { email: normalizedEmail } });

if (user) {  // Solo si existe — pero SIEMPRE responder igual
  // Eliminar tokens previos del mismo email
  await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
  
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  
  await db.verificationToken.create({
    data: { identifier: normalizedEmail, token, expires },
  });
  
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: normalizedEmail,
    subject: "Recupera tu contraseña — Artelier",
    react: <PasswordResetEmail resetUrl={resetUrl} />,
  });
}

// Siempre retornar:
return { success: true };  // El formulario muestra el mensaje genérico
```

```typescript
// 2. Reset (reset-password/actions.ts):
const verificationToken = await db.verificationToken.findUnique({
  where: { token },
});

if (!verificationToken || verificationToken.expires < new Date()) {
  return { error: { code: "INVALID_TOKEN" as const } };
}

const hashedPassword = await hash(newPassword, 12);

await db.$transaction([
  db.user.update({
    where: { email: verificationToken.identifier },
    data: { password: hashedPassword },
  }),
  db.verificationToken.delete({ where: { token } }),
]);

redirect("/login");
```

**Nota importante:** El `token` llega como `searchParams.token` en la página. La página de reset debe leer el token de `useSearchParams()` (cliente) o de los searchParams del Server Component, y pasarlo al Server Action. Usar un campo hidden en el form:

```tsx
// reset-password/page.tsx — Client Component
const searchParams = useSearchParams();
const token = searchParams.get("token") ?? "";

// En el form:
<input type="hidden" {...form.register("token")} value={token} />
```

Y el schema Zod de reset incluye `token: z.string().min(1)`.

### Template de email react-email

```typescript
// src/emails/PasswordReset.tsx
import {
  Body, Button, Container, Head, Heading, Html,
  Preview, Section, Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña en Artelier</Preview>
      <Body style={{ backgroundColor: "#f4f0e8", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "32px" }}>
          <Heading>Recupera tu contraseña</Heading>
          <Text>Recibimos una solicitud para restablecer tu contraseña.</Text>
          <Section>
            <Button href={resetUrl} style={{ backgroundColor: "#4a3728", color: "#fff", padding: "12px 24px" }}>
              Restablecer contraseña
            </Button>
          </Section>
          <Text style={{ color: "#666", fontSize: "14px" }}>
            Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### Middleware — redirect si ya logueado

El middleware actual (H0.3) solo protege `/studio` y `/admin`. Para AC3, añadir la condición de `/login`:

```typescript
// src/middleware.ts — añadir ANTES de las demás condiciones:
if (pathname === "/login" && isLoggedIn) {
  return NextResponse.redirect(new URL("/feed", req.nextUrl));
}
```

**Nota:** El redirect va a `/feed` (no a `/studio/dashboard`) porque el middleware no tiene acceso al rol del usuario — solo sabe si hay cookie o no. El redirect genérico a `/feed` es correcto según el AC3.

### Schema Zod — loginSchema

```typescript
// Añadir a src/lib/validations/auth.ts:
export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**Diferencia con registerSchema:** `password` NO tiene `min(8)` aquí — si el usuario introduce contraseña corta, el error debe ser "Email o contraseña incorrectos", no "La contraseña debe tener 8 caracteres" (eso revelaría que el email SÍ existe pero la contraseña tiene menos de 8 chars).

### NEXTAUTH_URL en el Server Action

Para construir la URL de reset, necesitamos la URL base. En el Server Action se puede usar:

```typescript
const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const resetUrl = `${baseUrl}/reset-password?token=${token}`;
```

`NEXTAUTH_URL` ya debe estar en `.env.local` (definida en H0.1). En producción, Vercel la inyecta automáticamente.

### Estructura de archivos

```
CREAR:
src/emails/PasswordReset.tsx                 ← template react-email
src/app/(auth)/login/page.tsx                ← página de login
src/app/(auth)/login/actions.ts              ← loginUser server action
src/app/(auth)/forgot-password/page.tsx      ← formulario solicitar reset
src/app/(auth)/forgot-password/actions.ts    ← requestPasswordReset
src/app/(auth)/reset-password/page.tsx       ← formulario nueva contraseña
src/app/(auth)/reset-password/actions.ts     ← resetPassword
src/app/(auth)/logout/actions.ts             ← logoutUser

MODIFICAR:
src/lib/validations/auth.ts                  ← añadir loginSchema
src/middleware.ts                            ← redirect /login si logueado
src/i18n/messages/es.json                   ← claves de login + reset
src/app/studio/dashboard/page.tsx            ← añadir botón de logout para test
```

**NO hay migración de Prisma en esta historia** — `VerificationToken` ya existe.

### Dependencias a instalar

```bash
npm install @react-email/components
```

`react-email` (la librería base) puede no ser necesaria — `@react-email/components` es el paquete con los primitivos de email. Verificar si `react-email` también es necesario consultando el error de tipos después del install.

### Convenciones del proyecto (de H1.1)

- Importar `db` desde `~/server/db`
- Importar `resend`, `FROM_EMAIL` desde `~/lib/resend`
- Importar `hash`, `compare` desde `bcryptjs`
- Importar `cookies` desde `next/headers`
- Importar `redirect` desde `next/navigation`
- CSS tokens: `bg-[--bg]`, `text-[--text]`, `bg-[--surface]`
- Formularios con React Hook Form + zodResolver
- `"use server"` en Server Actions, `"use client"` solo si necesita hooks
- Respuesta de error: `{ error: { code: "...", message?: "...", field?: "..." } }`
- Email normalizado a minúsculas en todas las operaciones
- Usar `useTranslations("auth")` de `next-intl` para todos los strings visibles

### Testing

No se requieren tests unitarios. Verificación:
1. `npm run typecheck` y `npm run build`
2. Manual: flujo completo de login (artesana → dashboard, compradora → feed)
3. Manual: credenciales incorrectas → mensaje genérico
4. Manual: visitar /login con sesión → redirect
5. Manual: logout → sesión eliminada
6. Manual: recuperación de contraseña (requiere Resend configurado en `.env.local`)

### Learnings de H1.1

- Auth.js v5 + Credentials + database sessions: NO usar signIn() — sesión manual
- La cookie se llama `authjs.session-token` (dev) o `__Secure-authjs.session-token` (prod)
- Email normalizar a minúsculas antes de cualquier operación de BD
- Los paths con `(auth)` en PowerShell requieren comillas
- `npm run typecheck` antes de cada commit
- Crear rama `feature/1.2-login-logout` antes de empezar
- El modelo `User.suspended` y `User.deletedAt` existen — el authorize() de config.ts no los verifica (ver deferred-work.md). El loginUser server action tampoco los verifica en esta historia.

### Referencias

- [Source: epics.md — Historia 1.2, Épico 1]
- [Source: architecture.md — Auth.js v5, Resend, Rate limiting, VerificationToken]
- [Source: src/server/auth/config.ts — authorize() implementado en H1.1]
- [Source: src/app/(auth)/register/actions.ts — patrón de sesión manual]
- [Source: src/lib/resend.ts — cliente Resend instanciado]
- [Source: prisma/schema.prisma — VerificationToken, Session, User]
- [Source: deferred-work.md — items pendientes de H1.1 (rate limiting, suspended check)]

## Dev Agent Record

### Agent Model Used

(pendiente)

### Debug Log References

### Completion Notes List

### File List

### Change Log
