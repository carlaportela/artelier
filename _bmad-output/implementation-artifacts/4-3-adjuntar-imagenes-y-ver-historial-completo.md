# Historia 4.3: Adjuntar imágenes y ver historial completo

Status: ready-for-dev

## Story

Como artesana o compradora,
quiero adjuntar imágenes en mis mensajes y ver el historial completo de una conversación,
para compartir fotos de referencias o del proceso de fabricación directamente en el chat.

## Acceptance Criteria

**AC1 — Adjuntar imagen en un mensaje**
- **Dado** que pulso el icono de adjuntar imagen en el chat
- **Cuando** selecciono una imagen de la galería (JPEG, PNG, WebP, GIF, máx. 10 MB)
- **Entonces** la imagen se sube a `POST /api/upload` con `type: "message"`
- **Y** aparece en la conversación como imagen inline clicable que abre en tamaño completo
- **Y** la URL de Cloudinary se guarda en el campo `imageUrl` del mensaje en la base de datos

**AC2 — Historial completo con scroll infinito hacia arriba**
- **Dado** que accedo a una conversación con más de 30 mensajes
- **Cuando** la página carga
- **Entonces** veo los últimos 30 mensajes con el scroll posicionado en el más reciente
- **Y** al hacer scroll hasta arriba del todo aparece un botón "Cargar más" (o se dispara automáticamente)
- **Y** los mensajes anteriores se insertan al principio de la lista sin perder la posición de scroll

**AC3 — Accesibilidad**
- **Dado** que la conversación contiene imágenes y texto
- **Cuando** un lector de pantalla navega por ella
- **Entonces** cada imagen tiene `alt` descriptivo ("Imagen enviada por [nombre]")
- **Y** cada mensaje tiene `<time dateTime={ISO}>` legible
- **Y** la lista de mensajes usa `<ol>` como landmark semántico correcto

## Tasks / Subtasks

- [ ] T1 — Ampliar `POST /api/upload` para mensajes
  - [ ] T1.1: Añadir `"message"` a `ALLOWED_TYPES` en `src/app/api/upload/route.ts`
  - [ ] T1.2: Añadir entrada en `FOLDER_MAP`: `message: "artelier/messages"`
  - [ ] T1.3: Añadir entrada en `TRANSFORMATION_MAP`: `message: [{ width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }]`
  - [ ] T1.4: Reducir límite de tamaño a 10 MB para type "message" (el resto siguen en 20 MB)

- [ ] T2 — Ampliar API GET mensajes para paginación hacia atrás
  - [ ] T2.1: En `src/app/api/messages/[conversationId]/route.ts`, añadir soporte para query param `?before=<ISO timestamp>`:
    - Si `before` presente: `findMany` donde `createdAt < new Date(before)`, `orderBy: createdAt desc`, `take: 30` → invertir antes de devolver
    - Validar `before` igual que `since` (comprobar `Number.isNaN` → 400 si inválido)
    - Devolver `{ data: messages, hasMore: boolean }` — `hasMore: true` si se devolvieron exactamente 30 mensajes

- [ ] T3 — Ampliar API POST para aceptar imageUrl
  - [ ] T3.1: En el handler `POST` de `src/app/api/messages/[conversationId]/route.ts`:
    - Aceptar `{ content?: string, imageUrl?: string }` en el body
    - Validar que al menos uno de los dos está presente y no es vacío → 400 si ambos vacíos
    - `content` sigue siendo opcional si hay `imageUrl`
    - Pasar `imageUrl` al `db.message.create`

