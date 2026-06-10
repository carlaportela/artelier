# Historia 4.2: Enviar y recibir mensajes con polling

Status: ready-for-dev

## Story

Como artesana o compradora,
quiero enviar mensajes de texto y ver los mensajes nuevos en tiempo casi real,
para mantener una conversación fluida sin recargar la página manualmente.

## Acceptance Criteria

**AC1 — Polling automático cada 5 segundos**
- **Dado** que estoy en una conversación activa con la pestaña en primer plano
- **Cuando** han pasado 5 segundos desde la última actualización
- **Entonces** se hace automáticamente `GET /api/messages/[conversationId]?since=<timestamp>`
- **Y** los mensajes nuevos aparecen al final sin recargar la página

**AC2 — Polling pausado en segundo plano**
- **Dado** que cambio de pestaña o minimizo el navegador
- **Cuando** la Page Visibility API detecta que la pestaña está en segundo plano
- **Entonces** el polling se pausa automáticamente
- **Y** se reanuda al volver a la pestaña

**AC3 — Envío con optimistic update**
- **Dado** que escribo un mensaje y pulso "Enviar" (o Enter)
- **Cuando** el mensaje se procesa
- **Entonces** aparece en la conversación de forma inmediata (optimistic update)
- **Y** se guarda en la base de datos vía `POST /api/messages/[conversationId]`
- **Y** si el envío falla, el mensaje se marca visualmente con error y aparece un botón "Reintentar"

**AC4 — Rate limiting en endpoints de mensajes**
- **Dado** que el endpoint recibe más de 30 requests por minuto desde la misma IP
- **Cuando** el rate limiter evalúa la request
- **Entonces** devuelve `429 Too Many Requests` con el header `Retry-After: 60`

**AC5 — Interfaz de chat funcional para compradora**
- **Dado** que soy compradora y abro `/messages/[conversationId]`
- **Cuando** la página carga
- **Entonces** veo los últimos 30 mensajes en orden cronológico
- **Y** el área de texto está habilitada y puedo escribir y enviar mensajes

**AC6 — Interfaz de chat funcional para artesana**
- **Dado** que soy artesana y accedo a `/studio/mensajes`
- **Cuando** la página carga
- **Entonces** veo la lista de mis conversaciones con compradoras (mismo formato que la compradora)
- **Y** puedo abrir `/studio/mensajes/[conversationId]` y enviar mensajes

**AC7 — updatedAt de Conversation se actualiza al enviar**
- **Dado** que se crea un mensaje nuevo en una conversación
- **Cuando** el POST se completa con éxito
- **Entonces** el campo `updatedAt` de la `Conversation` se actualiza
- **Y** la conversación sube al principio de la lista de `/messages` y `/studio/mensajes`

## Tasks / Subtasks

- [ ] T1 — API: GET mensajes (polling + carga inicial)
  - [ ] T1.1: Crear `src/app/api/messages/[conversationId]/route.ts` con handler `GET`:
    - Sesión → 401 si no autenticada; verificar que el usuario es participante → 403 si no
    - Rate limiting con `messageLimiter` por IP
    - Si `?since=<timestamp>`: `db.message.findMany` donde `createdAt > new Date(since)`, `deletedAt: null`, `orderBy: createdAt asc`
    - Si no hay `since` (carga inicial del cliente): últimos 30 mensajes (`take: 30`, `orderBy: createdAt desc` → invertir antes de devolver)
    - Incluir `sender: { select: { id, name, image } }` en ambos casos
    - Devolver `{ data: Message[] }`

- [ ] T2 — API: POST mensaje
  - [ ] T2.1: Añadir handler `POST` al mismo `src/app/api/messages/[conversationId]/route.ts`:
    - Sesión → 401; participante → 403
    - Rate limiting con `messageLimiter` por IP
    - Recibir `{ content: string }`, validar que no es vacío → 400 si falta
    - `db.message.create` con `{ conversationId, senderId: userId, content }`
    - Inmediatamente después: `db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })` para mantener el orden de la lista
    - Devolver `{ data: message }`

