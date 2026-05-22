# Historia 1.5: Derechos RGPD y gestión de cuenta

## Status: ready-for-dev

## Story

Como usuaria registrada, quiero editar mis datos, gestionar mis cookies, solicitar la eliminación de mi cuenta y exportar mis datos personales, para ejercer mis derechos RGPD sobre la información que Artelier tiene sobre mí.

## Acceptance Criteria

**AC1 — Cambio de contraseña**
- Dado que accedo a `/account/settings` y cambio mi contraseña
- Cuando guardo el cambio
- Entonces la nueva contraseña se almacena con hash bcrypt coste 12
- Y todas mis sesiones activas salvo la actual se invalidan

**AC2 — Eliminación de cuenta**
- Dado que solicito la eliminación de mi cuenta y confirmo con mi contraseña
- Cuando la acción se procesa
- Entonces mis datos personales (nombre, email, foto) se anonimizan en la base de datos
- Y el campo `deletedAt` se establece en la fecha actual (soft-delete)
- Y todas mis sesiones activas se eliminan
- Y se me redirige a `/` con la sesión cerrada

**AC3 — Exportación de datos**
- Dado que solicito la exportación de mis datos
- Cuando el sistema procesa la solicitud
- Entonces recibo por email un archivo JSON con todos mis datos personales
- Y el email se envía mediante Resend en el mismo request (MVP — sin cola asíncrona)

**AC4 — Banner de consentimiento de cookies**
- Dado que accedo a Artelier por primera vez (sin cookie de preferencia)
- Cuando la página carga
- Entonces aparece el banner de consentimiento con opciones: "Aceptar todas" / "Solo necesarias"
- Y mi elección queda guardada en la cookie `artelier-cookie-consent` válida 12 meses
- Y el banner desaparece al hacer cualquier elección

## Tasks/Subtasks

- [ ] T1: Actualizar `getServerSession()` para devolver el sessionToken
  - [ ] T1.1: Modificar `src/server/auth/session.ts` — añadir `sessionToken` al objeto devuelto

- [ ] T2: Página `/account/settings` con formulario de cambio de contraseña
  - [ ] T2.1: Crear `src/app/(buyer)/account/settings/page.tsx` — Server Component protegido
  - [ ] T2.2: Crear `src/components/account/ChangePasswordForm.tsx` — Client Component con formulario
  - [ ] T2.3: Crear schema Zod `changePasswordSchema` en `src/lib/validations/auth.ts`
  - [ ] T2.4: Crear Server Action `changePassword` en `src/app/(buyer)/account/settings/actions.ts`
  - [ ] T2.5: Añadir enlace "Configuración" desde `/account` hacia `/account/settings`

- [ ] T3: Eliminación de cuenta
  - [ ] T3.1: Crear `src/components/account/DeleteAccountForm.tsx` — Client Component con confirmación por contraseña
  - [ ] T3.2: Crear Server Action `deleteAccount` en `src/app/(buyer)/account/settings/actions.ts`

- [ ] T4: Exportación de datos
  - [ ] T4.1: Crear Server Action `requestDataExport` en `src/app/(buyer)/account/settings/actions.ts`
  - [ ] T4.2: Crear email template `src/lib/resend/DataExportEmail.tsx`

- [ ] T5: Banner de consentimiento de cookies
  - [ ] T5.1: Crear `src/components/CookieBanner.tsx` — Client Component
  - [ ] T5.2: Añadir `<CookieBanner />` a `src/app/layout.tsx` dentro del NextIntlClientProvider

- [ ] T6: i18n — añadir claves a `es.json`

- [ ] T7: Verificación — typecheck + build

## Dev Notes

### Contexto de archivos existentes

**`src/server/auth/session.ts` — MODIFICAR**
Actualmente devuelve `{ user: row.user }` pero NO devuelve el `sessionToken`. Para AC1 (invalidar sesiones excepto la actual) necesitamos el token de la sesión activa. Hay que añadirlo al objeto de retorno:

```typescript
// ANTES
return { user: row.user };

// DESPUÉS
return { user: row.user, sessionToken: token };
```

