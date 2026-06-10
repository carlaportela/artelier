# Historia 4.1: Iniciar y gestionar conversaciones

Status: done

## Story

Como compradora,
quiero iniciar una conversación privada con una artesana desde su perfil o desde un producto,
para coordinar un encargo personalizado o hacer preguntas antes de comprar.

## Acceptance Criteria

**AC1 — Botón "Enviar mensaje" en perfil de artesana y detalle de producto**
- **Dado** que soy compradora autenticada y visito el perfil de una artesana o el detalle de un producto
- **Cuando** veo la página
- **Entonces** aparece un botón "Enviar mensaje" (solo visible para compradoras autenticadas)
- **Y** al pulsarlo, si ya existe una conversación previa entre nosotras, se abre la existente sin crear un duplicado
- **Y** si no existe, se crea una nueva conversación y se navega a ella

**AC2 — Página /messages con lista de conversaciones**
- **Dado** que accedo a `/messages`
- **Cuando** la página carga
- **Entonces** veo la lista de todas mis conversaciones ordenadas por última actividad (más reciente primero)
- **Y** cada conversación muestra: avatar + nombre de la otra parte, último mensaje truncado y timestamp relativo

**AC3 — Empty state de /messages**
- **Dado** que accedo a `/messages` y no tengo conversaciones
- **Cuando** la página carga
- **Entonces** veo el mensaje: "Tus conversaciones con artesanas aparecerán aquí"

**AC4 — Indicador de mensajes no leídos**
- **Dado** que tengo mensajes no leídos en una conversación
- **Cuando** veo la lista de conversaciones
- **Entonces** esa conversación aparece con un indicador de no leído (punto color primario)
- **Y** el indicador desaparece al abrir la conversación

**AC5 — /messages protegida por autenticación**
- **Dado** que no estoy autenticada
- **Cuando** intento acceder a `/messages` o `/messages/[id]`
- **Entonces** soy redirigida a `/login`

**AC6 — Vista básica de conversación en /messages/[conversationId]**
- **Dado** que abro una conversación desde la lista
- **Cuando** la página carga
- **Entonces** veo el nombre y avatar de la artesana en el encabezado
- **Y** los mensajes no leídos de esa conversación quedan marcados como leídos
- **Y** el área de mensajes queda preparada (vacía, sin envío — eso es H4.2)

## Tasks / Subtasks

- [ ] T1 — Proteger /messages en el middleware
  - [ ] T1.1: En `src/middleware.ts`, añadir: si `pathname.startsWith("/messages") && !isLoggedIn` → redirigir a `/login`

- [ ] T2 — API: findOrCreate conversación
  - [ ] T2.1: Crear `src/app/api/conversations/route.ts` con handler `POST`:
    - Obtener sesión con `getServerSession()` → 401 si no autenticada
    - Recibir `{ artisanId: string }` en el body (validar que es string, devolver 400 si falta)
    - Usar `db.conversation.upsert` con `where: { buyerId_artisanId: { buyerId: userId, artisanId } }`, `create: { buyerId: userId, artisanId }`, `update: {}`
    - Devolver `{ data: { conversationId: string } }`

- [ ] T3 — API: listar conversaciones del usuario actual
  - [ ] T3.1: Añadir handler `GET` al mismo `src/app/api/conversations/route.ts`:
    - Obtener sesión → 401 si no autenticada
    - `db.conversation.findMany` donde `OR: [{ buyerId: userId }, { artisanId: userId }]` y `deletedAt: null`
    - Incluir: buyer y artisan `{ id, name, image }`, último mensaje (take: 1, orderBy createdAt desc, where deletedAt null), conteo de no leídos via `_count: { select: { messages: { where: { senderId: { not: userId }, readAt: null, deletedAt: null } } } }`
    - Ordenar por `updatedAt: "desc"`
    - Transformar cada conversación para calcular `otherUser` (el participante que NO es el usuario actual) y devolver array con forma: `{ id, otherUser: { id, name, image }, lastMessage: { content, createdAt } | null, unreadCount: number }`

- [ ] T4 — API: marcar conversación como leída
  - [ ] T4.1: Crear `src/app/api/conversations/[conversationId]/read/route.ts` con handler `PATCH`:
    - Obtener sesión → 401 si no autenticada
    - Verificar que el usuario es participante de la conversación (`buyerId === userId OR artisanId === userId`) → 403 si no
    - `db.message.updateMany` donde `conversationId`, `senderId: { not: userId }`, `readAt: null`, `deletedAt: null` → `{ readAt: new Date() }`
    - Devolver `{ data: { updated: number } }`