- [ ] T3 — Componente MessageArea (corazón del chat)
  - [ ] T3.1: Crear `src/components/MessageArea.tsx` como Client Component (`"use client"`):
    - Props: `{ conversationId: string; userId: string; initialMessages: MessageWithSender[] }`
    - Estado: `messages` (array), `input` (string), `sending` (boolean)
    - Al montar: inicializar `messages` con `initialMessages`; guardar el `id` del último mensaje como `lastMessageId` ref
    - **Polling**: `useEffect` con `setInterval(poll, 5000)`:
      - `poll()`: llama `GET /api/messages/[id]?since=<createdAt del último mensaje>` → añade los nuevos al final del array
      - **Page Visibility**: `document.addEventListener('visibilitychange', ...)` → si `document.hidden`, limpiar el interval; si vuelve, crear nuevo interval
      - Cleanup en return del useEffect: `clearInterval` + `removeEventListener`
    - **Scroll automático**: ref `bottomRef` en un `<div>` al final de la lista → `bottomRef.current?.scrollIntoView()` cada vez que `messages` cambia
    - **Envío optimista**:
      1. Al pulsar Enviar: crear objeto `tempMsg` con `id: "temp-${Date.now()}"`, `content`, `senderId: userId`, `status: "sending"` → añadir a `messages`
      2. Limpiar el input inmediatamente
      3. `POST /api/messages/[id]` con `{ content }`
      4. Si ok: reemplazar `tempMsg` en el array con el mensaje real devuelto por la API (con `id` real)
      5. Si falla: marcar `tempMsg` con `status: "error"`
    - **Render de mensajes**: burbujas con alineación derecha si `msg.senderId === userId`, izquierda si no; si `status === "error"` mostrar borde rojo + botón "Reintentar"; timestamps con `<time>` legible
    - **Input**: `<textarea>` de una línea que crece (o `<input type="text">`), deshabilitado mientras `sending`; Enter envía (shift+Enter nueva línea si textarea)

- [ ] T4 — Actualizar página de conversación de compradora
  - [ ] T4.1: Modificar `src/app/(buyer)/messages/[conversationId]/page.tsx`:
    - Añadir query de los últimos 30 mensajes en el Server Component (con `sender` incluido)
    - Reemplazar el área de mensajes placeholder y el input deshabilitado por `<MessageArea conversationId={conversationId} userId={userId} initialMessages={messages} />`
    - Conservar todo el encabezado existente (BackButton, avatar, nombre, link al perfil)
    - Conservar `<ConversationReadMarker />` (sigue siendo necesario)

- [ ] T5 — Implementar mensajes en el studio de la artesana
  - [ ] T5.1: Modificar `src/app/(artisan)/studio/mensajes/page.tsx`:
    - Añadir query `db.conversation.findMany` (mismo patrón que `src/app/(buyer)/messages/page.tsx`)
    - Renderizar lista de conversaciones con el mismo diseño: PaletteAvatar, nombre, último mensaje, timestamp, punto de no leídos
    - Link a `/studio/mensajes/[id]` (no a `/messages/[id]`)
    - Empty state: "Tus conversaciones con compradoras aparecerán aquí"
  - [ ] T5.2: Crear `src/app/(artisan)/studio/mensajes/[conversationId]/page.tsx`:
    - Misma estructura que la página de compradora: Server Component, carga conversación + 30 mensajes
    - Verificar que el usuario es artesana participante → `notFound()` si no
    - Calcular `otherUser` (el buyer)
    - Encabezado: BackButton hacia `/studio/mensajes` + avatar + nombre de la compradora
    - Renderizar `<MessageArea conversationId={conversationId} userId={userId} initialMessages={messages} />`
    - `<ConversationReadMarker conversationId={conversationId} />`

- [ ] T6 — Typecheck y build
  - [ ] T6.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T6.2: `npm run build` — debe pasar sin errores

## Dev Notes

### Estructura de archivos

```
src/app/api/messages/[conversationId]/route.ts     ← NUEVO: GET (polling) + POST (enviar)
src/components/MessageArea.tsx                      ← NUEVO: Client Component — corazón del chat
src/app/(buyer)/messages/[conversationId]/page.tsx ← ACTUALIZADO: añadir MessageArea
src/app/(artisan)/studio/mensajes/page.tsx          ← ACTUALIZADO: lista de conversaciones
src/app/(artisan)/studio/mensajes/[conversationId]/page.tsx ← NUEVO: conversación artesana
```

### Tipo MessageWithSender

Definir en el mismo `MessageArea.tsx` o en un archivo de tipos compartido:

```typescript
type MessageWithSender = {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  sender: { id: string; name: string | null; image: string | null };
  status?: "sending" | "error"; // solo para mensajes optimistas locales
};
```

### Patrón de rate limiting (ya existe en src/lib/ratelimit.ts)

```typescript
import { messageLimiter } from "~/lib/ratelimit";
import { headers } from "next/headers";

const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
const { success } = await messageLimiter.limit(ip);
if (!success) {
  return NextResponse.json(
    { error: { code: "RATE_LIMITED", message: "Demasiadas peticiones" } },
    { status: 429, headers: { "Retry-After": "60" } }
  );
}
```

El `messageLimiter` ya está exportado en `src/lib/ratelimit.ts` como sliding window de 30 req/60s.

### Patrón de sesión y verificación de participante

