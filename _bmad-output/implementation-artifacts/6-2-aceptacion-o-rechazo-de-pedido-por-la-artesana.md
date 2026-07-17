# Story 6.2: Aceptación o rechazo de pedido por la artesana

Status: review

## Story

Como artesana,
quiero poder aceptar o rechazar un pedido confirmado dentro de un plazo de 24 horas,
para no comprometerme a producir algo que no puedo entregar, y que el sistema resuelva automáticamente los pedidos que no atienda a tiempo.

## Acceptance Criteria

**AC1 — Opciones de aceptar/rechazar visibles en el detalle del pedido**
- **Dado** que soy artesana y tengo un pedido nuevo en estado `CONFIRMED`
- **Cuando** entro al detalle del pedido en `/studio/orders/[id]`
- **Entonces** veo dos opciones: "Aceptar pedido" y "No puedo con este pedido"
- **Y** tengo un plazo de 24 horas desde `order.createdAt` para decidir, con un contador visual del tiempo restante

**AC2 — Aceptar el pedido**
- **Dado** que acepto el pedido
- **Cuando** confirmo la aceptación
- **Entonces** el pedido pasa a estado `IN_PREPARATION`
- **Y** la compradora recibe un email confirmando que la artesana ha aceptado su pedido

**AC3 — Rechazar el pedido voluntariamente**
- **Dado** que rechazo el pedido
- **Cuando** indico un motivo (mínimo 10 caracteres)
- **Entonces** el pedido pasa a `CANCELLED`, se reembolsa íntegramente a la compradora vía Stripe, y el producto vuelve a estar `ACTIVE` en el catálogo (si sigue siendo elegible)
- **Y** NO se aplica ninguna penalización a la artesana
- **Y** la compradora recibe un email explicando la cancelación y el motivo indicado

**AC4 — Cancelación automática por falta de respuesta**
- **Dado** que no acepto ni rechazo el pedido dentro del plazo de 24 horas
- **Cuando** el cron periódico (`cancel-overdue-orders`) revisa los pedidos pendientes
- **Entonces** el sistema cancela el pedido automáticamente, reembolsa a la compradora, reactiva el producto, y aplica la penalización económica existente (`PENALTY_AMOUNT_CENTS`)
- **Y** tanto la compradora como la artesana reciben el email correspondiente

