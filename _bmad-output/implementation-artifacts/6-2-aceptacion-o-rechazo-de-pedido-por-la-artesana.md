# Story 6.2: Aceptación o rechazo de pedido por la artesana

Status: ready-for-dev

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

- [ ] T1 — Constante de ventana de tiempo (AC1, AC4)
  - [ ] T1.1: Añadir `ACCEPTANCE_WINDOW_MS = 24 * 60 * 60 * 1000` en `src/lib/order-constants.ts`, junto a las demás constantes de negocio de pedidos

- [ ] T2 — Endpoint de aceptación (AC2)
  - [ ] T2.1: Crear `src/app/api/orders/[orderId]/accept/route.ts` — `POST`, rol `ARTISAN`, verifica que `order.artisanId === session.user.id`
  - [ ] T2.2: Guard: `order.status === "CONFIRMED"` (si no, 409 `ORDER_NOT_ACCEPTABLE`)
  - [ ] T2.3: Guard: dentro del plazo de 24h desde `createdAt` (si no, 409 `ACCEPTANCE_WINDOW_CLOSED`)
  - [ ] T2.4: `db.order.update({ status: "IN_PREPARATION" })`
  - [ ] T2.5: Fire-and-forget `sendOrderAcceptedEmail(order).catch(console.error)`

- [ ] T3 — Endpoint de rechazo (AC3)
  - [ ] T3.1: Crear `src/app/api/orders/[orderId]/reject/route.ts` — `POST`, rol `ARTISAN`, verifica propiedad del pedido
  - [ ] T3.2: Mismos guards que T2.2/T2.3 (estado `CONFIRMED` + dentro de ventana)
  - [ ] T3.3: Body `{ reason: string }`, validar `reason.trim().length >= 10` (si no, 422 `INVALID_REASON`) — mismo patrón que `cancel/route.ts`
  - [ ] T3.4: `stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })`
  - [ ] T3.5: Transacción: `db.order.update({ status: "CANCELLED", cancellationReason: reason })` + reactivar producto con la misma lógica `canReactivate` que `cancel/route.ts` (comprobar `PERISHABLE` + `expiresAt`)
  - [ ] T3.6: Fire-and-forget `sendCancellationEmail(order).catch(console.error)` — **reutilizar la función existente de H6.1**, no crear una nueva

- [ ] T4 — Email de aceptación (AC2)
  - [ ] T4.1: Crear `src/lib/emails/OrderAcceptedEmail.tsx` — mismo layout/tokens que el resto de templates de H6.1 (`EmailLayout`, `tokens.ts`)
  - [ ] T4.2: Implementar `sendOrderAcceptedEmail(order)` en `src/lib/resend.ts` — fetch buyer+product+artisan, render, send al comprador

- [ ] T5 — UI de aceptar/rechazar (AC1)
  - [ ] T5.1: Crear `src/app/(artisan)/studio/orders/[id]/AcceptOrRejectOrderCard.tsx` (`"use client"`) — botón primario "Aceptar pedido" (POST a `/accept`, sin modal) + botón secundario "No puedo con este pedido" que abre un `Dialog` con textarea de motivo (mismo patrón que `CancelOrderDialog.tsx`: mínimo 10 caracteres, contador de caracteres, POST a `/reject`)
  - [ ] T5.2: Contador visual de tiempo restante: `useEffect` + `setInterval` calculando `ACCEPTANCE_WINDOW_MS - (Date.now() - createdAt)`, formateado como horas:minutos
  - [ ] T5.3: En `src/app/(artisan)/studio/orders/[id]/page.tsx`, renderizar `<AcceptOrRejectOrderCard>` cuando `order.status === "CONFIRMED"` y sigue dentro de la ventana de 24h (en vez de o antes de `<ConfirmShipmentForm>`, que ya solo se muestra en ese mismo estado — ver Dev Notes)

- [ ] T6 — Adaptar el cron de cancelación automática (AC4)
  - [ ] T6.1: En `src/app/api/cron/cancel-overdue-orders/route.ts`, cambiar el `deadline` de `SHIPPING_DEADLINE_MS` a `ACCEPTANCE_WINDOW_MS` para el filtro `status: "CONFIRMED"`
  - [ ] T6.2: Actualizar el texto de `cancellationReason` guardado: de "no se ha confirmado el envío..." a algo como "El sistema ha cancelado tu pedido porque la artesana no lo aceptó dentro del plazo de 24 horas. Se ha iniciado el reembolso."
  - [ ] T6.3: Añadir la misma comprobación `canReactivate` que ya existe en `cancel/route.ts` (`PERISHABLE` + `expiresAt`) antes de reactivar el producto — bug preexistente de H5.4 detectado al tocar este archivo: hoy reactiva incondicionalmente, sin comprobar si el producto perecedero ya caducó
  - [ ] T6.4: Añadir comentario en el endpoint documentando que, por el límite del plan Hobby de Vercel (crons sub-diarios no se ejecutan con esa frecuencia real), el plazo de 24h puede demorarse hasta ~48h en el peor caso — mismo compromiso aceptado en H6.1 para el cron de mensajes
  - [ ] T6.5: NO tocar el resto de la lógica (reembolso Stripe, aplicación de `PENALTY_AMOUNT_CENTS`, envío de `sendOrderCancelledBySystemEmail` + `sendOrderCancelledBySystemToArtisanEmail`) — ya está correcta y se reutiliza tal cual

- [ ] T7 — Typecheck y build limpio
  - [ ] T7.1: `npx tsc --noEmit` sin errores
  - [ ] T7.2: `npx next build` sin errores

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

El cron `cancel-overdue-orders` corre una vez al día (`vercel.json`, `"0 3 * * *"`). En el plan Hobby de Vercel, los crons declarados con frecuencia sub-diaria no se ejecutan realmente con esa frecuencia — igual que se documentó en H6.1 para el cron de notificación de mensajes. Consecuencia: un pedido no aceptado puede tardar hasta ~48h en cancelarse automáticamente en el peor caso, no exactamente 24h. Decisión ya tomada (2026-07-15): aceptar este compromiso, documentarlo en código (T6.4), no cambiar infraestructura. La UI (contador visual, AC1) sigue mostrando 24h como plazo — es la artesana quien debe actuar dentro de ese plazo; el margen extra del cron es solo el peor caso del mecanismo de respaldo automático.

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

### File List