Todos los sitios que llaman a `getServerSession()` siguen funcionando — solo añadimos un campo nuevo, no cambiamos nada existente.

**`src/app/(buyer)/account/page.tsx` — MODIFICAR**
Añadir enlace a `/account/settings` al final de la página. Usar `Link` de next/link. Estilo: texto pequeño, color `--text-muted`, bajo el formulario existente.

**`src/app/layout.tsx` — MODIFICAR**
Añadir `<CookieBanner />` como último hijo dentro del `NextIntlClientProvider`.

### Rutas y estructura de archivos

```
src/server/auth/session.ts                           ← UPDATE: añadir sessionToken al return
src/app/(buyer)/account/page.tsx                     ← UPDATE: enlace a /settings
src/app/(buyer)/account/settings/page.tsx            ← NEW: página de configuración
src/app/(buyer)/account/settings/actions.ts          ← NEW: changePassword, deleteAccount, requestDataExport
src/components/account/ChangePasswordForm.tsx        ← NEW: formulario cambio contraseña (client)
src/components/account/DeleteAccountForm.tsx         ← NEW: formulario eliminar cuenta (client)
src/lib/validations/auth.ts                          ← UPDATE: añadir changePasswordSchema
src/lib/resend/DataExportEmail.tsx                   ← NEW: template email exportación
src/components/CookieBanner.tsx                      ← NEW: banner cookies (client)
src/app/layout.tsx                                   ← UPDATE: añadir CookieBanner
src/i18n/messages/es.json                            ← UPDATE: claves settings y cookies
```

### Patrones establecidos en historias anteriores

**Session helper:**
```typescript
import { getServerSession } from "~/server/auth/session";
const session = await getServerSession();
if (!session?.user) redirect("/login");
```

**Server Actions:**
```typescript
"use server";
import { getServerSession } from "~/server/auth/session";
// Siempre verificar sesión primero
// Validar con Zod
// Devolver { error: { code: "..." } } o { success: true }
```

**Páginas protegidas (patrón):**
```typescript
// src/app/(buyer)/account/settings/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "~/server/auth/session";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  // ...
}
```

**Estilo visual (sistema de diseño acordado):**
- Layout: `<main className="min-h-screen bg-[--bg] px-4 py-8">`
- Contenedor: `<div className="mx-auto max-w-lg space-y-6">`
- Títulos: `font-display text-2xl text-[--text]`
- Botón primario: `bg-[#c4956a] text-white rounded-full px-4 py-2 text-sm font-medium`
- Botón destructivo (eliminar): `bg-red-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-red-700`

### Server Action: changePassword

```typescript
"use server";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { getServerSession } from "~/server/auth/session";

export async function changePassword(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" } };

  // 1. Validar con Zod (currentPassword, newPassword)
  // 2. Verificar que currentPassword es correcta con bcrypt.compare
  // 3. Hash nueva contraseña con bcrypt cost 12
  // 4. Actualizar password en DB
  // 5. Eliminar TODAS las sesiones del usuario EXCEPTO la actual
  await db.session.deleteMany({
    where: {
      userId: session.user.id,
      NOT: { sessionToken: session.sessionToken }, // sessionToken viene de getServerSession()
    },
  });
  return { success: true };
}
```

### Server Action: deleteAccount

```typescript
export async function deleteAccount(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" } };

  // 1. Validar contraseña con Zod { password: string }
  // 2. Verificar contraseña con bcrypt.compare
  // 3. Anonimizar en una transacción:
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        name: null,
        email: `deleted_${session.user.id}@artelier.deleted`,
        image: null,
        bannerImage: null,
        bio: null,
        password: null,
        deletedAt: new Date(),
      },
    });
    // 4. Eliminar TODAS las sesiones
    await tx.session.deleteMany({ where: { userId: session.user.id } });
  });
  // 5. Borrar la cookie de sesión
  // 6. redirect("/")
}
```

### Server Action: requestDataExport

