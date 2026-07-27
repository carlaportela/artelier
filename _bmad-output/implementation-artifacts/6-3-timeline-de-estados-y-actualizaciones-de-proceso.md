# Story 6.3: Timeline de estados y actualizaciones de proceso

Status: ready-for-dev

## Story

Como artesana y compradora,
quiero visualizar el progreso de un pedido en un timeline claro y que la artesana pueda añadir mensajes personales en cada avance de estado,
para que el proceso sea transparente y humano desde la confirmación hasta el envío.

## Acceptance Criteria

**AC1 — Timeline visible en el detalle del pedido (artesana y compradora)**
- **Dado** que soy artesana con un pedido ya aceptado en `/studio/orders/[id]` (Historia 6.2), o compradora en `/orders/[id]`
- **Cuando** visualizo el detalle del pedido
- **Entonces** veo el componente `OrderStatusTimeline` con los 6 estados: Confirmado → En preparación → Listo → Enviado → Entregado → Aceptado
- **Y** el estado actual aparece marcado con `aria-current="step"` en el `<ol>` subyacente
- **Y** si el pedido es de recogida en persona (`shippingMethod === "PICKUP"`), el paso "Enviado" no aplica y su etiqueta visual es "Listo para recogida" en vez de "Listo" (ver Dev Notes — Etiquetas dependientes del método de envío)

**AC2 — Avanzar el estado del pedido (artesana)**
- **Dado** que soy artesana y quiero avanzar el estado del pedido
- **Cuando** pulso "Avanzar estado" en el panel de estudio
- **Entonces** puedo avanzar la secuencia En preparación → Listo → Enviado (Confirmado→En preparación ya lo cubre el "Aceptar pedido" de la Historia 6.2), añadiendo un mensaje personal opcional (máx. 280 caracteres) en cada paso
- **Y** el mensaje personal se muestra como componente `OrderStatusUpdate` en el timeline de la compradora
- **Y** el paso a "Entregado" no está disponible manualmente si el pedido usa envío de la plataforma — en ese caso lo marca el sistema automáticamente vía webhook del carrier (Historia 6.4)
- **Y** el paso a "Aceptado" es exclusivo de la compradora o del sistema por vencimiento (Historia 6.4)
- **Y** para pedidos de recogida en persona, "Listo" es el último paso avanzable manualmente desde esta historia — "Entregado" lo marca la artesana manualmente en persona, pero eso es alcance de la Historia 6.4, no de ésta

**AC3 — Actualización en tiempo real para la compradora**
- **Dado** que soy compradora viendo `/orders/[id]`
- **Cuando** la artesana actualiza el estado del pedido
- **Entonces** el timeline se actualiza automáticamente (polling cada 30s si la pestaña está visible, pausado si `document.hidden`)
- **Y** veo el estado actualizado y el mensaje personal de la artesana como `OrderStatusUpdate`
- **Y** recibo un email de notificación con el nuevo estado (Historia 6.1)

