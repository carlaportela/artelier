# Historia 6.1: Notificaciones por email transaccionales

Status: done

## Story

Como usuaria de Artelier,
quiero recibir emails transaccionales bien diseñados en todos los eventos importantes,
para estar informada sin tener que entrar en la aplicación.

## Acceptance Criteria

**AC1 — Email de confirmación de pedido (compradora)**
- **Dado** que soy compradora y acabo de completar el pago
- **Cuando** el webhook de Stripe confirma el pago
- **Entonces** recibo un email `OrderConfirmation` con: nombre del producto, nombre de la artesana, precio pagado, número de pedido, y botón "Ver mi pedido" que enlaza a `/orders/[id]`

**AC2 — Email de nueva venta (artesana)**
- **Dado** que soy artesana y alguien ha comprado uno de mis productos
- **Cuando** el webhook de Stripe confirma el pago
- **Entonces** recibo un email `NewSale` con: nombre del producto vendido, precio neto (deducidas comisiones), datos de envío del comprador, y botón "Ver pedido en mi estudio" que enlaza a `/studio/orders/[id]`

**AC3 — Email de nuevo seguidor (artesana)**
- **Dado** que soy artesana y alguien me empieza a seguir
- **Cuando** se crea un nuevo `Follow` en la base de datos
- **Entonces** recibo un email `NewFollower` con el nombre y foto del seguidor y botón "Ver su perfil"

**AC4 — Email de nuevo producto (compradora seguidora)**
- **Dado** que soy compradora que sigo a una artesana
- **Cuando** la artesana publica un nuevo producto
- **Entonces** recibo un email `NewProduct` con foto, nombre y precio del producto, y botón "Ver producto" que enlaza al catálogo

**AC5 — Email de nuevo mensaje con retraso de 5 minutos**
- **Dado** que soy usuaria y recibo un mensaje privado mientras no estoy activa en la app
- **Cuando** han transcurrido 5 minutos desde el último mensaje no leído sin que el destinatario lo haya leído
- **Entonces** recibo un email `NewMessage` con el nombre del remitente, un preview del mensaje (máx. 100 caracteres), y botón "Ver conversación" que enlaza a `/studio/messages/[conversationId]` o `/messages/[conversationId]` según el rol
- **Y** no se envía si el destinatario ha leído el mensaje antes de que expiren los 5 minutos

**AC6 — Diseño y estructura de todos los emails**
- **Dado** que cualquier email transaccional es enviado
- **Cuando** se renderiza
- **Entonces** usa los tokens de diseño Tinta y Lino: The Girl Next Door para el nombre "Artelier" en la cabecera, DM Sans para el cuerpo del texto
- **Y** incluye pie de página con enlace a preferencias de notificación (`/cuenta/notificaciones`) y enlace de baja (`/baja`)
- **Y** es enviado mediante Resend con `from: noreply@artelier.es`

## Tasks / Subtasks

- [x] T1 — Migración de base de datos
  - [x] T1.1: Añadir `emailNotifiedAt DateTime?` al modelo `Message` en `prisma/schema.prisma`
  - [x] T1.2: Ejecutar `npx prisma migrate dev --name add_message_email_notified_at`
  - [x] T1.3: Verificar que el cliente Prisma se regenera correctamente

- [x] T2 — Layout base de email
  - [x] T2.1: Crear `src/lib/emails/EmailLayout.tsx` — wrapper con cabecera "Artelier" (The Girl Next Door), paleta Tinta y Lino, y pie de página con links de baja

- [x] T3 — Templates de emails de pedido (AC1, AC2)
  - [x] T3.1: Crear `src/lib/emails/OrderConfirmationEmail.tsx` (AC1)
  - [x] T3.2: Crear `src/lib/emails/NewSaleEmail.tsx` (AC2)
  - [x] T3.3: Crear `src/lib/emails/CancellationEmail.tsx` (ya stub en H5.4)
  - [x] T3.4: Crear `src/lib/emails/ShipmentConfirmedEmail.tsx` (ya stub en H5.4)
  - [x] T3.5: `OrderCancelledBySystemEmail` implementado como delegación a `sendCancellationEmail` (mismo template, mismo destinatario — ver Dev Agent Record) en vez de archivo propio

- [x] T4 — Templates de emails sociales (AC3, AC4)
  - [x] T4.1: Crear `src/lib/emails/NewFollowerEmail.tsx` (AC3) — con foto del seguidor y botón a `/studio/followers` (página nueva, ver Review Findings)
  - [x] T4.2: Crear `src/lib/emails/NewProductEmail.tsx` (AC4)

