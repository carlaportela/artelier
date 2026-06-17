# Historia 5.2 — Checkout con Método de Envío y Desglose Completo

## Descripción

Implementar el flujo de checkout que permite a las compradoras seleccionar método de envío, ver desglose de comisiones y realizar el pago a través de Stripe Checkout.

## Requisitos de Aceptación

### AC1 — Página de checkout con guardias
- [ ] Acceso solo para usuarios autenticados como BUYER
- [ ] Validar que el producto existe, está ACTIVE y no está borrado
- [ ] Validar que la artesana tiene stripeAccountId configurado
- [ ] Si falla cualquier guarda, mostrar error amigable con enlace al feed

### AC2 — Selector de método de envío
- [ ] Tres opciones: PLATFORM (4,90€), ARTISAN_OWN (gratis), PICKUP (gratis)
- [ ] Cambiar de método recalcula fees en tiempo real
- [ ] Guardias mostrar warnings según método

### AC3 — Desglose de comisiones
- [ ] Mostrar: precio producto, coste envío, comisión seguro (2%), fee Stripe (1,5% + 0,25€), total
- [ ] Los números en céntimos, mostrados en euros con formato local es-ES
- [ ] Recalcular dinámicamente al cambiar método

### AC4 — Validaciones antes de pagar
- [ ] Si envío sin garantía (ARTISAN_OWN o PICKUP): checkbox de confirmación
- [ ] Si producto PERISHABLE o UNIQUE: checkbox de desistimiento
- [ ] Botón Pagar deshabilitado hasta validaciones aceptadas
- [ ] Botón muestra "Procesando..." mientras se crea sesión Stripe

### AC5 — Endpoint POST /api/checkout
- [ ] Guardia: usuario autenticado como BUYER (401/403)
- [ ] Guardia: Stripe configurado (503)
- [ ] Rate limit: 5 req/60s por IP (429)
- [ ] Validar producto existe, active, y artesana tiene Stripe
- [ ] Calcular fees con misma lógica que form
- [ ] Crear Stripe Checkout Session con transfer_data y application_fee_amount
- [ ] Pasar metadata para webhook (productId, buyerId, shippingMethod, importes en céntimos)
- [ ] Devolver { data: { url: "https://checkout.stripe.com/..." } }

### AC6 — Página de éxito
- [ ] Muestra confirmación "¡Pago realizado!"
- [ ] Enlace a /orders (Mis pedidos)
- [ ] Stripe redirige automáticamente tras pago exitoso (success_url)

### AC7 — Flujo de compra desde producto
- [ ] Botón "Comprar" en página de producto para usuario autenticado
- [ ] Es un Link a /checkout?productId={id}
- [ ] Permanece aria-label="Comprar producto" para accesibilidad

## Dev Notes

### Archivos creados/modificados
- **CREAR** `src/lib/fees.ts` — constantes (PLATFORM_SHIPPING_COST, INSURANCE_FEE_RATE, STRIPE_FEE_RATE, STRIPE_FEE_FIXED) + función calcFees(priceInCents, shippingMethod)
- **CREAR** `src/app/(buyer)/checkout/page.tsx` — Server Component, guardias, renderiza CheckoutForm
- **CREAR** `src/app/(buyer)/checkout/CheckoutForm.tsx` — Client Component, formulario UI
- **CREAR** `src/app/api/checkout/route.ts` — POST handler, crea Stripe session
- **CREAR** `src/app/(buyer)/checkout/success/page.tsx` — Server Component confirmación
- **UPDATE** `src/app/(buyer)/product/[id]/page.tsx` — cambiar botón Comprar a Link

### Decisiones arquitectónicas

**Stripe Checkout Sessions en lugar de Elements:** Más sencillo, no requiere SDK cliente, less frontend code. Perfecto para V1.

**Order creación deferred a H5.3:** stripeEventId es @unique required en model Order, solo viene del webhook. Aquí solo creamos PaymentIntent, no Order.

**Metadata en Stripe session:** strings solo. Los números se pasan como String(...) y se usarán en H5.3 para crear el Order con valores exactos.

**Rate limiting en IP:** checkoutLimiter limita por IP del cliente (x-forwarded-for header). 5 req/60s es suficiente para prevenir spam sin frustrar users legítimos.

### Fee calculation (en céntimos)
```
shippingCost = method === "PLATFORM" ? 490 : 0
subtotal = priceInCents + shippingCost
insuranceFee = Math.round(subtotal * 0.02)
stripeFee = Math.round(subtotal * 0.015) + 25
total = subtotal + insuranceFee + stripeFee

application_fee_amount = shippingCost + insuranceFee + stripeFee
```

Artesana recibe: product.priceInCents (neto)
Plataforma se queda: application_fee_amount

### Type assertions
- `shippingMethod` en route.ts tipado como ShippingMethod desde el principio (en type assertion de req.json)
- `stripeSession.url` can be null según tipos de Stripe — validar === null explícitamente
- `Product.artisan.stripeAccountId` es `string | null` en schema — se valida === null en page.tsx antes de renderizar form

### Consideraciones UX
- Guardias amigables: mostrar error con Link de vuelta al feed, no dejar usuario colgado
- Fee preview: calculateo antes de enviar, mostrar al usuario exactamente qué va a pagar
- Loading state: botón deshabilitado durante POST, muestra "Procesando..."

## Status

- **Creada:** 2026-06-17
- **Implementada:** 2026-06-17
- **Estado:** review