[Source: _bmad-output/planning-artifacts/epics.md#Historia 6.2, _bmad-output/planning-artifacts/prd.md#FR51]

## Tasks / Subtasks

- [x] T1 — Constante de ventana de tiempo (AC1, AC4)
  - [x] T1.1: Añadir `ACCEPTANCE_WINDOW_MS = 24 * 60 * 60 * 1000` en `src/lib/order-constants.ts`, junto a las demás constantes de negocio de pedidos

- [x] T2 — Endpoint de aceptación (AC2)
  - [x] T2.1: Crear `src/app/api/orders/[orderId]/accept/route.ts` — `POST`, rol `ARTISAN`, verifica que `order.artisanId === session.user.id`
  - [x] T2.2: Guard: `order.status === "CONFIRMED"` (si no, 409 `ORDER_NOT_ACCEPTABLE`)
  - [x] T2.3: Guard: dentro del plazo de 24h desde `createdAt` (si no, 409 `ACCEPTANCE_WINDOW_CLOSED`)
  - [x] T2.4: `db.order.update({ status: "IN_PREPARATION" })`
  - [x] T2.5: Fire-and-forget `sendOrderAcceptedEmail(order).catch(console.error)`

- [x] T3 — Endpoint de rechazo (AC3)
  - [x] T3.1: Crear `src/app/api/orders/[orderId]/reject/route.ts` — `POST`, rol `ARTISAN`, verifica propiedad del pedido
  - [x] T3.2: Mismos guards que T2.2/T2.3 (estado `CONFIRMED` + dentro de ventana)
  - [x] T3.3: Body `{ reason: string }`, validar `reason.trim().length >= 10` (si no, 422 `INVALID_REASON`) — mismo patrón que `cancel/route.ts`
  - [x] T3.4: `stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })`
  - [x] T3.5: Transacción: `db.order.update({ status: "CANCELLED", cancellationReason: reason })` + reactivar producto con la misma lógica `canReactivate` que `cancel/route.ts` (comprobar `PERISHABLE` + `expiresAt`)
  - [x] T3.6: Fire-and-forget `sendCancellationEmail(order).catch(console.error)` — **reutilizar la función existente de H6.1**, no crear una nueva

- [x] T4 — Email de aceptación (AC2)
  - [x] T4.1: Crear `src/lib/emails/OrderAcceptedEmail.tsx` — mismo layout/tokens que el resto de templates de H6.1 (`EmailLayout`, `tokens.ts`)
  - [x] T4.2: Implementar `sendOrderAcceptedEmail(order)` en `src/lib/resend.ts` — fetch buyer+product+artisan, render, send al comprador

- [x] T5 — UI de aceptar/rechazar (AC1)
  - [x] T5.1: Crear `src/app/(artisan)/studio/orders/[id]/AcceptOrRejectOrderCard.tsx` (`"use client"`) — botón primario "Aceptar pedido" (POST a `/accept`, sin modal) + botón secundario "No puedo con este pedido" que abre un `Dialog` con textarea de motivo (mismo patrón que `CancelOrderDialog.tsx`: mínimo 10 caracteres, contador de caracteres, POST a `/reject`)
  - [x] T5.2: Contador visual de tiempo restante: `useEffect` + `setInterval` calculando `ACCEPTANCE_WINDOW_MS - (Date.now() - createdAt)`, formateado como horas:minutos
  - [x] T5.3: En `src/app/(artisan)/studio/orders/[id]/page.tsx`, renderizar `<AcceptOrRejectOrderCard>` cuando `order.status === "CONFIRMED"`, y `<ConfirmShipmentForm>` cuando `order.status === "IN_PREPARATION"` (antes se mostraba en `CONFIRMED`, ver T5.4)
  - [x] T5.4 (detectado durante implementación): `confirm-shipment/route.ts` permitía confirmar envío directamente desde `CONFIRMED`, saltándose el gate nuevo — se quitó `"CONFIRMED"` de los estados permitidos, ahora requiere `IN_PREPARATION` o `READY`

- [x] T6 — Adaptar el cron de cancelación automática (AC4)
  - [x] T6.1: En `src/app/api/cron/cancel-overdue-orders/route.ts`, cambiar el `deadline` de `SHIPPING_DEADLINE_MS` a `ACCEPTANCE_WINDOW_MS` para el filtro `status: "CONFIRMED"`
  - [x] T6.2: Actualizar el texto de `cancellationReason` guardado: de "no se ha confirmado el envío..." a algo como "El sistema ha cancelado tu pedido porque la artesana no lo aceptó dentro del plazo de 24 horas. Se ha iniciado el reembolso."
  - [x] T6.3: Añadir la misma comprobación `canReactivate` que ya existe en `cancel/route.ts` (`PERISHABLE` + `expiresAt`) antes de reactivar el producto — bug preexistente de H5.4 detectado al tocar este archivo: hoy reactiva incondicionalmente, sin comprobar si el producto perecedero ya caducó
  - [x] T6.4: Añadir comentario en el endpoint documentando que, por el límite del plan Hobby de Vercel (crons subdiarios no se ejecutan con esa frecuencia real), el plazo de 24h puede demorarse hasta ~48h en el peor caso — mismo compromiso aceptado en H6.1 para el cron de mensajes
  - [x] T6.5: NO tocar el resto de la lógica (reembolso Stripe, aplicación de `PENALTY_AMOUNT_CENTS`, envío de `sendOrderCancelledBySystemEmail` + `sendOrderCancelledBySystemToArtisanEmail`) — ya está correcta y se reutiliza tal cual

- [x] T7 — Typecheck y build limpio
  - [x] T7.1: `npx tsc --noEmit` sin errores
  - [x] T7.2: `npx next build` sin errores

## Dev Notes

### No hay migración de base de datos

Esta historia **no añade ningún campo ni valor de enum nuevo**. Reutiliza los estados `OrderStatus` que ya existen en `prisma/schema.prisma`:
- Aceptar = transición directa `CONFIRMED → IN_PREPARATION` (el estado `IN_PREPARATION` ya existe en el enum, aunque hasta ahora nada lo usaba — lo introducirá formalmente H6.3, pero esta historia ya puede escribirlo)
- Rechazar / auto-cancelar = `CONFIRMED → CANCELLED` (ya usado por el flujo de cancelación de la compradora y por el cron existente)

No hace falta un campo `acceptedAt` ni un estado intermedio: el primer "avanzar estado" de H6.3 (que aún no existe) partirá de `IN_PREPARATION`, no de `CONFIRMED`, así que el gate de esta historia queda naturalmente delante.

### Reutilización máxima — patrón ya establecido en H5.4 y H6.1

Esta historia es principalmente **recombinar código ya existente**, no escribir infraestructura nueva:

- **Reembolso + reactivación de producto:** copiar el patrón exacto de `src/app/api/orders/[orderId]/cancel/route.ts` (líneas ~104-148): `stripe.refunds.create`, cálculo de `canReactivate`, transacción con `db.order.update` + `db.product.update` condicional.
- **UI de recogida de motivo:** copiar el patrón exacto de `src/app/(buyer)/orders/[id]/CancelOrderDialog.tsx` — `Dialog` de shadcn/ui, textarea con contador de caracteres, botón deshabilitado bajo 10 caracteres, `toast` de sonner para éxito/error.
- **Email de rechazo voluntario:** **NO crear un template nuevo.** `sendCancellationEmail(order)` (en `src/lib/resend.ts`, de H6.1) ya renderiza `CancellationEmail.tsx` con el `cancellationReason` guardado en el pedido — es exactamente lo que necesita AC3. Solo hay que asegurarse de guardar el `reason` correcto antes de llamarla.
- **Emails de cancelación automática:** `sendOrderCancelledBySystemEmail` (compradora) y `sendOrderCancelledBySystemToArtisanEmail` (artesana, con la penalización) **ya existen** desde H6.1 y ya están conectadas al cron `cancel-overdue-orders`. No tocar esas funciones — solo el cron que las invoca cambia su criterio de selección de pedidos.
- **Guard de sesión y rol:** mismo patrón que `confirm-shipment/route.ts` — `getServerSession()`, comprobar `role !== "ARTISAN"` → 403, comprobar que el pedido pertenece a esa artesana.

### Precisión real del plazo de 24 horas

El cron `cancel-overdue-orders` corre una vez al día (`vercel.json`, `"0 3 * * *"`). En el plan Hobby de Vercel, los crons declarados con frecuencia subdiaria no se ejecutan realmente con esa frecuencia — igual que se documentó en H6.1 para el cron de notificación de mensajes. Consecuencia: un pedido no aceptado puede tardar hasta ~48h en cancelarse automáticamente en el peor caso, no exactamente 24h. Decisión ya tomada (2026-07-15): aceptar este compromiso, documentarlo en código (T6.4), no cambiar infraestructura. La UI (contador visual, AC1) sigue mostrando 24h como plazo — es la artesana quien debe actuar dentro de ese plazo; el margen extra del cron es solo el peor caso del mecanismo de respaldo automático.

### Impacto técnico relacionado (fuera de alcance de esta historia, anotado para H6.3)

El cron `cancel-overdue-orders` solo vigila pedidos en estado `CONFIRMED`. Tras esta historia, ese estado pasa a significar "pendiente de aceptación" (plazo 24h), no "pendiente de envío". La constante `SHIPPING_DEADLINE_MS` (120h) queda sin uso activo tras este cambio — **no eliminarla**, la reintroducirá H6.3 para vigilar pedidos parados en `IN_PREPARATION`/`READY` (un pedido aceptado pero nunca enviado no lo vigila nadie hasta que exista esa historia). Dejar un comentario en el cron señalando esto.

### Archivos a crear

```
src/app/api/orders/[orderId]/accept/route.ts
src/app/api/orders/[orderId]/reject/route.ts
src/app/(artisan)/studio/orders/[id]/AcceptOrRejectOrderCard.tsx
src/lib/emails/OrderAcceptedEmail.tsx
```

### Archivos a modificar

```
src/lib/order-constants.ts                          ← ACCEPTANCE_WINDOW_MS
src/lib/resend.ts                                    ← sendOrderAcceptedEmail
src/app/(artisan)/studio/orders/[id]/page.tsx        ← renderizar AcceptOrRejectOrderCard
src/app/api/cron/cancel-overdue-orders/route.ts      ← deadline + texto de cancellationReason
```

### Patrones de respuesta y errores (de architecture.md)

- Éxito: `{ data: {...} }` · Error: `{ error: { code, message } }`
- Nuevos códigos de error: `ORDER_NOT_ACCEPTABLE` (409), `ACCEPTANCE_WINDOW_CLOSED` (409), `INVALID_REASON` (422) — mismo estilo que los ya usados en `cancel/route.ts` (`CANCELLATION_NOT_ALLOWED`, `CANCELLATION_WINDOW_CLOSED`, `INVALID_REASON`)
- Cantidades monetarias siempre en céntimos, nunca floats — no aplica cálculo monetario nuevo en esta historia (el reembolso es del `stripePaymentIntentId` completo, ya gestionado por Stripe)

### Testing

- No hay framework de test automatizado instalado en el proyecto todavía (confirmado en `architecture.md`: "No incluido en T3 — se añadirá Vitest + Testing Library en historia de setup"). Verificación manual: aceptar un pedido, rechazar un pedido con motivo corto (debe bloquear el envío) y con motivo válido, y comprobar que el cron (`GET /api/cron/cancel-overdue-orders` con el header `Authorization: Bearer <CRON_SECRET>`) cancela y penaliza un pedido `CONFIRMED` de más de 24h simulado.

### Project Structure Notes

- Sin conflictos de alineación con la estructura del proyecto — todos los archivos nuevos siguen la convención `kebab-case` de directorios y `route.ts`/`actions.ts` ya establecida, y los endpoints usan verbos al final (`/accept`, `/reject`) igual que `/confirm-shipment` existente.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Historia 6.2: Aceptación o rechazo de pedido por la artesana]
- [Source: _bmad-output/planning-artifacts/prd.md#FR51]
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns, #Naming Patterns]
- [Source: _bmad-output/implementation-artifacts/6-1-notificaciones-por-email-transaccionales.md#Dev Agent Record — patrón de reutilización de sendCancellationEmail, sendOrderCancelledBySystemEmail/ToArtisanEmail ya construidas]
- [Source: src/app/api/orders/[orderId]/cancel/route.ts — patrón de reembolso + reactivación de producto]
- [Source: src/app/(buyer)/orders/[id]/CancelOrderDialog.tsx — patrón de UI de recogida de motivo]

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

### Completion Notes List

- Al previsualizar los emails con `react-email dev` (Maldita), se detectaron 3 textos desactualizados que hacían referencia al flujo antiguo ("5 días para confirmar el envío", propio de antes de esta historia) en vez del nuevo plazo de 24h para aceptar/rechazar. Corregidos: `NewSaleEmail.tsx` (footer + botón "Ver pedido en mi estudio"), `FirstSaleEmail.tsx` (footer + botón + reestructuración de los "Pasos": se añadió el paso 1 de aceptar/rechazar en 24h, y el paso de envío ahora cuenta el plazo de 5 días desde la aceptación, no desde la compra), y `OrderCancelledBySystemToArtisanEmail.tsx` (copy de la cancelación automática). También se actualizó el texto por defecto de `cancellationReason` en `CancellationEmail.tsx`.
- Code review (`/code-review high`) sobre el diff completo detectó 7 hallazgos, 6 corregidos: (1-2) condiciones de carrera en `accept`/`reject`/cron — un pedido podía procesarse dos veces (doble aceptación/rechazo concurrente, o el cron cancelando un pedido que la artesana acababa de aceptar) porque las escrituras eran "leer estado → escribir" sin garantía atómica; se corrigió reemplazando `update` por `updateMany` con `where: { status: "CONFIRMED" }` y comprobando `count` antes de aplicar reembolsos/penalizaciones. (3) Se detectó y corrigió un riesgo de migración retroactiva (pedidos `CONFIRMED` preexistentes penalizados de golpe al aplicar el nuevo plazo de 24h) pero se revirtió: la app nunca se ha desplegado a producción, así que no hay pedidos en vuelo que proteger — las 24h se aplican uniformemente a todos los pedidos. (4) El toast de error de `AcceptOrRejectOrderCard.tsx` mostraba "inténtalo de nuevo" genérico incluso para errores permanentes (p.ej. `ACCEPTANCE_WINDOW_CLOSED`); ahora lee el código de error del cuerpo JSON y muestra el mensaje correcto. (5) `ACCEPTANCE_WINDOW_MS` estaba redeclarada en el cliente en vez de importada de `order-constants.ts`. (6) La lógica `canReactivate` (producto perecedero) estaba triplicada en `cancel/route.ts`, `reject/route.ts` y el cron; extraída a `src/lib/orders.ts` (`canReactivateProduct`). El 7º hallazgo (guard de sesión/rol duplicado en cada route handler) se dejó tal cual por coincidir con la convención ya documentada en `architecture.md`.

### File List

**Nuevos:**
```
src/app/api/orders/[orderId]/accept/route.ts
src/app/api/orders/[orderId]/reject/route.ts
src/app/(artisan)/studio/orders/[id]/AcceptOrRejectOrderCard.tsx
src/lib/emails/OrderAcceptedEmail.tsx
src/lib/orders.ts
```

**Modificados:**
```
src/app/(artisan)/studio/orders/[id]/page.tsx
src/app/api/cron/cancel-overdue-orders/route.ts
src/app/api/orders/[orderId]/confirm-shipment/route.ts
src/app/api/orders/[orderId]/cancel/route.ts
src/lib/order-constants.ts
src/lib/resend.ts
src/lib/emails/CancellationEmail.tsx
src/lib/emails/FirstSaleEmail.tsx
src/lib/emails/NewFollowerEmail.tsx
src/lib/emails/NewSaleEmail.tsx
src/lib/emails/OrderCancelledBySystemToArtisanEmail.tsx
src/lib/emails/OrderConfirmationEmail.tsx
src/lib/emails/ShipmentConfirmedEmail.tsx
```