- [x] T5 — Template de email de mensaje (AC5)
  - [x] T5.1: Crear `src/lib/emails/NewMessageEmail.tsx` (AC5)

- [x] T6 — Implementar funciones de email en `src/lib/resend.ts`
  - [x] T6.1: Implementar `sendOrderConfirmation(order)` — fetch buyer+product+artisan, render, send
  - [x] T6.2: Implementar `sendNewSale(order)` — fetch artisan+product+buyer (con dirección), calcular neto, render, send
  - [x] T6.3: Implementar `sendCancellationEmail(order)` — fetch buyer+product, render, send
  - [x] T6.4: Implementar `sendShipmentConfirmedEmail(order)` — fetch buyer+product, render, send (y `sendOrderReadyForPickupEmail` para método PICKUP)
  - [x] T6.5: Implementar `sendOrderCancelledBySystemEmail(order)` — fetch buyer+product, render, send
  - [x] T6.6: Añadir e implementar `sendNewFollowerEmail(followerId, artisanId)` — fetch ambos usuarios, render, send
  - [x] T6.7: Añadir e implementar `sendNewProductEmail(productId)` — fetch producto+artesana+seguidoras, enviar a cada seguidora con Promise.allSettled
  - [x] T6.8 (añadida en review): `sendOrderCancelledByBuyerEmail`, `sendOrderCancelledBySystemToArtisanEmail`, `sendFirstSale` — funciones adicionales resultado del code review

- [x] T7 — Hooks en acciones existentes (AC3, AC4)
  - [x] T7.1: En `src/app/(buyer)/artisan/[id]/actions.ts` → `followArtisan()`: añadir fire-and-forget a `sendNewFollowerEmail(artisanId, session.user.id)` tras el `db.follow.create`
  - [x] T7.2: En `src/app/(artisan)/studio/products/new/actions.ts` → `createProduct()`: añadir fire-and-forget a `sendNewProductEmail(product.id)` tras el `db.product.create`

- [x] T8 — Cron de notificación de mensajes (AC5)
  - [x] T8.1: Crear `src/app/api/cron/send-message-notifications/route.ts` con método `GET`
  - [x] T8.2: Implementar lógica: buscar mensajes con `createdAt <= now - 5min`, `readAt IS NULL`, `emailNotifiedAt IS NULL`; agrupar por conversación; enviar email; marcar `emailNotifiedAt = now`
  - [x] T8.3: Añadir a `vercel.json` — schedule ajustado a `"0 * * * *"` (cada hora) por límite del plan Hobby de Vercel; ver nota en el propio route.ts

- [x] T9 — Typecheck y build limpio
  - [x] T9.1: `npx tsc --noEmit` sin errores
  - [x] T9.2: `npx next build` sin errores

### Review Findings

