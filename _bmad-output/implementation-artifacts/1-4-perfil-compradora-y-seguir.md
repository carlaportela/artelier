# Historia 1.4: Perfil de compradora y seguir artesanas

## Status: in-progress

## Story

Como compradora, quiero gestionar mi perfil privado y seguir a las artesanas que me interesan, para personalizar mi experiencia y tener mi historial de compras accesible.

## Acceptance Criteria

**AC1 — Perfil privado de compradora**
- Dado que soy compradora autenticada y edito mi perfil en `/account`
- Cuando guardo los cambios
- Entonces mis datos (nombre, localidad) se actualizan en la base de datos
- Y mi perfil no tiene URL pública (solo artesanas tienen perfil público)

**AC2 — Seguir artesana**
- Dado que visito el perfil de una artesana
- Cuando pulso "Seguir"
- Entonces se crea la relación `Follow` en la base de datos
- Y el botón cambia a "Siguiendo" de forma inmediata (optimistic update)

**AC3 — Dejar de seguir**
- Dado que ya sigo a una artesana y pulso "Siguiendo"
- Cuando confirmo que quiero dejar de seguirla
- Entonces la relación `Follow` se elimina y el botón vuelve a "Seguir"

**AC4 — Lista de pedidos**
- Dado que accedo a `/orders`
- Cuando la página carga
- Entonces veo la lista de mis pedidos con estado, artesana, producto y fecha
- Y si no tengo pedidos, el empty state muestra el mensaje correspondiente

## Tasks/Subtasks

- [ ] T1: Perfil privado de compradora (`/account`)
  - [ ] T1.1: Crear página `/account` con formulario (nombre, localidad)
  - [ ] T1.2: Server Action `saveAccount` — valida con Zod, actualiza User en DB
  - [ ] T1.3: Proteger ruta `/account` en middleware (solo BUYER autenticada)

- [ ] T2: Seguir / dejar de seguir artesana
  - [ ] T2.1: Server Actions `followArtisan` y `unfollowArtisan`
  - [ ] T2.2: Actualizar `ArtisanHeader` — botón Follow activado con estado real
  - [ ] T2.3: Pasar `isFollowing` desde `ArtisanPublicPage` al header
  - [ ] T2.4: Optimistic update en el botón (useOptimistic o useState local)

- [ ] T3: Lista de pedidos (`/orders`)
  - [ ] T3.1: Crear página `/orders` con query de pedidos del comprador
  - [ ] T3.2: Componente `OrderList` con estado, artesana, producto, fecha
  - [ ] T3.3: Empty state si no hay pedidos

- [ ] T4: i18n — añadir claves necesarias a `es.json`

- [ ] T5: Verificación — typecheck + build

## Dev Notes

### Rutas y estructura de archivos

```
src/app/(buyer)/account/page.tsx          ← perfil privado compradora
src/app/(buyer)/account/actions.ts        ← saveAccount server action
src/app/(buyer)/orders/page.tsx           ← lista de pedidos
src/components/artisan/FollowButton.tsx   ← botón follow/unfollow (client)
src/app/(buyer)/artisan/[id]/actions.ts   ← followArtisan / unfollowArtisan
```

### Modelo Follow (ya existe en schema)
```prisma
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  follower    User     @relation("Follower", ...)
  following   User     @relation("Following", ...)
  @@unique([followerId, followingId])
}
```

### Patrón de optimistic update para Follow
- `useState` local inicializado con `isFollowing` prop del servidor
- Al pulsar: actualizar estado local inmediatamente, luego llamar Server Action
- Si la SA falla: revertir el estado local
- NO usar `useOptimistic` de React 18 — la SA puede fallar y queremos control explícito del rollback

### ArtisanPublicPage — cambios necesarios
- Añadir query de Follow: `db.follow.findUnique({ where: { followerId_followingId: { followerId: session?.user?.id ?? "", followingId: artisan.id } } })`
- Pasar `isFollowing: !!follow` a `ArtisanHeader`
- Solo mostrar el botón Follow si la sesión existe Y el usuario es BUYER

### Middleware — protección de `/account` y `/orders`
- Añadir `/account` y `/orders` al matcher de rutas protegidas (solo autenticados)
- No hace falta verificar rol en middleware para `/account` — la SA verifica

### Pedidos en `/orders`
- Query: `db.order.findMany({ where: { buyerId: session.user.id }, include: { product: { select: { name, imageUrls } }, artisan: { select: { name, id } } }, orderBy: { createdAt: 'desc' } })`
- Los pedidos reales llegan en Épico 5 (Stripe) — por ahora la lista puede estar vacía
- El empty state es el caso real para todos los usuarios en este sprint

### Validación perfil compradora
```typescript
const accountSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
});
```
- No incluir email — cambio de email requiere verificación (H1.5)

### i18n — claves necesarias (namespace "account")
```json
"account": {
  "editProfile": "Editar perfil",
  "saveChanges": "Guardar cambios",
  "profileSaved": "Perfil guardado",
  "name": "Nombre",
  "locality": "Localidad",
  "myOrders": "Mis pedidos",
  "noOrders": "Aquí verás tus pedidos cuando hagas tu primera compra",
  "orderStatus": {
    "CONFIRMED": "Confirmado",
    "IN_PREPARATION": "En preparación",
    "READY": "Listo para enviar",
    "SHIPPED": "Enviado",
    "DELIVERED": "Entregado",
    "ACCEPTED": "Aceptado",
    "CANCELLED": "Cancelado",
    "REFUNDED": "Reembolsado",
    "IN_DISPUTE": "En disputa"
  }
}
```

## Dev Agent Record

### File List
- `_bmad-output/implementation-artifacts/1-4-perfil-compradora-y-seguir.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log
- 2026-05-21: Story creada