```typescript
const session = await getServerSession();
if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const userId = session.user.id;

const conversation = await db.conversation.findUnique({
  where: { id: conversationId, deletedAt: null },
  select: { buyerId: true, artisanId: true },
});
if (!conversation || (conversation.buyerId !== userId && conversation.artisanId !== userId)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Query de carga inicial de mensajes (en Server Component)

```typescript
const messages = await db.message.findMany({
  where: { conversationId, deletedAt: null },
  orderBy: { createdAt: "desc" },
  take: 30,
  include: { sender: { select: { id: true, name: true, image: true } } },
});
// Invertir para orden cronológico (el más antiguo arriba)
const initialMessages = messages.reverse();
```

### Polling con Page Visibility API

```typescript
useEffect(() => {
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function poll() {
    const last = messagesRef.current.at(-1);
    if (!last) return;
    const res = await fetch(
      `/api/messages/${conversationId}?since=${encodeURIComponent(new Date(last.createdAt).toISOString())}`
    );
    if (!res.ok) return;
    const { data } = await res.json() as { data: MessageWithSender[] };
    if (data.length > 0) setMessages(prev => [...prev, ...data]);
  }

  function startPolling() {
    intervalId = setInterval(() => void poll(), 5000);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    } else {
      startPolling();
    }
  }

  startPolling();
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    if (intervalId) clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [conversationId]);
```

Nota: usar una `ref` para acceder al último mensaje dentro del intervalo (los closures de `setInterval` no ven el estado actualizado de React):
```typescript
const messagesRef = useRef(messages);
useEffect(() => { messagesRef.current = messages; }, [messages]);
```

### Envío optimista

```typescript
async function handleSend() {
  if (!input.trim() || sending) return;
  const content = input.trim();
  const tempId = `temp-${Date.now()}`;
  const tempMsg: MessageWithSender = {
    id: tempId,
    content,
    senderId: userId,
    createdAt: new Date().toISOString(),
    sender: currentUser, // pasar currentUser como prop desde la página
    status: "sending",
  };
  setMessages(prev => [...prev, tempMsg]);
  setInput("");
  setSending(true);
  try {
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const { data: realMsg } = await res.json() as { data: MessageWithSender };
      setMessages(prev => prev.map(m => m.id === tempId ? { ...realMsg } : m));
    } else {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "error" } : m));
    }
  } catch {
    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "error" } : m));
  } finally {
    setSending(false);
  }
}
```

### Scroll automático al último mensaje

```typescript
const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

// En el render, al final de la lista:
<div ref={bottomRef} />
```

### Estilo de burbujas de chat

Mensajes propios (derecha):
```tsx
<div className="flex justify-end">
  <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[#3d5a4f] px-4 py-2 text-sm text-white">
    {msg.content}
  </div>
</div>
```

Mensajes de la otra parte (izquierda):
```tsx
<div className="flex justify-start gap-2">
  <PaletteAvatar src={msg.sender.image} name={msg.sender.name} className="h-7 w-7 shrink-0 mt-1" fillColor="#c4956a" />
  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-[--surface] px-4 py-2 text-sm text-[--text]">
    {msg.content}
  </div>
</div>
```

Mensaje con error:
```tsx
<div className="flex justify-end">
  <div className="flex items-center gap-2">
    <button onClick={() => handleRetry(msg)} className="text-xs text-red-500 underline">Reintentar</button>
    <div className="max-w-[75%] rounded-2xl rounded-br-sm border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 opacity-70">
      {msg.content}
    </div>
  </div>
</div>
```

### updatedAt de Conversation — crítico para el orden de la lista

Cuando se crea un mensaje, actualizar también la conversación. Esto garantiza que la lista de conversaciones en `/messages` y `/studio/mensajes` siga ordenada por actividad reciente:

```typescript
await Promise.all([
  db.message.create({ data: { conversationId, senderId: userId, content } }),
  db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
]);
```

### Diferencia de layout entre compradora y artesana

| | Compradora | Artesana |
|---|---|---|
| Lista | `/messages` | `/studio/mensajes` |
| Chat | `/messages/[id]` | `/studio/mensajes/[id]` |
| Back button | → `/messages` | → `/studio/mensajes` |
| Verificación de rol | sesión cualquiera (buyer o artisan) siempre que sea participante | igual |

El componente `MessageArea` es compartido — recibe `conversationId`, `userId`, `initialMessages`, `currentUser`. No sabe nada del layout que lo envuelve.

### ConversationReadMarker — sigue siendo necesario

La página de conversación (tanto buyer como artisan) sigue usando `<ConversationReadMarker />` de H4.1. No hay que tocarlo.

### Schema Message — campos disponibles

```prisma
model Message {
  id             String    @id @default(cuid())
  conversationId String
  senderId       String
  content        String    ← texto del mensaje
  imageUrl       String?   ← null en H4.2 (se usa en H4.3)
  readAt         DateTime? ← null = no leído
  deletedAt      DateTime?
  createdAt      DateTime  @default(now())
}
```

En H4.2 solo usamos `content`. `imageUrl` se usa en H4.3 para adjuntos de imagen.

## Dev Agent Record

### Completion Notes
(Rellenar al finalizar la historia)

### Debug Log
(Rellenar si se producen errores durante la implementación)

## File List
(Rellenar con los archivos creados/modificados al finalizar)

## Change Log
(Rellenar al finalizar la historia)