- [x] [Review][Decision] AC3 incompleto: NewFollowerEmail sin foto del seguidor y con botón roto — Resuelto: construir página `/studio/followers` (lista de seguidoras, foto+nombre), enlazarla desde `/studio/profile`, añadir foto al email y corregir el botón.
- [x] [Review][Decision] FirstSaleEmail.tsx (212 líneas) creado pero sin ninguna función que lo use — Resuelto: cablear ahora. El webhook de Stripe ya calcula si es la primera venta (`!previousOrders && firstSaleFeeWaived === "true"`); reutilizar ese booleano para elegir entre `sendNewSale`/`sendFirstSale`, extrayendo un helper compartido en resend.ts.
- [x] [Review][Decision] Botones duplicados en OrderConfirmationEmail y NewSaleEmail/FirstSaleEmail — Resuelto: lado compradora se queda igual (verificado: `/orders/[id]` sí tiene acción real de cancelar). Lado artesana: quitar "Cancelar pedido" (no existe esa acción en `/studio/orders/[id]`, solo `ConfirmShipmentForm`); dejar un único botón "Ver pedido en mi estudio". Corregir también el copy de FirstSaleEmail que prometía "24h para aceptar o cancelar" — no existe esa ventana; el plazo real es 5 días para confirmar envío/recogida. La idea de un gate real de aceptación/cancelación por la artesana queda anotada para una historia futura (ver memoria de proyecto).
- [x] [Review][Decision] La artesana nunca es notificada cuando el sistema cancela su pedido por incumplir el plazo de envío (con penalización aplicada) — Resuelto: nuevo template `OrderCancelledBySystemToArtisanEmail.tsx` + función `sendOrderCancelledBySystemToArtisanEmail`, wired en `cancel-overdue-orders/route.ts`.
- [x] [Review][Patch] resend.ts hardcodea "https://artelier.es" en vez de usar `getBaseUrl()` (ya existe en src/lib/stripe-url.ts) [src/lib/resend.ts]
- [x] [Review][Patch] Cron de mensajes: condición de carrera — se marca `emailNotifiedAt` antes de comprobar si el mensaje se leyó justo en ese intervalo [src/app/api/cron/send-message-notifications/route.ts]
- [x] [Review][Patch] sendNewMessageEmail no comprueba `message.deletedAt` — puede enviar contenido de un mensaje borrado entre el fetch del cron y el envío [src/lib/resend.ts]
- [x] [Review][Patch] Preview de mensaje: recorte a 100 + "…" da 101 caracteres, no 100 [src/lib/resend.ts]
- [x] [Review][Patch] sendNewProductEmail: Promise.allSettled no registra los rechazos — fallos de envío a seguidoras quedan invisibles [src/lib/resend.ts]
- [x] [Review][Patch] NewMessageEmail.tsx usa @ts-ignore sobre un `<image>` SVG en vez de tipar correctamente [src/lib/emails/NewMessageEmail.tsx] — `href` sí está tipado en @types/react ^19, el ts-ignore era obsoleto
- [x] [Review][Dismiss] package.json: dependencias @react-email/ui y react-email — Descartado: instaladas intencionalmente por Maldita como herramienta de desarrollo para previsualizar templates de email localmente (`react-email dev`), no es un descuido.
- [x] [Review][Patch] NewMessageEmail: si el mensaje solo tiene imageUrl (sin texto), el preview queda vacío sin indicar que hay una imagen [src/lib/resend.ts]
- [x] [Review][Patch] Botón de NewMessageEmail dice "Ver mensaje" en vez de "Ver conversación" (AC5 literal) [src/lib/emails/NewMessageEmail.tsx]
- [x] [Review][Patch] Documentar en código el motivo del cron horario (límite de Vercel Hobby) [src/app/api/cron/send-message-notifications/route.ts]
- [x] [Review][Patch] Construir página `/studio/followers` + enlace desde `/studio/profile` + foto de la seguidora en NewFollowerEmail + corregir botón [src/app/(artisan)/studio/followers/page.tsx, src/app/(artisan)/studio/profile/page.tsx, src/lib/emails/NewFollowerEmail.tsx, src/lib/resend.ts]
- [x] [Review][Patch] Cablear FirstSaleEmail: detectar primera venta en el webhook y elegir entre sendNewSale/sendFirstSale [src/app/api/webhooks/stripe/route.ts, src/lib/resend.ts]
- [x] [Review][Patch] Quitar botón "Cancelar pedido" del lado artesana (NewSaleEmail y FirstSaleEmail) y corregir copy de plazos [src/lib/emails/NewSaleEmail.tsx, src/lib/emails/FirstSaleEmail.tsx]
- [x] [Review][Patch] Nuevo template + función para notificar a la artesana la cancelación por el sistema con penalización [src/lib/emails/OrderCancelledBySystemToArtisanEmail.tsx, src/lib/resend.ts, src/app/api/cron/cancel-overdue-orders/route.ts]
- [x] [Review][Patch] Actualizar checklist de tareas, sprint-status.yaml y Dev Agent Record de esta historia
- [x] [Review][Defer] Fallo de envío en el cron de mensajes marca igual el resto del grupo como notificado, sin reintento [src/app/api/cron/send-message-notifications/route.ts] — deferred, consistente con patrón de fallo silencioso ya aceptado en H1.2
- [x] [Review][Defer] followArtisan() no impide auto-seguirse [src/app/(buyer)/artisan/[id]/actions.ts] — deferred, pre-existing de H1.4, fuera de alcance de esta historia
- [x] [Review][Defer] shippingCost/insuranceFee se reconstruyen por resta en vez de guardarse en el pedido [src/lib/resend.ts] — deferred, frágil si cambia la constante de envío, requiere columnas nuevas en Order
- [x] [Review][Defer] div con display:flex en cabecera de EmailLayout puede romperse en Outlook [src/lib/emails/EmailLayout.tsx] — deferred, ya hay un TODO reconociendo el mismo problema para el logo
- [x] [Review][Defer] URL de Google Fonts hardcodeada con hash de versión [src/lib/emails/EmailLayout.tsx] — deferred, bajo riesgo, hay fallback a Georgia
- [x] [Review][Defer] Todos los templates hardcodean "https://artelier.es" en el JSX de cada botón [src/lib/emails/*.tsx] — deferred, refactor amplio de 9 archivos, mejor como historia de hardening dedicada

## Dev Notes

### Stack de email — lo que ya existe

**Paquetes instalados** (no instalar nada nuevo):
- `resend@^6.12.3` — cliente de envío
- `@react-email/components@^1.0.12` — componentes HTML para templates

**`src/lib/resend.ts` — estado actual:**
El cliente `resend` y la constante `FROM_EMAIL = "noreply@artelier.es"` ya están exportados. Las 5 funciones existentes son stubs que solo hacen `console.log`. Ya están llamadas fire-and-forget en los lugares correctos:
- `sendOrderConfirmation` + `sendNewSale` → `src/app/api/webhooks/stripe/route.ts`
- `sendCancellationEmail` → `src/app/api/orders/[orderId]/cancel/route.ts`
- `sendShipmentConfirmedEmail` → `src/app/api/orders/[orderId]/confirm-shipment/route.ts`
- `sendOrderCancelledBySystemEmail` → `src/app/api/cron/cancel-overdue-orders/route.ts`

Esta historia solo modifica `resend.ts` para implementar las funciones y añadir las 3 nuevas. No hay que tocar los callers existentes.

### Patrón fire-and-forget

Todos los emails se envían así (nunca bloquear la respuesta HTTP):
```ts
void sendXxxEmail(data).catch(console.error);
```

### Cómo enviar con Resend y React Email

```ts
import { render } from "@react-email/components";
// o importar el componente directamente si resend acepta JSX:

await resend.emails.send({
  from: FROM_EMAIL,
  to: recipientEmail,
  subject: "Tu pedido ha sido confirmado",
  react: <OrderConfirmationEmail orderId={order.id} productName="..." />,
});
```

Resend acepta el prop `react` con JSX directamente (no hace falta llamar a `render()` manualmente). Verificar en la documentación de resend@6.x si la API ha cambiado.

### Datos que necesita cada función de email

Las funciones actuales reciben solo `order: Order` (modelo Prisma). Para el contenido del email hay que hacer fetch adicional dentro de la función:

```ts
export async function sendOrderConfirmation(order: Order) {
  const data = await db.order.findUnique({
    where: { id: order.id },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { name: true, imageUrls: true } },
      artisan: { select: { name: true, lastName: true } },
    },
  });
  if (!data?.buyer?.email) return; // guard: no email → no enviar
  await resend.emails.send({ ... });
}
```

**Datos por función:**
- `sendOrderConfirmation`: buyer.email, buyer.name, product.name, artisan.name, order.totalInCents, order.id
- `sendNewSale`: artisan.email, artisan.name, product.name, buyer.name+lastName+street+city+province, neto = order.totalInCents - order.platformFeeInCents - order.stripeFeeInCents, order.id
- `sendCancellationEmail`: buyer.email, buyer.name, product.name, order.cancellationReason, order.id
- `sendShipmentConfirmedEmail`: buyer.email, buyer.name, product.name, order.trackingNumber, artisan.name, order.id
- `sendOrderCancelledBySystemEmail`: buyer.email, buyer.name, product.name, order.id
- `sendNewFollowerEmail(followerId, artisanId)`: artisan.email, artisan.name, follower.name, follower.image, `/artisan/${followerId}`
- `sendNewProductEmail(productId)`: artisan.name, product.name, product.imageUrls[0], product.priceInCents, `/artisan/${artisanId}/products/${productId}`; lista de followers con email

### Diseño de emails — tokens Tinta y Lino

En React Email los estilos son CSS inline (Tailwind NO funciona en emails).

```ts
// Colores
const green = "#3d5a4f";
const cream = "#f5f1eb";
const textDark = "#2d2d2d";
const muted = "#6b7280";
const border = "#e8e2d9";

// Fuentes (fallbacks necesarios porque email clients no cargan Google Fonts)
const fontDisplay = "'The Girl Next Door', Georgia, serif"; // para "Artelier" en cabecera
const fontBody = "'DM Sans', 'Helvetica Neue', Arial, sans-serif"; // para el cuerpo

// Estructura recomendada de EmailLayout:
// <Html> → <Head> → <Body style={{ background: cream }}> →
//   <Container style={{ maxWidth: 560, margin: "0 auto" }}>
//     [Header con "Artelier" en fontDisplay y color green]
//     [Hr]
//     {children}
//     [Hr]
//     [Footer con links de baja]
//   </Container>
```

### Footer obligatorio (AC6)

Todos los emails deben incluir este footer (las páginas son placeholders que no existen aún):
```tsx
<Section style={{ textAlign: "center", padding: "16px 0" }}>
  <Text style={{ fontSize: "11px", color: muted, margin: 0 }}>
    <Link href="https://artelier.es/cuenta/notificaciones" style={{ color: muted }}>
      Preferencias de notificación
    </Link>
    {" · "}
    <Link href="https://artelier.es/baja" style={{ color: muted }}>
      Darse de baja
    </Link>
  </Text>
</Section>
```

### NewProduct — envío masivo a seguidoras

La artesana puede tener muchas seguidoras. Usar `Promise.allSettled` (nunca `await` secuencial en bucle):

```ts
export async function sendNewProductEmail(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      artisan: {
        select: { name: true },
        include: {
          followers: {
            include: { follower: { select: { email: true, name: true } } },
          },
        },
      },
    },
  });
  if (!product) return;

  await Promise.allSettled(
    product.artisan.followers.map(({ follower }) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: follower.email,
        subject: `Nueva publicación de ${product.artisan.name}`,
        react: <NewProductEmail ... />,
      })
    )
  );
}
```

Si la artesana tiene >50 seguidoras puede haber rate-limiting de Resend. Para esta historia no implementar batching (se añadirá si escala).

### Cron de mensajes (AC5) — diseño

**Requisito previo:** campo `emailNotifiedAt DateTime?` en modelo `Message` (T1).

**Lógica del cron:**
1. Buscar mensajes donde: `createdAt <= now - 5min` AND `readAt IS NULL` AND `emailNotifiedAt IS NULL`
2. Para evitar spam: agrupar por conversación y destinatario, tomar solo el mensaje más reciente de cada grupo
3. Hacer update de `emailNotifiedAt` y send del email en una transacción (o secuencialmente)
4. Marcar `emailNotifiedAt = now` ANTES de enviar el email (patrón seguro ante reenvíos)

**Patrón de cron heredado** (igual que `cancel-overdue-orders`):
```ts
export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
  return NextResponse.json({ data: { notified: count } });
}
```

**Nota sobre Vercel cron:** El schedule `*/5 * * * *` (cada 5 minutos) requiere plan Pro. En Hobby el mínimo es diario. Si el proyecto está en Hobby, usar `0 * * * *` (cada hora) y documentarlo.

**Ruta del destinatario según rol:**
- Si el destinatario es BUYER → enlace a `/messages/[conversationId]`
- Si el destinatario es ARTISAN → enlace a `/studio/messages/[conversationId]`

Para saber el rol del destinatario: el `senderId` es quien mandó el mensaje; el destinatario es el otro participante de la conversación (`Conversation.buyerId` o `Conversation.artisanId`).

### Modelo Message — campos relevantes

```prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  imageUrl       String?
  readAt         DateTime?        // null = no leído
  emailNotifiedAt DateTime?       // null = no notificado (AÑADIR en T1)
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())

  conversation Conversation @relation(...)
  sender       User         @relation(...)
}
```

El `readAt` ya existe en el schema — no hay que añadirlo. Solo añadir `emailNotifiedAt`.

### Archivos a crear

```
src/lib/emails/
  EmailLayout.tsx              ← layout base con header y footer
  OrderConfirmationEmail.tsx
  NewSaleEmail.tsx
  CancellationEmail.tsx
  ShipmentConfirmedEmail.tsx
  OrderCancelledBySystemEmail.tsx
  NewFollowerEmail.tsx
  NewProductEmail.tsx
  NewMessageEmail.tsx