- [ ] T4 — Actualizar MessageArea: adjuntar imagen
  - [ ] T4.1: Añadir botón de adjuntar (icono `ImageIcon` o `Paperclip` de lucide) junto al textarea en `src/components/MessageArea.tsx`
  - [ ] T4.2: Al pulsar, abrir `<input type="file" accept="image/*">` oculto via `ref.click()`
  - [ ] T4.3: Al seleccionar archivo: validar tipo (image/*) y tamaño (≤10 MB) en cliente antes de subir
  - [ ] T4.4: Subir con `POST /api/upload` (FormData con `file` + `type: "message"`) — mostrar estado de carga (spinner / deshabilitar input)
  - [ ] T4.5: Al completarse la subida: llamar a `sendMessage` con `{ imageUrl: url }` (sin content)
  - [ ] T4.6: Añadir `imageUrl` a `MessageWithSender` type (ya es `string | null` implícito — hacer explícito: `imageUrl?: string | null`)
  - [ ] T4.7: En el envío optimista, incluir `imageUrl` en el `tempMsg`

- [ ] T5 — Actualizar MessageArea: renderizado de imágenes
  - [ ] T5.1: En el render de cada mensaje: si `msg.imageUrl`, mostrar `<img>` dentro del bubble con `alt="Imagen enviada por [msg.sender.name ?? 'usuario']"`
  - [ ] T5.2: Imagen clicable — al pulsar abre en lightbox (modal overlay) o `window.open(url, "_blank")` (más simple)
  - [ ] T5.3: Estilo de imagen: `max-w-[200px] rounded-lg cursor-pointer object-cover` — si hay también `content`, imagen arriba + texto abajo dentro del mismo bubble

- [ ] T6 — Actualizar MessageArea: historial con scroll infinito
  - [ ] T6.1: Añadir estado `hasMore` (boolean, iniciar a `true` si `initialMessages.length === 30`) y `loadingMore` (boolean)
  - [ ] T6.2: Añadir botón "Cargar mensajes anteriores" al principio de la lista — visible solo si `hasMore && !loadingMore`
  - [ ] T6.3: Al pulsarlo: `GET /api/messages/[id]?before=<createdAt del primer mensaje>` → prepend al array de mensajes
  - [ ] T6.4: Preservar posición de scroll al insertar mensajes anteriores — guardar `scrollHeight` antes de prepend, restaurar `scrollTop += (newScrollHeight - oldScrollHeight)` después
  - [ ] T6.5: Si la respuesta devuelve `hasMore: false`, ocultar el botón definitivamente

- [ ] T7 — Typecheck y build
  - [ ] T7.1: `npm run typecheck` — debe pasar sin errores
  - [ ] T7.2: `npm run build` — debe pasar sin errores

## Dev Notes

### Archivos a modificar (ninguno nuevo salvo quizá un tipo compartido)

```
src/app/api/upload/route.ts                           ← ACTUALIZAR: añadir type "message"
src/app/api/messages/[conversationId]/route.ts        ← ACTUALIZAR: ?before pagination + imageUrl en POST
src/components/MessageArea.tsx                        ← ACTUALIZAR: imagen adjunta + historial
```

### Campo imageUrl ya existe en el schema

```prisma
model Message {
  id             String    @id @default(cuid())
  conversationId String
  senderId       String
  content        String    ← puede ser "" si el mensaje es solo imagen
  imageUrl       String?   ← URL de Cloudinary — H4.3 lo usa
  readAt         DateTime?
  deletedAt      DateTime?
  createdAt      DateTime  @default(now())
}
```

**Atención:** `content` es `String` (no nullable) en el schema. Al crear un mensaje solo-imagen, pasar `content: ""` o un string vacío. No necesita migración.

### Patrón de upload ya existente — reutilizar

El endpoint `POST /api/upload` ya está operativo y lo usan productos, avatares y banners. Solo hay que añadir el tipo "message". El cliente ya sabe cómo usarlo:

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("type", "message");
const res = await fetch("/api/upload", { method: "POST", body: formData });
const { data } = await res.json() as { data: { url: string; publicId: string } };
```

### Limite de tamaño diferenciado por tipo

Actualmente el límite es 20 MB para todos. Para mensajes, reducir a 10 MB. Implementar dentro del handler POST, después de validar el tipo:

```typescript
const MAX_SIZE = uploadType === "message" ? 10 * 1024 * 1024 : 20 * 1024 * 1024;
if (file.size > MAX_SIZE) { ... 413 }
```

### Paginación ?before — GET mensajes

El GET existente ya maneja `?since` (polling) y sin param (carga inicial). Añadir `?before`:

```typescript
const beforeRaw = req.nextUrl.searchParams.get("before");
const beforeDate = beforeRaw ? new Date(beforeRaw) : null;
if (beforeDate && Number.isNaN(beforeDate.getTime())) {
  return NextResponse.json({ error: "Parámetro before inválido" }, { status: 400 });
}

// Si before presente:
const messages = await db.message.findMany({
  where: { conversationId, deletedAt: null, createdAt: { lt: beforeDate } },
  orderBy: { createdAt: "desc" },
  take: 30,
  include: { sender: { select: { id: true, name: true, image: true } } },
});
return NextResponse.json({ data: messages.reverse(), hasMore: messages.length === 30 });
```

El response para carga inicial y `?since` puede seguir devolviendo `{ data }` sin `hasMore` — el cliente solo lee `hasMore` cuando hace `?before`.

### Preservar scroll al prepend — crítico para UX

Sin esto, al insertar mensajes anteriores el usuario salta al principio de la lista de golpe, experiencia horrible:

```typescript
async function loadMore() {
  if (!hasMore || loadingMore) return;
  setLoadingMore(true);
  const oldest = messages[0];
  if (!oldest) return;
  const res = await fetch(
    `/api/messages/${conversationId}?before=${encodeURIComponent(new Date(oldest.createdAt).toISOString())}`
  );
  const { data, hasMore: more } = await res.json() as { data: MessageWithSender[]; hasMore: boolean };
  
  // Guardar scroll antes de insertar
  const container = scrollContainerRef.current;
  const prevScrollHeight = container?.scrollHeight ?? 0;
  
  setMessages(prev => [...data, ...prev]);
  setHasMore(more);
  setLoadingMore(false);
  
  // Restaurar posición después de que React re-renderice
  requestAnimationFrame(() => {
    if (container) {
      container.scrollTop += (container.scrollHeight - prevScrollHeight);
    }
  });
}
```

Necesitas una `ref` al contenedor de scroll (el div con `overflow-y-auto`). Añadir `ref={scrollContainerRef}` a ese div.

### sendMessage actualizado — aceptar imageUrl

```typescript
async function sendMessage(content: string, imageUrl?: string) {
  const tempId = `temp-${Date.now()}`;
  const tempMsg: MessageWithSender = {
    id: tempId,
    content,
    imageUrl: imageUrl ?? null,
    senderId: userId,
    createdAt: new Date().toISOString(),
    sender: currentUser,
    status: "sending",
  };
  setMessages(prev => [...prev, tempMsg]);
  setSending(true);
  try {
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content || "", imageUrl }),
    });
    // ... mismo patrón que H4.2
  }
}
```

### Renderizado de mensajes con imagen

Un mensaje puede ser:
- Solo texto: igual que H4.2
- Solo imagen: bubble sin texto, imagen dentro
- Texto + imagen: imagen arriba, texto debajo dentro del mismo bubble

```tsx
<div className={`max-w-[75vw] rounded-2xl px-4 py-2 text-sm md:max-w-sm ${isOwn ? "rounded-br-sm bg-[#3d5a4f] text-white" : "rounded-bl-sm bg-[#3d5a4f]/55 text-white"}`}>
  {msg.imageUrl && (
    <img
      src={msg.imageUrl}
      alt={`Imagen enviada por ${msg.sender.name ?? "usuario"}`}
      className="max-w-full rounded-lg cursor-pointer mb-1 object-cover"
      style={{ maxHeight: "200px" }}
      onClick={() => window.open(msg.imageUrl!, "_blank")}
    />
  )}
  {msg.content && <p>{msg.content}</p>}
</div>
```

### Estado de carga de imagen — UX

Durante la subida de imagen, deshabilitar el botón de adjuntar y mostrar un spinner. El input de texto puede seguir habilitado. No usar el mismo estado `sending` (ese es para el envío del mensaje).

```typescript
const [uploadingImage, setUploadingImage] = useState(false);
```

### Lecciones de H4.2 aplicadas

- `min-h-0` en el contenedor de mensajes es obligatorio para el scroll flex
- Fragment `<>` hace que los hijos sean flex children directos del padre — mantener esta estructura
- `shrink-0` en el input container — mantener
- `messagesRef` para stale closures en intervals — sigue siendo necesario
- `scrollIntoView` en `bottomRef` para scroll automático al nuevo mensaje

### MessageWithSender — actualizar el tipo

```typescript
export type MessageWithSender = {
  id: string;
  content: string;
  imageUrl?: string | null;   // ← añadir
  senderId: string;
  createdAt: Date | string;
  sender: { id: string; name: string | null; image: string | null };
  status?: "sending" | "error";
};
```

### getConversationWithMessages — sin cambios

El helper de H4.2 en `src/server/queries/conversations.ts` ya incluye los mensajes con `sender`. No necesita cambios — `imageUrl` se devuelve automáticamente porque Prisma incluye todos los campos del modelo a menos que se use `select`.

### No necesita migración de base de datos

`imageUrl String?` ya existe en el schema (añadido en H4.1). Solo hay que empezar a usarlo.

## Dev Agent Record

### Completion Notes
(Rellenar al finalizar)

### Debug Log
(Rellenar si hay errores)

## File List
(Rellenar al finalizar)

## Change Log
(Rellenar al finalizar)