[Source: _bmad-output/planning-artifacts/epics.md#Historia 6.3, _bmad-output/planning-artifacts/prd.md#FR50]

## Tasks / Subtasks

- [x] T1 — Migración de base de datos: historial de estados con mensaje personal (AC1, AC2, AC3)
  - [x] T1.1: Añadir modelo `OrderStatusUpdate` en `prisma/schema.prisma`: `id`, `orderId`, `status` (`OrderStatus`), `message` (`String?`), `createdAt` (`DateTime @default(now())`). Relación `order Order @relation(fields: [orderId], references: [id])` + añadir `statusUpdates OrderStatusUpdate[]` al modelo `Order`
  - [x] T1.2: `npx prisma migrate dev --name add_order_status_update`
  - [x] T1.3: Añadir `ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH = 280` en `src/lib/order-constants.ts`, junto a las demás constantes de negocio

- [x] T2 — Endpoint para avanzar estado (AC2)
  - [x] T2.1: Crear `src/app/api/orders/[orderId]/advance-status/route.ts` — `POST`, rol `ARTISAN`, verifica `order.artisanId === session.user.id` (mismo patrón de guard que `accept/route.ts`)
  - [x] T2.2: El endpoint NO recibe el estado destino del cliente — lo calcula server-side a partir de `order.status` actual + `order.shippingMethod` (evita que el cliente pueda saltarse pasos):
    - `IN_PREPARATION` → siguiente = `READY` (todos los métodos de envío)
    - `READY` + `shippingMethod !== "PICKUP"` → siguiente = `SHIPPED` (requiere `trackingNumber` en el body, igual que el antiguo `confirm-shipment`)
    - `READY` + `shippingMethod === "PICKUP"` → 409 `ORDER_NOT_ADVANCEABLE` (el pedido de recogida ya está en su último paso manual de esta historia; "Entregado" es la Historia 6.4)
    - Cualquier otro `order.status` → 409 `ORDER_NOT_ADVANCEABLE`
  - [x] T2.3: Body `{ message?: string; trackingNumber?: string }`. Validar `message.length <= ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH` (si no, 422 `INVALID_MESSAGE`). Validar `trackingNumber` no vacío cuando el siguiente estado es `SHIPPED` (si no, 422 `INVALID_TRACKING_NUMBER` — mismo código que usaba `confirm-shipment`)
  - [x] T2.4: Reclamo atómico + creación del `OrderStatusUpdate` en una única transacción interactiva (`db.$transaction(async (tx) => ...)`), **siguiendo el mismo patrón que `claimAndCancelOrder` en `src/lib/orders.ts` (Historia 6.2)**: `tx.order.updateMany({ where: { id: orderId, status: currentStatus }, data: { status: nextStatus, ...(trackingNumber && { trackingNumber }) } })`, comprobar `count`, y solo si `count > 0` crear `tx.orderStatusUpdate.create({ data: { orderId, status: nextStatus, message: message || null } })`. Si `count === 0`, devolver 409 `ORDER_NOT_ADVANCEABLE` — evita el mismo problema de condición de carrera que Sourcery señaló en la Historia 6.2 (doble clic, dos pestañas)
  - [x] T2.5: Fire-and-forget del email correspondiente al nuevo estado (ver T4) — **pendiente de completar en T4**: por ahora llama a las funciones de email con su firma actual (sin mensaje personal), ya que `sendOrderPreparedEmail` aún no existe
  - [x] T2.6: Eliminar `src/app/api/orders/[orderId]/confirm-shipment/route.ts` — este endpoint queda completamente reemplazado por `advance-status` (saltaba directamente `IN_PREPARATION → SHIPPED` sin pasar por `READY`, lo cual es incompatible con el timeline paso a paso de esta historia)

- [ ] T3 — Endpoint de lectura para polling de la compradora (AC3)
  - [ ] T3.1: Crear `src/app/api/orders/[orderId]/route.ts` — `GET`, verifica que `order.buyerId === session.user.id` **o** `order.artisanId === session.user.id` (ambos roles pueden consultarlo)
  - [ ] T3.2: Query param `?since=<ISO timestamp>` — mismo patrón exacto que `src/app/api/messages/[conversationId]/route.ts`: si se pasa `since`, devuelve solo `{ status, trackingNumber, statusUpdates: OrderStatusUpdate[] }` con `statusUpdates` filtrados por `createdAt: { gt: sinceDate }`; si no se pasa, devuelve el pedido completo con todos los `statusUpdates` (orden `createdAt: "asc"`)
  - [ ] T3.3: Añadir rate limiter `orderStatusLimiter = createLimiter(30, "60 s")` en `src/lib/ratelimit.ts` (mismo presupuesto que `messageLimiter`, mismo motivo: endpoint de polling)

- [ ] T4 — Emails de cambio de estado (AC3)
  - [ ] T4.1: Extender `src/lib/emails/ShipmentConfirmedEmail.tsx` y `sendShipmentConfirmedEmail` en `resend.ts` con prop opcional `personalMessage: string | null` — se muestra como bloque adicional en el email si no es null (mismo layout que el resto: `Text` con `fontBody`, debajo de la descripción del envío)
  - [ ] T4.2: Extender `src/lib/emails/OrderReadyForPickupEmail.tsx` y `sendOrderReadyForPickupEmail` igual, con `personalMessage: string | null`
  - [ ] T4.3: Crear `src/lib/emails/OrderPreparedEmail.tsx` + `sendOrderPreparedEmail(order, message)` en `resend.ts` — cubre el caso genuinamente nuevo de "pedido listo, envío por plataforma o propio, aún no enviado" (`READY` + `shippingMethod !== "PICKUP"`), que no tenía email antes porque ese estado intermedio no se usaba para esos métodos. Mismo layout que `OrderAcceptedEmail.tsx` (Historia 6.2): saludo, card con producto, mensaje personal opcional, botón "Ver mi pedido"
  - [ ] T4.4: En `advance-status/route.ts`, el email a enviar depende del nuevo estado calculado en T2.2:
    - `READY` + `PICKUP` → `sendOrderReadyForPickupEmail(order, message)`
    - `READY` + no `PICKUP` → `sendOrderPreparedEmail(order, message)`
    - `SHIPPED` → `sendShipmentConfirmedEmail(order, message)`

- [ ] T5 — Componentes de timeline (AC1, AC2, AC3)
  - [ ] T5.1: Crear `src/components/order/OrderStatusTimeline.tsx` — recibe `status: OrderStatus` y `shippingMethod: ShippingMethod`. Renderiza un `<ol>` con los 6 estados canónicos (usa las traducciones ya existentes en `orderStatus.*` de `es.json`, NO crear claves nuevas). El paso actual lleva `aria-current="step"`. Si `shippingMethod === "PICKUP"`, omite visualmente el paso "Enviado" y sustituye la etiqueta de "Listo" por "Listo para recogida" (ver Dev Notes) — esto es lógica de presentación local al componente, no toca `es.json`
  - [ ] T5.2: Crear `src/components/order/OrderStatusUpdate.tsx` — recibe `status`, `message`, `createdAt` de un `OrderStatusUpdate`; renderiza una entrada de timeline con el mensaje personal si existe (arquitecture.md original lo ubicaba en `components/messaging/`, pero no reutiliza el modelo `Message` — se coloca en `components/order/` por cohesión con el dato que realmente representa; no hay `components/messaging/` en el código actual, así que no hay convención que romper)
  - [ ] T5.3: Reemplazar `src/app/(artisan)/studio/orders/[id]/ConfirmShipmentForm.tsx` por `AdvanceStatusForm.tsx` (mismo patrón `"use client"`, fetch + toast + `router.refresh()` que el resto de esta zona) — muestra el campo de `trackingNumber` solo cuando el siguiente paso es `SHIPPED` (`order.status === "READY" && shippingMethod !== "PICKUP"`), y siempre un textarea opcional de mensaje personal con contador de caracteres (mismo patrón que `AcceptOrRejectOrderCard.tsx`, mínimo 0 en vez de 10, máximo `ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH`)
  - [ ] T5.4: En `src/app/(artisan)/studio/orders/[id]/page.tsx`: renderizar `<OrderStatusTimeline>` siempre (para todos los estados), y `<AdvanceStatusForm>` cuando `order.status === "IN_PREPARATION"` **o** (`order.status === "READY"` y `shippingMethod !== "PICKUP"`) — sustituye el bloque actual que solo cubría `IN_PREPARATION`
  - [ ] T5.5: Crear `src/app/(buyer)/orders/[id]/OrderStatusPoller.tsx` (`"use client"`) — recibe `orderId`, estado inicial y `statusUpdates` iniciales como props desde el server component; hace polling a `GET /api/orders/[orderId]?since=` cada 30s con pausa en `document.hidden`, **replicando el patrón exacto ya establecido en `src/components/MessageArea.tsx`** (mismo `useRef` para evitar closures obsoletas, mismo `visibilitychange` + `setInterval`, NO crear un hook nuevo en `src/hooks/` — ese directorio no existe en el código real pese a estar en `architecture.md`, la convención real de este proyecto es inline en el componente). Renderiza `<OrderStatusTimeline>` + lista de `<OrderStatusUpdate>`
  - [ ] T5.6: En `src/app/(buyer)/orders/[id]/page.tsx`, renderizar `<OrderStatusPoller>` en vez de (o junto a) la actual etiqueta plana de estado — mantener el resto de la página (card de producto, desglose de costes, cancelación) sin cambios

- [ ] T6 — Typecheck y build limpio
  - [ ] T6.1: `npx tsc --noEmit` sin errores
  - [ ] T6.2: `npx next build` sin errores

## Dev Notes

### Esta historia SÍ requiere migración de base de datos (a diferencia de H6.1/H6.2)

Las historias 6.1 y 6.2 reutilizaron el enum `OrderStatus` existente sin tocar el esquema. **Esta es diferente**: no existe ningún modelo para guardar el historial de cambios de estado con su mensaje personal asociado — `Order` solo guarda su estado *actual*, no un historial. Sin un modelo nuevo (`OrderStatusUpdate`), no hay forma de mostrar "el mensaje que puso la artesana cuando pasó a Listo" de forma persistente, ni de que el polling de la compradora detecte "hay una actualización nueva desde mi último `since`". Ver T1.

### Cambio de comportamiento: `confirm-shipment` desaparece, sustituido por `advance-status`

El endpoint actual `POST /api/orders/[orderId]/confirm-shipment` (Historia 5.4, tocado en 6.2) salta directamente `IN_PREPARATION → SHIPPED` para envío por plataforma/propio, y `IN_PREPARATION → READY` (terminal) para recogida — **sin pasar nunca por un estado `READY` intermedio para pedidos que sí se envían**. El AC2 de esta historia exige la secuencia completa `En preparación → Listo → Enviado`, lo cual es incompatible con ese salto directo. Por tanto:
- `READY` pasa a tener **dos significados según el método de envío**: para recogida es terminal ("Listo para recogida", Historia 6.4 marca "Entregado" manualmente); para plataforma/propio es un paso intermedio nuevo antes de `SHIPPED` ("Listo", pendiente de envío).
- Esto es la razón de que T5.1 necesite lógica de presentación dependiente de `shippingMethod` en el propio componente `OrderStatusTimeline`, no un cambio en `es.json` (la clave `orderStatus.READY: "Listo para enviar"` se queda igual para usos genéricos como la etiqueta plana de estado; solo el timeline necesita el matiz).
- Es la razón de que T4.3 necesite un email nuevo (`OrderPreparedEmail`) — el caso "listo, envío por plataforma, aún sin enviar" no tenía cobertura antes porque ese estado no se usaba para ese método de envío.

### Reutilización — patrón ya establecido en H5.4/H6.1/H6.2

- **Guard de sesión/rol en `advance-status/route.ts`:** mismo patrón que `accept/route.ts` y `reject/route.ts` (Historia 6.2) — `getServerSession()`, comprobar rol, comprobar propiedad del pedido.
- **Transacción atómica con reclamo de estado:** replicar el patrón de `claimAndCancelOrder` en `src/lib/orders.ts` (Historia 6.2, añadido tras revisión de Sourcery) — `updateMany` con `where` que exige el estado actual esperado, comprobar `count`, solo entonces proceder. Esto evita desde el principio la misma clase de condición de carrera que se corrigió a posteriori en 6.2 (doble clic, dos pestañas del navegador).
- **Polling + Page Visibility API:** replicar exactamente el patrón inline de `src/components/MessageArea.tsx` (líneas ~59-110) — `useRef` para evitar closures obsoletas sobre el último timestamp, `setInterval` + `document.addEventListener("visibilitychange", ...)`, limpieza en el `return` del `useEffect`. **No crear un hook `useOrderStatus` ni ningún archivo en `src/hooks/`** — ese directorio no existe en el código real (a pesar de estar en `architecture.md` como `useMessages.ts`); la convención real y ya probada de este proyecto es mantener el polling inline en el componente cliente que lo usa.
- **Rate limiting del endpoint GET de polling:** mismo patrón que `messages/[conversationId]/route.ts` — `createLimiter(30, "60 s")` desde `~/lib/ratelimit.ts`.
- **UI de recogida de mensaje personal:** mismo patrón que el textarea de motivo de `AcceptOrRejectOrderCard.tsx` (Historia 6.2) — contador de caracteres, pero aquí el mensaje es *opcional* (mínimo 0, no 10) y el máximo es `ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH` (280) en vez de un mínimo.
- **Emails reutilizados en vez de duplicados:** `ShipmentConfirmedEmail`/`sendShipmentConfirmedEmail` y `OrderReadyForPickupEmail`/`sendOrderReadyForPickupEmail` ya existen (Historia 6.1) y cubren `SHIPPED` y `READY+PICKUP` — se **extienden** con un campo opcional de mensaje personal, no se duplican. Solo `OrderPreparedEmail` es genuinamente nuevo (caso sin cobertura previa).

### Estados fuera de alcance de esta historia

`DELIVERED` y `ACCEPTED` son alcance de la Historia 6.4 (webhook del carrier, marcado manual por la artesana en envío propio/recogida, aceptación de la compradora o por vencimiento). El endpoint `advance-status` de esta historia **no debe permitir avanzar más allá de `SHIPPED`** (envío) o `READY` (recogida) — cualquier intento devuelve 409 `ORDER_NOT_ADVANCEABLE`. No tocar `SHIPPING_DEADLINE_MS` en `order-constants.ts` (sigue reservada para el cron que introducirá 6.4, tal y como se documentó en 6.2).

### Etiquetas dependientes del método de envío (AC1)

La clave de traducción `orderStatus.READY` en `es.json` ("Listo para enviar") sirve como etiqueta genérica plana (p.ej. la pastilla de estado que ya existe arriba de la página de detalle, sin tocar). El componente `OrderStatusTimeline`, en cambio, necesita distinguir contextualmente: si `shippingMethod === "PICKUP"`, el paso equivalente a `READY` debe leerse "Listo para recogida" (coherente con el asunto ya existente del email `OrderReadyForPickupEmail`: "Tu pedido está listo para recoger"); si no, "Listo" a secas (paso intermedio antes de "Enviado"). Esta lógica vive dentro del componente (un pequeño mapa de labels condicionado por `shippingMethod`), no en `es.json`.

### Testing

- No hay framework de test automatizado instalado (confirmado en `architecture.md` y en historias previas). Verificación manual: como artesana, avanzar un pedido `IN_PREPARATION → READY` (con y sin mensaje personal, con mensaje > 280 caracteres debe bloquear), luego `READY → SHIPPED` (sin número de seguimiento debe bloquear); comprobar que un pedido de recogida se bloquea correctamente al intentar avanzar más allá de `READY`; como compradora, verificar que el timeline se actualiza solo (sin recargar) cuando la artesana avanza el estado, y que el polling se detiene al cambiar de pestaña (`document.hidden`) y se reanuda al volver.

### Archivos a crear

```
src/app/api/orders/[orderId]/advance-status/route.ts
src/app/api/orders/[orderId]/route.ts
src/app/(artisan)/studio/orders/[id]/AdvanceStatusForm.tsx
src/app/(buyer)/orders/[id]/OrderStatusPoller.tsx
src/components/order/OrderStatusTimeline.tsx
src/components/order/OrderStatusUpdate.tsx
src/lib/emails/OrderPreparedEmail.tsx
```

### Archivos a eliminar

```
src/app/api/orders/[orderId]/confirm-shipment/route.ts
src/app/(artisan)/studio/orders/[id]/ConfirmShipmentForm.tsx
```

### Archivos a modificar

```
prisma/schema.prisma                                 ← modelo OrderStatusUpdate
src/lib/order-constants.ts                            ← ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH
src/lib/ratelimit.ts                                  ← orderStatusLimiter
src/lib/resend.ts                                     ← sendOrderPreparedEmail + extender sendShipmentConfirmedEmail/sendOrderReadyForPickupEmail
src/lib/emails/ShipmentConfirmedEmail.tsx              ← prop personalMessage
src/lib/emails/OrderReadyForPickupEmail.tsx            ← prop personalMessage
src/app/(artisan)/studio/orders/[id]/page.tsx          ← OrderStatusTimeline + AdvanceStatusForm
src/app/(buyer)/orders/[id]/page.tsx                   ← OrderStatusPoller
```

### Patrones de respuesta y errores (de architecture.md)

- Éxito: `{ data: {...} }` · Error: `{ error: { code, message } }`
- Nuevos códigos de error: `ORDER_NOT_ADVANCEABLE` (409), `INVALID_MESSAGE` (422), `INVALID_TRACKING_NUMBER` (422, mismo código que ya usaba `confirm-shipment`)
- Cantidades monetarias no aplican en esta historia

### Project Structure Notes

- `src/components/order/` y `src/components/messaging/` no existen todavía en el código real (solo en `architecture.md`) — se crea `src/components/order/` según lo planeado; `OrderStatusUpdate.tsx` se ubica ahí en vez de en `messaging/` por cohesión de datos (ver Dev Notes).
- `src/hooks/` tampoco existe en el código real — no crearlo; seguir la convención real de polling inline (ver Dev Notes).
- Los nuevos endpoints siguen la convención `kebab-case` + verbo final (`/advance-status`) ya usada por `/confirm-shipment`, `/accept`, `/reject`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Historia 6.3: Timeline de estados y actualizaciones de proceso]
- [Source: _bmad-output/planning-artifacts/prd.md#FR50]
- [Source: _bmad-output/planning-artifacts/architecture.md#Estructura de carpetas — OrderStatusTimeline.tsx, OrderStatusUpdate.tsx, useMessages.ts (patrón, no ubicación literal — ver Project Structure Notes)]
- [Source: src/components/MessageArea.tsx — patrón de polling + Page Visibility API a replicar]
- [Source: src/app/api/messages/[conversationId]/route.ts — patrón de endpoint GET con `?since=` y rate limiting]
- [Source: src/lib/orders.ts — patrón `claimAndCancelOrder` de reclamo atómico (Historia 6.2, post-revisión de Sourcery)]
- [Source: src/app/api/orders/[orderId]/confirm-shipment/route.ts — lógica de transición actual, a reemplazar]
- [Source: _bmad-output/implementation-artifacts/6-2-aceptacion-o-rechazo-de-pedido-por-la-artesana.md#Dev Agent Record — lecciones de la ronda de code review de Sourcery: condiciones de carrera, duplicación de lógica]

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

### Completion Notes List

- T1: el nombre original propuesto para el modelo nuevo (`ProcessUpdate`) colisionaba con un modelo ya existente sin relación alguna (publicaciones de la artesana para sus seguidoras, `studio/posts`). Renombrado a `OrderStatusUpdate` (y el campo de relación en `Order` de `processUpdates` a `statusUpdates`, y la constante `PROCESS_UPDATE_MESSAGE_MAX_LENGTH` a `ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH`) antes de generar la migración. El componente `ProcessUpdate.tsx` planeado en T5.2 pasa a llamarse `OrderStatusUpdate.tsx` por la misma razón.

### File List