- [ ] T5 — Componente cliente SendMessageButton
  - [ ] T5.1: Crear `src/components/SendMessageButton.tsx`:
    - `"use client"`, props: `{ artisanId: string }`
    - Estado `loading` con `useState(false)`
    - `handleClick`: llama `POST /api/conversations` con `{ artisanId }`, si `res.ok` navega a `/messages/${data.conversationId}` con `useRouter().push()`
    - Renderizar botón con estilos de secundario (borde verde: `border border-[#3d5a4f] text-[#3d5a4f] hover:bg-[#3d5a4f]/10`) — el "Comprar" es el CTA primario, "Enviar mensaje" es el secundario
    - Deshabilitar el botón mientras `loading === true`, texto "Abriendo..." durante carga

- [ ] T6 — Componente cliente ConversationReadMarker
  - [ ] T6.1: Crear `src/components/ConversationReadMarker.tsx`:
    - `"use client"`, props: `{ conversationId: string }`
    - `useEffect` sin dependencias más que `conversationId`: llama `PATCH /api/conversations/${conversationId}/read`
    - No renderiza nada visible (`return null`)

- [ ] T7 — Página /messages (lista de conversaciones)
  - [ ] T7.1: Crear `src/app/(buyer)/messages/page.tsx`:
    - Server Component, obtener sesión → redirigir a `/login` si no autenticada
    - Llamar `GET /api/conversations` (o consultar la BD directamente para evitar fetch interno)
    - Renderizar lista de conversaciones con: avatar (`PaletteAvatar`), nombre, último mensaje truncado (`line-clamp-1`), timestamp relativo (usar `Intl.RelativeTimeFormat` o `date-fns`)
    - Punto de color (`bg-[#3d5a4f] w-2 h-2 rounded-full`) cuando `unreadCount > 0`
    - Empty state si no hay conversaciones: icono `MessageCircle` de lucide-react + texto "Tus conversaciones con artesanas aparecerán aquí"
    - Cada item es un `<Link href="/messages/[id]">` clickable
    - Metadata: `title: "Mis mensajes — Artelier"`

- [ ] T8 — Página /messages/[conversationId] (vista básica)
  - [ ] T8.1: Crear `src/app/(buyer)/messages/[conversationId]/page.tsx`:
    - Server Component, obtener sesión → redirigir a `/login` si no autenticada
    - Cargar conversación con participantes (buyer y artisan); si no existe o el usuario no es participante → `notFound()`
    - Calcular `otherUser` (el participante que no es el usuario actual)
    - Renderizar encabezado: `<BackButton />` + avatar + nombre de `otherUser` + link a su perfil
    - Incluir `<ConversationReadMarker conversationId={conversationId} />` para marcar mensajes como leídos
    - Área de mensajes vacía con placeholder (comentario `// TODO H4.2: mensajes y polling`)
    - Input de texto deshabilitado con placeholder "Responder..." (comentario `// TODO H4.2: envío de mensajes`)

- [ ] T9 — Wiring "Enviar mensaje" en detalle de producto
  - [ ] T9.1: Leer `src/app/(buyer)/product/[id]/page.tsx` (ya leído — el botón placeholder existe en líneas 184-190)
  - [ ] T9.2: Reemplazar el `<button type="button">Enviar mensaje</button>` (líneas 184-190) por `<SendMessageButton artisanId={product.artisan.id} />`
  - [ ] T9.3: Añadir import de `SendMessageButton` al principio del archivo

- [ ] T10 — Añadir "Enviar mensaje" en perfil de artesana
  - [ ] T10.1: Leer `src/components/artisan/ArtisanHeader.tsx` completo para entender su estructura y props
  - [ ] T10.2: Añadir `<SendMessageButton artisanId={artisan.id} />` junto al botón "Seguir" en el perfil, visible solo cuando `isBuyer === true` (el perfil ya tiene esta variable en `src/app/(buyer)/artisan/[id]/page.tsx` línea 66)
  - [ ] T10.3: Si ArtisanHeader acepta la prop adecuada, pasar el botón desde la página; si no, adaptar para incluirlo

- [ ] T11 — Typecheck y build
  - [ ] T11.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T11.2: `npm run build` — debe pasar sin errores

## Dev Notes

### Estructura de archivos