src/app/api/cron/
  send-message-notifications/
    route.ts
```

### Archivos a modificar

```
src/lib/resend.ts                              ← implementar 5 stubs + añadir 3 nuevas
src/app/(buyer)/artisan/[id]/actions.ts        ← fire-and-forget en followArtisan
src/app/(artisan)/studio/products/new/actions.ts ← fire-and-forget en createProduct
prisma/schema.prisma                           ← emailNotifiedAt en Message
vercel.json                                    ← nuevo cron entry
```

### Lecciones de H5.4

- Las funciones en `resend.ts` que reciben `Order` deben hacer `db.order.findUnique` con `include` para obtener buyer/artisan/product. El `Order` base no tiene relaciones.
- Los crons usan `GET` (no `POST`) — el cron de mensajes debe usar `GET` también.
- El campo `emailNotifiedAt` se debe marcar ANTES de enviar el email para evitar doble envío en caso de reintento del cron.
- Las acciones de artesana usan `requireArtisanSession()`; las de comprador usan `getServerSession()` con check manual de rol.

## Dev Agent Record

### Debug Log

_Vacío_

### Completion Notes

- La fórmula de ganancia neta de la artesana de los Dev Notes (`total - platformFee - stripeFee`) estaba mal: `platformFeeInCents` ya incluye `stripeFeeInCents` (es la `application_fee_amount` completa de Stripe Connect, ver `checkout/route.ts`). La fórmula correcta implementada es `total - platformFee`.
- `shippingCostInCents`/`insuranceFeeInCents` no se guardan por separado en `Order`; se reconstruyen en `sendOrderConfirmation` a partir de `platformFeeInCents - stripeFeeInCents - shippingCost` (frágil si cambia `PLATFORM_SHIPPING_COST`, deferred).
- `sendOrderCancelledBySystemEmail` no tiene template propio: delega en `sendCancellationEmail` porque el contenido para la compradora es idéntico (mismo template, la diferencia ya está en `cancellationReason`).
- `productUrl` de `NewProductEmail` usa `/product/[id]` (página pública real), no `/artisan/[id]/products/[id]` como sugerían los Dev Notes.
- Code review (2026-07-08): 4 decisiones resueltas con Maldita — (1) nueva página `/studio/followers` en vez de dejar el botón del email roto; (2) `FirstSaleEmail` cableado detectando primera venta en el webhook, reutilizando el booleano ya calculado para `firstSaleCompleted`; (3) botón "Cancelar pedido" quitado del lado artesana porque esa acción no existe hoy (se detectó que el copy de 24h para aceptar/cancelar no correspondía a ninguna historia planificada — anotado en memoria de proyecto para una historia futura); (4) nueva notificación a la artesana cuando el sistema cancela su pedido con penalización.
- 16 hallazgos de patch aplicados, 6 diferidos a `deferred-work.md`, 1 descartado (dependencias de preview instaladas a propósito por Maldita).

## File List

**Nuevos:**
- `src/lib/emails/EmailLayout.tsx`
- `src/lib/emails/OrderConfirmationEmail.tsx`
- `src/lib/emails/NewSaleEmail.tsx`
- `src/lib/emails/FirstSaleEmail.tsx`
- `src/lib/emails/CancellationEmail.tsx`
- `src/lib/emails/OrderCancelledByBuyerEmail.tsx`
- `src/lib/emails/OrderCancelledBySystemToArtisanEmail.tsx`
- `src/lib/emails/ShipmentConfirmedEmail.tsx`
- `src/lib/emails/OrderReadyForPickupEmail.tsx`
- `src/lib/emails/NewFollowerEmail.tsx`
- `src/lib/emails/NewProductEmail.tsx`
- `src/lib/emails/NewMessageEmail.tsx`
- `src/lib/emails/tokens.ts`
- `src/app/api/cron/send-message-notifications/route.ts`
- `src/app/(artisan)/studio/followers/page.tsx`

**Modificados:**
- `src/lib/resend.ts`
- `src/lib/order-constants.ts` (`MESSAGE_NOTIFICATION_DELAY_MS`)
- `prisma/schema.prisma` (`emailNotifiedAt` en `Message`)
- `src/app/(buyer)/artisan/[id]/actions.ts`
- `src/app/(artisan)/studio/products/new/actions.ts`
- `src/app/(artisan)/studio/profile/page.tsx`
- `src/app/api/orders/[orderId]/cancel/route.ts`
- `src/app/api/orders/[orderId]/confirm-shipment/route.ts`
- `src/app/api/cron/cancel-overdue-orders/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `vercel.json`

## Change Log

- 2026-07-08: Implementadas T1-T9 (migración, templates, funciones de resend.ts, hooks, cron de mensajes).
- 2026-07-08: Code review — 4 decisiones resueltas, 16 patches aplicados, 6 diferidos, 1 descartado.
