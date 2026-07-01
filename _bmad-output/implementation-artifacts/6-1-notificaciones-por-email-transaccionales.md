# Historia 6.1: Notificaciones por email transaccionales

Status: ready-for-dev

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

- [ ] T1 — Migración de base de datos
  - [ ] T1.1: Añadir `emailNotifiedAt DateTime?` al modelo `Message` en `prisma/schema.prisma`
  - [ ] T1.2: Ejecutar `npx prisma migrate dev --name add_message_email_notified_at`
  - [ ] T1.3: Verificar que el cliente Prisma se regenera correctamente

- [ ] T2 — Layout base de email
  - [ ] T2.1: Crear `src/lib/emails/EmailLayout.tsx` — wrapper con cabecera "Artelier" (The Girl Next Door), paleta Tinta y Lino, y pie de página con links de baja

- [ ] T3 — Templates de emails de pedido (AC1, AC2)
  - [ ] T3.1: Crear `src/lib/emails/OrderConfirmationEmail.tsx` (AC1)
  - [ ] T3.2: Crear `src/lib/emails/NewSaleEmail.tsx` (AC2)
  - [ ] T3.3: Crear `src/lib/emails/CancellationEmail.tsx` (ya stub en H5.4)
  - [ ] T3.4: Crear `src/lib/emails/ShipmentConfirmedEmail.tsx` (ya stub en H5.4)
  - [ ] T3.5: Crear `src/lib/emails/OrderCancelledBySystemEmail.tsx` (ya stub en H5.4)

- [ ] T4 — Templates de emails sociales (AC3, AC4)
  - [ ] T4.1: Crear `src/lib/emails/NewFollowerEmail.tsx` (AC3)
  - [ ] T4.2: Crear `src/lib/emails/NewProductEmail.tsx` (AC4)

- [ ] T5 — Template de email de mensaje (AC5)
  - [ ] T5.1: Crear `src/lib/emails/NewMessageEmail.tsx` (AC5)

- [ ] T6 — Implementar funciones de email en `src/lib/resend.ts`
  - [ ] T6.1: Implementar `sendOrderConfirmation(order)` — fetch buyer+product+artisan, render, send
  - [ ] T6.2: Implementar `sendNewSale(order)` — fetch artisan+product+buyer (con dirección), calcular neto, render, send
  - [ ] T6.3: Implementar `sendCancellationEmail(order)` — fetch buyer+product, render, send
  - [ ] T6.4: Implementar `sendShipmentConfirmedEmail(order)` — fetch buyer+product, render, send
  - [ ] T6.5: Implementar `sendOrderCancelledBySystemEmail(order)` — fetch buyer+product, render, send
  - [ ] T6.6: Añadir e implementar `sendNewFollowerEmail(followerId, artisanId)` — fetch ambos usuarios, render, send
  - [ ] T6.7: Añadir e implementar `sendNewProductEmail(productId)` — fetch producto+artesana+seguidoras, enviar a cada seguidora con Promise.allSettled

- [ ] T7 — Hooks en acciones existentes (AC3, AC4)
  - [ ] T7.1: En `src/app/(buyer)/artisan/[id]/actions.ts` → `followArtisan()`: añadir fire-and-forget a `sendNewFollowerEmail(artisanId, session.user.id)` tras el `db.follow.create`
  - [ ] T7.2: En `src/app/(artisan)/studio/products/new/actions.ts` → `createProduct()`: añadir fire-and-forget a `sendNewProductEmail(product.id)` tras el `db.product.create`

- [ ] T8 — Cron de notificación de mensajes (AC5)
  - [ ] T8.1: Crear `src/app/api/cron/send-message-notifications/route.ts` con método `GET`
  - [ ] T8.2: Implementar lógica: buscar mensajes con `createdAt <= now - 5min`, `readAt IS NULL`, `emailNotifiedAt IS NULL`; agrupar por conversación; enviar email; marcar `emailNotifiedAt = now`
  - [ ] T8.3: Añadir a `vercel.json`: `{ "path": "/api/cron/send-message-notifications", "schedule": "*/5 * * * *" }`

- [ ] T9 — Typecheck y build limpio
  - [ ] T9.1: `npx tsc --noEmit` sin errores
  - [ ] T9.2: `npx next build` sin errores

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

_Vacío_

## File List

_Se rellena durante la implementación_

## Change Log

_Se rellena durante la implementación_