```
src/middleware.ts                                              ← ACTUALIZADO: /messages → /login si no autenticada
src/app/api/conversations/route.ts                            ← NUEVO: POST findOrCreate + GET lista
src/app/api/conversations/[conversationId]/read/route.ts      ← NUEVO: PATCH marcar como leído
src/app/(buyer)/messages/page.tsx                             ← NUEVO: lista de conversaciones
src/app/(buyer)/messages/[conversationId]/page.tsx            ← NUEVO: vista básica de conversación
src/components/SendMessageButton.tsx                          ← NUEVO: Client Component botón
src/components/ConversationReadMarker.tsx                     ← NUEVO: Client Component marca leído
src/app/(buyer)/product/[id]/page.tsx                         ← ACTUALIZADO: wiring del botón placeholder
src/components/artisan/ArtisanHeader.tsx                      ← POSIBLEMENTE ACTUALIZADO: botón en perfil
```

### Modelos de BD (ya definidos en `prisma/schema.prisma`)

**Conversation:**
```prisma
model Conversation {
  id        String    @id @default(cuid())
  buyerId   String
  artisanId String
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  buyer    User      @relation("BuyerConversations", ...)
  artisan  User      @relation("ArtisanConversations", ...)
  messages Message[]

  @@unique([buyerId, artisanId])  // ← garantiza no duplicados, genera buyerId_artisanId
}
```

**Message:**
```prisma
model Message {
  id             String    @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  imageUrl       String?
  readAt         DateTime?  // ← null = no leído
  deletedAt      DateTime?
  createdAt      DateTime   @default(now())
}
```

### findOrCreate con Prisma upsert

El `@@unique([buyerId, artisanId])` genera automáticamente el campo compuesto `buyerId_artisanId`:

```typescript
const conversation = await db.conversation.upsert({
  where: { buyerId_artisanId: { buyerId: session.user.id, artisanId } },
  create: { buyerId: session.user.id, artisanId },
  update: {}, // sin cambios si ya existe
  select: { id: true },
});
return NextResponse.json({ data: { conversationId: conversation.id } });
```

### Patrón de sesión (igual que en el resto del proyecto)

```typescript
import { getServerSession } from "~/server/auth/session";
import { NextResponse } from "next/server";

const session = await getServerSession();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = session.user.id;
```

### Calcular unreadCount con _count anidado (Prisma 6.x)

Prisma 6.6.0 (la versión instalada) soporta `_count.select` con cláusula `where` anidada:

```typescript
const conversations = await db.conversation.findMany({
  where: {
    OR: [{ buyerId: userId }, { artisanId: userId }],
    deletedAt: null,
  },
  include: {
    buyer: { select: { id: true, name: true, image: true } },
    artisan: { select: { id: true, name: true, image: true } },
    messages: {
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 1,
    },
    _count: {
      select: {
        messages: {
          where: { senderId: { not: userId }, readAt: null, deletedAt: null },
        },
      },
    },
  },
  orderBy: { updatedAt: "desc" },
});

// Transformar para el response:
return conversations.map((conv) => ({
  id: conv.id,
  otherUser: conv.buyerId === userId ? conv.artisan : conv.buyer,
  lastMessage: conv.messages[0] ?? null,
  unreadCount: conv._count.messages,
}));
```

### updatedAt y orden de conversaciones

`updatedAt` se gestiona automáticamente por Prisma (`@updatedAt`). Cuando H4.2 implemente el envío de mensajes, **debe** también tocar `updatedAt` de la conversación para que el orden de la lista siga siendo correcto:

```typescript
// En H4.2, al crear un mensaje:
await db.conversation.update({
  where: { id: conversationId },
  data: { updatedAt: new Date() },
});
```

### Layout para /messages: por qué (buyer)

`/messages` y `/messages/[conversationId]` van en el route group `(buyer)` porque:
- La historia es "Como compradora"
- El layout buyer tiene AppHeader + AppFooter + `force-dynamic` (correcto para mensajes que cambian frecuentemente)
- Las artesanas acceden a sus mensajes via `src/app/(artisan)/studio/mensajes/page.tsx` (existe como placeholder "Próximamente" — H4.2 lo implementará)

### Botón "Enviar mensaje" en el detalle de producto

El botón ya existe como placeholder no funcional en `src/app/(buyer)/product/[id]/page.tsx` líneas 184-190:

```tsx
<button
  type="button"
  className="flex-1 cursor-pointer rounded-full border border-[#3d5a4f] py-3 text-sm font-medium text-[#3d5a4f] transition-colors hover:bg-[#3d5a4f]/10"
  aria-label="Enviar mensaje a la artesana"
>
  Enviar mensaje
</button>
```

T9.2 reemplaza este `<button>` con `<SendMessageButton artisanId={product.artisan.id} />`. El componente `SendMessageButton` ya tendrá los mismos estilos. La variable `product.artisan.id` ya está disponible en el mismo bloque.

### Visibilidad del botón en el perfil de artesana

La página de perfil de artesana `src/app/(buyer)/artisan/[id]/page.tsx` ya calcula (líneas 64-66):
```typescript
const isAuthenticated = !!session?.user;
const isOwnProfile = session?.user?.id === artisan.id;
const isBuyer = session?.user?.role === "BUYER";
```

El botón "Enviar mensaje" solo debe mostrarse cuando `isBuyer === true` (compradora autenticada). Las artesanas visitando el perfil de otra artesana NO deben ver el botón.

### Timestamp relativo para la lista de conversaciones

Para mostrar "hace 3 minutos", "ayer", etc., usar la API nativa de JS:

```typescript
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return minutes <= 1 ? "ahora" : `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "ayer" : `hace ${days} días`;
}
```

### Sin read receipts en tiempo real

La UX spec especifica explícitamente: *"Sin indicadores de 'visto' en tiempo real — la artesana trabaja en su taller"*. No hay doble tick azul, no hay typing indicator. Solo marcar como leído al abrir la conversación.

### Rate limiting

H4.1 no implementa rate limiting. El endpoint `POST /api/conversations` es de muy baja frecuencia (una vez por par buyer-artisan). El rate limiting se implementa en H4.2 para los endpoints de polling y envío de mensajes (30 req/min según la UX spec).

### Acceso directo a BD vs fetch interno en Server Components

En los Server Components de páginas (T7, T8), hacer la consulta directamente con `db` en lugar de hacer `fetch("/api/conversations")` para evitar overhead de red. Los route handlers API (`/api/conversations`) son para los Client Components (`SendMessageButton`, `ConversationReadMarker`).

### Componente PaletteAvatar

El proyecto ya tiene `src/components/PaletteAvatar.tsx` para avatares con fallback de iniciales. Usarlo en la lista de conversaciones para mantener consistencia:

```tsx
import PaletteAvatar from "~/components/PaletteAvatar";
<PaletteAvatar src={otherUser.image} name={otherUser.name} className="h-10 w-10 shrink-0" />
```

## Dev Agent Record

### Completion Notes
- Todos los ACs implementados y verificados con typecheck + build
- `params` como Promise es correcto para Next.js 15 — sugerencia de Sourcery ignorada
- `SendMessageButton` usa `toast` de sonner para errores (evita wrapper div que rompía flex-1)
- API `POST /api/conversations` restringida a rol BUYER (fix de seguridad post code review)
- Fix visual incluido en el mismo PR: BUMP_R 2.4→3.0 elimina costuras entre bumps del avatar galleta

### Debug Log
Sin errores durante la implementación.

## File List
- `src/middleware.ts` — añadida protección de /messages
- `src/app/api/conversations/route.ts` — nuevo: POST findOrCreate + GET lista
- `src/app/api/conversations/[conversationId]/read/route.ts` — nuevo: PATCH marcar como leída
- `src/components/SendMessageButton.tsx` — nuevo: botón cliente con manejo de errores
- `src/components/ConversationReadMarker.tsx` — nuevo: marca mensajes como leídos al abrir
- `src/app/(buyer)/messages/page.tsx` — nuevo: lista de conversaciones
- `src/app/(buyer)/messages/[conversationId]/page.tsx` — nuevo: vista básica de conversación
- `src/app/(buyer)/product/[id]/page.tsx` — actualizado: botón funcional
- `src/components/artisan/ArtisanHeader.tsx` — actualizado: SendMessageButton solo para compradoras
- `src/app/(buyer)/artisan/[id]/page.tsx` — actualizado: prop isBuyer pasada a ArtisanHeader
- `src/components/PaletteAvatar.tsx` — fix visual: COOKIE_R=9.0, BUMP_R=3.0
- `src/components/CropModal.tsx` — fix visual: mismos parámetros que PaletteAvatar
- `src/app/(artisan)/studio/profile/StudioProfileEditor.tsx` — fix visual: lápiz a la derecha

## Change Log
- 2026-06-09: Historia completada e integrada en main via squash merge