```typescript
import { resend, FROM_EMAIL } from "~/lib/resend";

export async function requestDataExport() {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" } };

  // Recopilar todos los datos del usuario
  const userData = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      buyerOrders: true,
      follows: true,
      // solo datos personales — no include de artisan orders de terceros
    },
  });

  // Enviar email con JSON como adjunto via Resend
  await resend.emails.send({
    from: FROM_EMAIL,
    to: session.user.email!,
    subject: "Tus datos de Artelier",
    react: <DataExportEmail name={session.user.name} />,
    attachments: [{
      filename: "mis-datos-artelier.json",
      content: Buffer.from(JSON.stringify(userData, null, 2)).toString("base64"),
    }],
  });

  return { success: true };
}
```

### Cookie Banner

Cookie de preferencia: `artelier-cookie-consent`
Valores posibles: `"all"` | `"necessary"`
Expiración: 12 meses desde la elección

```typescript
"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((c) => c.startsWith("artelier-cookie-consent="));
    if (!consent) setVisible(true);
  }, []);

  function accept(value: "all" | "necessary") {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `artelier-cookie-consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // Banner fijo en la parte inferior
    // Dos botones: "Aceptar todas" → accept("all"), "Solo necesarias" → accept("necessary")
  );
}
```

**El banner NO usa `useTranslations()`** — es un client component que renderiza antes de que el contexto de i18n esté disponible en algunos casos. Usar strings directas en español.

### Validación Zod — changePasswordSchema

```typescript
// Añadir a src/lib/validations/auth.ts
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Introduce tu contraseña actual"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
```

### Email template DataExportEmail

Usar `@react-email/components`. El email debe:
- Tener un cuerpo explicativo en español ("Aquí tienes tus datos personales de Artelier")
- El adjunto JSON se genera en la Server Action, el template solo es el cuerpo del email

```typescript
// src/lib/resend/DataExportEmail.tsx
import { Html, Head, Body, Text } from "@react-email/components";

export function DataExportEmail({ name }: { name: string | null }) {
  return (
    <Html>
      <Head />
      <Body>
        <Text>Hola {name ?? "usuaria"},</Text>
        <Text>
          Adjuntamos el archivo JSON con todos tus datos personales registrados en Artelier,
          tal como lo solicita el RGPD.
        </Text>
        <Text>Si tienes alguna pregunta, responde a este email.</Text>
        <Text>El equipo de Artelier</Text>
      </Body>
    </Html>
  );
}
```

### Claves i18n a añadir en es.json

```json
"settings": {
  "title": "Configuración",
  "changePassword": "Cambiar contraseña",
  "currentPassword": "Contraseña actual",
  "newPassword": "Nueva contraseña",
  "confirmPassword": "Confirmar contraseña",
  "passwordChanged": "Contraseña actualizada. Las demás sesiones han sido cerradas.",
  "wrongPassword": "La contraseña actual no es correcta",
  "deleteAccount": "Eliminar cuenta",
  "deleteAccountWarning": "Esta acción es irreversible. Tus datos se anonimizarán permanentemente.",
  "confirmWithPassword": "Confirma con tu contraseña para continuar",
  "accountDeleted": "Cuenta eliminada",
  "exportData": "Exportar mis datos",
  "exportDataDescription": "Recibirás un email con todos tus datos en formato JSON.",
  "exportRequested": "Email enviado. Revisa tu bandeja de entrada."
}
```

### Modelo User — campos que se anonimizan en AC2

```
name        → null
email       → `deleted_${user.id}@artelier.deleted`
image       → null
bannerImage → null
bio         → null
password    → null
deletedAt   → new Date()
```
El `id`, `role`, `createdAt` y datos de pedidos se mantienen por obligación legal (retención 5 años según arquitectura).

### Protección de ruta

`/account/settings` está bajo `(buyer)/` pero aplica a cualquier usuario autenticado (compradora o artesana). El middleware actual no restringe `/account/*` por rol — solo requiere autenticación, que validamos con `getServerSession()` en la página.

## Dev Agent Record

### Debug Log
_vacío_

### Completion Notes
_vacío_

## File List
_vacío — se completa durante la implementación_

## Change Log
_vacío_
