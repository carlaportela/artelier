---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# Artelier - Epic Breakdown

## Overview

Este documento descompone los requisitos del PRD, la especificación UX y la arquitectura de Artelier en épicos e historias implementables. Cada historia está diseñada para ser ejecutada por un agente de IA en una sola sesión con criterios de aceptación claros y verificables.

---

## Requirements Inventory

### Functional Requirements

FR1: Un visitante puede registrarse eligiendo el tipo de perfil: artesano o comprador
FR2: Un usuario registrado puede iniciar y cerrar sesión
FR3: Un usuario puede recuperar su contraseña
FR4: Un usuario puede editar su información de cuenta
FR5: Un usuario puede solicitar la eliminación de su cuenta y datos asociados (RGPD)
FR6: Un usuario puede exportar sus datos personales (RGPD)
FR7: Un usuario puede gestionar sus preferencias de cookies
FR8: Un artesano puede crear y editar su perfil público (foto, nombre, descripción, localidad, categoría)
FR9: Un artesano puede publicar actualizaciones de proceso en su pestaña de contenidos (texto + foto)
FR10: Un artesano puede solicitar sellos de verificación al administrador
FR11: Un artesano puede ver estadísticas básicas de su perfil (visitas, seguidores, ventas realizadas)
FR12: Un comprador puede ver y editar su perfil privado
FR13: Un comprador puede seguir y dejar de seguir artesanos
FR14: Un comprador puede ver su historial de compras y pedidos
FR15: Un artesano puede publicar un producto con foto, nombre, descripción, precio, categoría y tipo (único / perecedero)
FR16: Un artesano puede asignar a un producto perecedero una fecha de caducidad tras la cual se retira automáticamente
FR17: Un artesano puede editar y eliminar sus productos publicados
FR18: Un artesano puede recibir y responder solicitudes de pedido personalizado
FR19: El sistema marca un producto como no disponible cuando es comprado
FR20: El sistema retira automáticamente del catálogo los productos perecederos al vencer su fecha
FR21: Un visitante no registrado puede ver perfiles de artesanos y catálogos (acceso público, indexable)
FR22: Un comprador puede ver un feed cronológico de productos y contenidos de artesanos que sigue
FR23: Un usuario puede filtrar artesanos y productos por localidad
FR24: Un usuario puede buscar artesanos y productos por categoría
FR25: Un usuario puede filtrar artesanos y productos por sello de verificación
FR26: Un comprador puede iniciar una conversación privada con un artesano
FR27: Un artesano puede responder mensajes de compradores
FR28: Ambas partes pueden adjuntar imágenes en los mensajes
FR29: Un usuario puede ver el historial completo de sus conversaciones
FR30: Un comprador puede adquirir un producto mediante pasarela de pago integrada
FR31: El sistema muestra el desglose completo de costes antes de confirmar el pago
FR32: El sistema informa al comprador de las excepciones al derecho de desistimiento según el tipo de producto
FR33: Un comprador puede cancelar una compra dentro de las 24h con justificación
FR34: Un artesano puede elegir entre envío de plataforma, envío propio o recogida en persona
FR35: Un artesano puede confirmar el envío con número de seguimiento o marcar como listo para recogida
FR36: El sistema cancela automáticamente un pedido si el artesano no confirma envío en el plazo establecido
FR37: El sistema aplica penalización económica al artesano cuando el incumplimiento es imputable a él
FR38: Un usuario recibe notificación por email ante nueva venta, mensaje, seguidor o nuevo producto seguido
FR39: Un comprador recibe confirmación de pedido por email tras cada compra (LSSI)
FR40: Un artesano recibe notificación por email de cada nuevo pedido recibido
FR41: Un comprador puede abrir una solicitud de disputa o reembolso con evidencias adjuntas
FR42: Un artesano puede abrir una solicitud de disputa con evidencias adjuntas
FR43: El administrador puede revisar, aprobar o rechazar solicitudes de disputa y reembolso
FR44: El sistema aplica la política de devoluciones según el tipo de producto
FR45: El administrador puede revisar y aprobar o rechazar solicitudes de sellos de verificación
FR46: El administrador puede suspender o eliminar perfiles que incumplan las condiciones de uso
FR47: El administrador puede acceder a un panel con métricas básicas de actividad
FR48: La plataforma muestra aviso legal, política de privacidad, política de cookies y condiciones generales accesibles desde todas las páginas
FR49: La plataforma exime de la primera comisión de venta al artesano en su primera transacción completada
FR50: Un artesano puede actualizar el estado de fabricación de un pedido activo (En preparación → Listo → Enviado / Listo para recogida), visible para el comprador

### NonFunctional Requirements

NFR1: LCP < 2.5s en páginas de perfil y catálogo en conexiones 3G
NFR2: Checkout completo en menos de 5 segundos en condiciones normales de red
NFR3: Polling de mensajería actualiza conversaciones activas con latencia máxima de 10 segundos
NFR4: Disponibilidad operativa durante eventos de alta concurrencia (mercados de 48h) sin degradación del pago
NFR5: CLS < 0.1 en el flujo de pago
NFR6: Todas las comunicaciones sobre HTTPS/TLS 1.2 o superior
NFR7: Artelier no almacena datos de tarjeta — PCI delegado a Stripe
NFR8: Contraseñas con hash bcrypt coste mínimo 12
NFR9: Datos personales en servidores dentro de la Unión Europea
NFR10: Sesiones expiran tras 30 días de inactividad
NFR11: Panel de administración protegido con autenticación de doble factor (2FA)
NFR12: Logs de transacciones conservados mínimo 5 años (cumplimiento fiscal)
NFR13: Arquitectura soporta crecimiento de 100 a 10.000 usuarios sin cambios estructurales
NFR14: Sistema gestiona picos de 10x tráfico habitual en 48h sin interrupción del servicio de pagos
NFR15: Base de datos soporta 50.000 productos sin degradación de búsqueda y filtrado
NFR16: Interfaz web cumple WCAG 2.1 nivel AA
NFR17: Todas las imágenes incluyen texto alternativo descriptivo
NFR18: Flujo completo de compra navegable mediante teclado sin ratón
NFR19: Contrastes de color en elementos interactivos y textos ≥ 4.5:1 (WCAG AA)
NFR20: Integración con Stripe Connect Express ≥ 99.9% tasa de éxito de transacciones
NFR21: Emails transaccionales entregados en menos de 2 minutos desde el evento
NFR22: Sistema detecta y gestiona fallos de la API de Stripe con reintentos automáticos

### Additional Requirements

- **AR1 (Arquitectura):** Inicializar proyecto con T3 Stack sin tRPC: `npm create t3-app@latest artelier` + `npx shadcn@latest init` (New York style, CSS variables, Zinc). Esta es la primera historia de implementación.
- **AR2 (Arquitectura):** Schema Prisma completo con todos los modelos: User, Product, Order, Message, Conversation, Dispute, Seal, ProductSeal, Follow, ProcessUpdate, TransactionLog. Soft-delete en todas las entidades (campo `deletedAt`). TransactionLog con retención mínima 5 años (no soft-deleteable).
- **AR3 (Arquitectura):** Middleware de Next.js en Edge Runtime para protección de rutas: `/studio/*` requiere sesión, `/admin/*` requiere `role === 'ADMIN'`. Redirige a `/login` sin sesión, a `/feed` sin permiso.
- **AR4 (Arquitectura):** Auth.js v5 con credential provider (email/password) + database sessions + bcrypt cost 12. Separación `auth.config.ts` (Edge-safe) vs `lib/auth.ts` (con Prisma).
- **AR5 (Arquitectura):** TOTP 2FA obligatorio para admin. Librerías: otplib + qrcode. Flag `twoFactorVerified` en sesión verificado por el middleware del panel admin.
- **AR6 (Arquitectura):** Stripe Connect Express: onboarding artesano (account creation + return/refresh URLs), webhooks idempotentes con verificación de firma, campo `stripeEventId` en BD para idempotencia.
- **AR7 (Arquitectura):** Cloudinary como file storage. Función `POST /api/upload` (nunca credenciales de Cloudinary en el cliente). Devuelve `{ url, publicId }`. next/image + Cloudinary loader para cumplir LCP < 2.5s.
- **AR8 (Arquitectura):** Resend + react-email para emails transaccionales. 6 plantillas: OrderConfirmation, NewSale (artesano), PasswordReset, NewMessage (usuario inactivo), NewFollower, NewProduct (artesano seguido).
- **AR9 (Arquitectura):** Upstash Redis + @upstash/ratelimit para rate limiting en: `/api/auth/*`, `/api/messages/*`, `/api/checkout/*`, `/api/disputes/*`.
- **AR10 (Arquitectura):** Vercel Cron Job diario para retiro automático de productos perecederos vencidos: `POST /api/cron/expire-products` protegido con `CRON_SECRET`.
- **AR11 (Arquitectura):** Cursor-based pagination para feed y búsqueda. `GET /api/products?cursor=<lastId>&take=20`. Respuesta: `{ data: { items, nextCursor, hasMore } }`. Frontend: IntersectionObserver + append de items.
- **AR12 (Arquitectura):** next-intl configurado desde inicio. Mensajes en `src/i18n/messages/es.json`. Estructura preparada para gallego en V3.
- **AR13 (Arquitectura):** GitHub Actions CI/CD: lint + typecheck + tests en cada PR, deploy automático en merge a main. Sentry para monitorización de errores.
- **AR14 (Arquitectura):** Páginas legales estáticas (SSG): aviso legal, política de privacidad, política de cookies, condiciones generales de uso y venta (FR48, LSSI).

### UX Design Requirements

UX-DR1: Implementar sistema de design tokens Tinta y Lino como CSS custom properties y configuración Tailwind: `--primary` #3D5A4F, `--accent` #C4956A, `--bg` #F4F0E8, `--surface` #EAE5DA, `--text` #1A1A18, y tokens de sellos verificados
UX-DR2: Configurar tipografía self-hosted: The Girl Next Door (display/sellos/nav) + DM Sans (body/UI). Fuentes en `/public/fonts/`. Escala tipográfica documentada implementada en Tailwind.
UX-DR3: Componente `ProductCard` — foto aspect-ratio 1:1, precio, nombre producto, nombre artesana siempre visible, avatar artesana, sello(s) de esquina. Grid 2 col móvil, 3 col tablet, 4-5 col desktop. Skeleton loading.
UX-DR4: Componente `ArtisanHeader` — banner 80px móvil / 120px tablet, avatar superpuesto, nombre (The Girl Next Door 20px), localidad, bio breve, badges de perfil, botón Seguir (secondary). Skeleton loading.
UX-DR5: Componente `SealBadge` — dos sistemas visuales distintos: (1) sellos de producto: fondo sólido + borde crema, The Girl Next Door, para ProductCard; (2) badges de perfil: outlined, DM Sans, para ArtisanHeader. 5 sellos producto + 6 badges perfil con colores individuales.
UX-DR6: Componente `BottomNav` — 5 elementos: Inicio · Buscar · [+ Publicar] · Mensajes · Mi cuenta. Botón central en color acento, 44×44px mínimo. Visible en móvil/tablet, reemplazado por top nav en desktop. Indicador activo: dot bajo icono.
UX-DR7: Componente `OrderStatusTimeline` — 5 pasos: Confirmado → En preparación → Listo → Enviado → Entregado. Estados: done (✓ verde), active (✦ ámbar con halo), pending (○ gris). Lista `<ol>` con ARIA.
UX-DR8: Componente `ProcessUpdate` — tarjeta de actualización artesana. Nombre (The Girl Next Door bold) + timestamp (`<time>`) + texto entre comillas (`<blockquote>`, The Girl Next Door italic) + imagen opcional. Fondo tintado.
UX-DR9: Estrategia responsive mobile-first 3 breakpoints: base (320px) grid 2 col + BottomNav · md (768px) grid 3 col · lg (1024px) grid 4-5 col + nav lateral/top. max-width 900px en contenido, 1200px en catálogo desktop.
UX-DR10: Accesibilidad WCAG 2.1 AA: contrastes verificados (tabla en spec), touch targets 44×44px mínimo, navegación completa por teclado en flujo de compra, ARIA landmarks en nav y formularios, alt text en todas las imágenes.
UX-DR11: Flujo de publicación foto-primero en 3 pasos obligatorios: (1) foto(s) — cámara/galería · (2) precio + nombre · (3) tipo producto + publicar. Guardado automático de borrador. Validación inline por campo, nunca mensaje genérico.
UX-DR12: Patrón de registro diferido: feed público sin cuenta, registro solo al primer momento de acción (seguir, mensajear, comprar). Al completar registro, retomar la acción interrumpida automáticamente.
UX-DR13: Patrones UX slow commerce: sin "solo quedan X" con presión temporal, sin temporizadores, sin "X usuarios viendo esto". Stock limitado como unicidad positiva. Sin indicadores de "visto" en tiempo real en mensajes.
UX-DR14: Checkout con desglose completo visible antes del CTA de pago: precio + comisión plataforma + comisión seguro + fee Stripe = total. Aviso explícito de excepciones legales de desistimiento según tipo de producto. Botón con total en el label: "Pagar €XX,XX".
UX-DR15: Skeleton loading localizado (nunca spinner global): ProductCard, feed inicial (6 skeletons), perfil artesana (banner + avatar + líneas).
UX-DR16: Empty states con CTA para todas las pantallas principales: feed vacío, sin productos propios, sin mensajes, sin pedidos. Texto ligero en DM Sans, sin ilustraciones pesadas.
UX-DR17: Instalar shadcn/ui selectivamente: Button, Input, Card, Dialog, Tabs, Badge, Avatar, Sheet, Separator, Toast. Todos usando CSS variables del sistema de tokens Tinta y Lino.

### FR Coverage Map

FR1: Épico 1 — Registro con elección de rol
FR2: Épico 1 — Login / logout
FR3: Épico 1 — Recuperación de contraseña
FR4: Épico 1 — Editar información de cuenta
FR5: Épico 1 — Eliminación de cuenta y datos (RGPD)
FR6: Épico 1 — Exportación de datos personales (RGPD)
FR7: Épico 1 — Gestión de preferencias de cookies
FR8: Épico 1 — Crear y editar perfil público artesana
FR9: Épico 1 — Publicar actualizaciones de proceso en pestaña de contenidos
FR10: Épico 1 (solicitud artesana) + Épico 7 H7.1/H7.2 (sellos producto y badges perfil) + Épico 8 H8.3 (aprobación admin)
FR11: Épico 8 — Estadísticas básicas del perfil artesana
FR12: Épico 1 — Ver y editar perfil privado comprador
FR13: Épico 1 — Seguir y dejar de seguir artesanas
FR14: Épico 1 — Ver historial de compras y pedidos
FR15: Épico 2 — Publicar producto (foto, nombre, precio, categoría, tipo)
FR16: Épico 2 — Asignar fecha de caducidad a producto perecedero
FR17: Épico 2 — Editar y eliminar productos publicados
FR18: Épico 2 — Recibir y responder solicitudes de pedido personalizado
FR19: Épico 2 — Sistema marca producto no disponible al comprar
FR20: Épico 2 — Retiro automático de productos perecederos al vencer fecha (Cron)
FR21: Épico 3 — Acceso público a perfiles y catálogos sin cuenta (SEO)
FR22: Épico 3 — Feed cronológico para comprador de artesanas seguidas
FR23: Épico 3 — Filtrar por localidad
FR24: Épico 3 — Buscar por categoría
FR25: Épico 3 — Filtrar por sello de verificación
FR26: Épico 4 — Comprador inicia conversación con artesana
FR27: Épico 4 — Artesana responde mensajes
FR28: Épico 4 — Adjuntar imágenes en mensajes
FR29: Épico 4 — Ver historial completo de conversaciones
FR30: Épico 5 — Comprar producto con pasarela de pago
FR31: Épico 5 — Desglose completo de costes visible antes de confirmar pago
FR32: Épico 5 — Informar excepciones al desistimiento según tipo de producto
FR33: Épico 5 — Cancelar compra dentro de 24h
FR34: Épico 5 — Artesana elige método de envío
FR35: Épico 5 — Confirmar envío con número de seguimiento
FR36: Épico 5 — Cancelación automática si artesana no confirma envío en plazo
FR37: Épico 5 — Penalización económica a artesana por incumplimiento
FR38: Épico 6 — Notificación email: nueva venta, mensaje, seguidor, nuevo producto
FR39: Épico 6 — Confirmación de pedido por email al comprador (LSSI)
FR40: Épico 6 — Notificación email de nuevo pedido al artesana
FR41: Épico 7 — Comprador abre solicitud de disputa con evidencias
FR42: Épico 7 — Artesana abre solicitud de disputa con evidencias
FR43: Épico 7 H7.4 (resolución artesana) + Épico 8 H8.3 (resolución admin escalada)
FR44: Épico 7 H7.3 — Sistema aplica política de devoluciones según tipo de producto
FR45: Épico 7 H7.1/H7.2 (solicitud artesana) + Épico 8 H8.3 (aprobación/rechazo admin)
FR46: Épico 8 — Admin suspende o elimina perfiles por incumplimiento
FR47: Épico 8 — Panel de métricas básicas de actividad
FR48: Épico 8 — Páginas legales accesibles desde todas las páginas (LSSI)
FR49: Épico 5 — Primera venta sin comisión para la artesana
FR50: Épico 6 H6.2/H6.3 — Artesana actualiza estados de pedido; comprador confirma entrega y acepta

## Epic List

### Épico 0: Fundación y Sistema de Diseño
El proyecto queda inicializado con el stack completo, schema de base de datos, sistema de diseño Tinta y Lino, CI/CD, clientes de servicios externos (Resend, Cloudinary, Upstash) y estructura de directorios lista para construir las funcionalidades de usuario.
**ARs cubiertos:** AR1 · AR2 · AR3 · AR7 · AR8 · AR9 · AR12 · AR13

### Épico 1: Autenticación y Perfiles de Usuario
Artesanas y compradores pueden registrarse eligiendo su rol, iniciar sesión, crear y editar sus perfiles públicos o privados, seguir artesanas y gestionar sus derechos RGPD. Los perfiles de artesana son públicos e indexables.
**FRs cubiertos:** FR1 · FR2 · FR3 · FR4 · FR5 · FR6 · FR7 · FR8 · FR9 · FR10 (solicitud) · FR12 · FR13 · FR14
**ARs cubiertos:** AR4
**UX-DRs cubiertos:** UX-DR4 · UX-DR5 (badges perfil) · UX-DR6 · UX-DR10

### Épico 2: Catálogo y Publicación de Productos
Las artesanas pueden publicar, editar y gestionar sus productos con un flujo foto-primero en 3 pasos desde el móvil. El stock se agota automáticamente al comprar y los productos perecederos se retiran solos al vencer su fecha.
**FRs cubiertos:** FR15 · FR16 · FR17 · FR18 · FR19 · FR20
**ARs cubiertos:** AR7 · AR10
**UX-DRs cubiertos:** UX-DR3 · UX-DR5 (sellos producto) · UX-DR11 · UX-DR15 · UX-DR16

### Épico 3: Descubrimiento y Navegación Pública
Cualquier visitante puede explorar el catálogo sin cuenta (indexable por buscadores). Los compradores registrados tienen un feed personalizado cronológico. La búsqueda y filtros por localidad, categoría y sello funcionan con scroll infinito y cursor pagination.
**FRs cubiertos:** FR21 · FR22 · FR23 · FR24 · FR25
**ARs cubiertos:** AR11 · AR14
**UX-DRs cubiertos:** UX-DR9 · UX-DR12 · UX-DR13 · UX-DR16

### Épico 4: Mensajería
Compradores y artesanas pueden conversar directamente con polling cada 5-10s, adjuntar imágenes en los mensajes y acceder a su historial completo de conversaciones.
**FRs cubiertos:** FR26 · FR27 · FR28 · FR29
**ARs cubiertos:** AR9 (rate limiting mensajes)

### Épico 5: Pagos y Checkout
Un comprador puede completar una compra con desglose completo de costes visible y aviso de excepciones legales. La artesana cobra automáticamente a través de Stripe Connect. El sistema gestiona cancelaciones en 24h, métodos de envío, cancelaciones automáticas por incumplimiento y penalizaciones. Primera venta sin comisión.
**FRs cubiertos:** FR30 · FR31 · FR32 · FR33 · FR34 · FR35 · FR36 · FR37 · FR49
**ARs cubiertos:** AR6 · AR9 (rate limiting checkout)
**UX-DRs cubiertos:** UX-DR14

### Épico 6: Pedidos, Notificaciones y Proceso de En preparación
El comprador recibe su confirmación de pedido por email y puede seguir el estado en tiempo real. La artesana avanza los estados hasta Entregado; la compradora acepta el pedido (o el sistema lo hace automáticamente tras 48h), momento en que Stripe libera el pago. Todos los eventos importantes generan notificaciones por email.
**FRs cubiertos:** FR38 · FR39 · FR40 · FR50
**ARs cubiertos:** AR8
**UX-DRs cubiertos:** UX-DR7 · UX-DR8

### Épico 7: Confianza, Sellos y Disputas
Las artesanas pueden solicitar 5 sellos de producto y 3 badges de perfil verificados por admin, más 6 automáticos por umbrales. Compradores y artesanas pueden abrir disputas formales con evidencias; la artesana decide si requiere devolución física en pedidos estándar; las disputas sin acuerdo escalan al admin.
**FRs cubiertos:** FR41 · FR42 · FR43 · FR44 · FR45 (solicitud artesana)
**UX-DRs cubiertos:** UX-DR5 (sistema de sellos completo)

### Épico 8: Panel de Administración y Cumplimiento Legal
El admin tiene un panel protegido con TOTP 2FA donde puede ver métricas de actividad, moderar perfiles, aprobar/rechazar solicitudes de sellos, resolver disputas escaladas y ver estadísticas de artesanas. Las páginas legales obligatorias (LSSI) están publicadas y accesibles.
**FRs cubiertos:** FR11 · FR43 (escaladas) · FR45 (aprobación admin) · FR46 · FR47 · FR48
**ARs cubiertos:** AR5

---

## Épico 0: Fundación y Sistema de Diseño

El proyecto queda inicializado con el stack completo, sistema de diseño Tinta y Lino, CI/CD y estructura de directorios lista para construir funcionalidades de usuario.

### Historia 0.1: Inicialización del proyecto T3

Como desarrolladora,
quiero inicializar el proyecto con T3 Stack (sin tRPC) con shadcn/ui,
para tener el stack base listo para implementar funcionalidades desde el primer día.

**Acceptance Criteria:**

**Dado** que ejecuto el comando de inicialización de T3
**Cuando** completo la configuración interactiva (TypeScript ✓ · Tailwind ✓ · Auth.js ✓ · Prisma ✓ · tRPC ✗)
**Entonces** el proyecto compila sin errores con `npm run build`
**Y** `npm run dev` arranca en localhost sin errores

**Dado** que el proyecto está inicializado
**Cuando** ejecuto `npx shadcn@latest init` con New York style, CSS variables, Zinc
**Entonces** la carpeta `src/components/ui/` existe con la configuración base
**Y** `components.json` está en la raíz con la configuración correcta

**Dado** que el proyecto está configurado
**Cuando** reviso la estructura de directorios
**Entonces** existen `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/hooks/`, `src/stores/`, `src/i18n/`
**Y** `.env.example` documenta todas las variables de entorno necesarias (DATABASE_URL, AUTH_SECRET, STRIPE_*, CLOUDINARY_*, RESEND_*, UPSTASH_*)
**Y** `auth.config.ts` existe en la raíz del proyecto, separado de `src/lib/auth.ts`

### Historia 0.2: Sistema de diseño Tinta y Lino

Como desarrolladora,
quiero implementar el sistema de tokens de diseño y tipografía self-hosted,
para que todos los componentes usen la identidad visual de Artelier de forma consistente.

**Acceptance Criteria:**

**Dado** que abro `tailwind.config.ts` y el archivo CSS global
**Cuando** los reviso
**Entonces** contiene los tokens de color como CSS custom properties: `--primary` #3D5A4F · `--accent` #C4956A · `--bg` #F4F0E8 · `--surface` #EAE5DA · `--surface-2` #DDD7C8 · `--text` #1A1A18 · `--text-muted` #5A5648 · `--text-light` #8A8478 · `--border` #CCC8BC
**Y** los tokens de sellos verificados: `--seal-km0`, `--seal-galicia`, `--seal-eco`, `--seal-reciclado`, `--seal-mano` con sus colores de texto y fondo

**Dado** que existen los archivos de fuente en `public/fonts/`
**Cuando** cargo cualquier página de la app
**Entonces** The Girl Next Door y DM Sans se cargan desde el servidor local
**Y** el `<head>` no contiene ninguna referencia a `fonts.googleapis.com`
**Y** la directiva `@font-face` está declarada en el CSS global

**Dado** que shadcn/ui está inicializado
**Cuando** los componentes Button, Input, Card, Dialog, Tabs, Badge, Avatar, Sheet, Separator y Toast están instalados
**Entonces** todos usan CSS custom properties del sistema Tinta y Lino
**Y** el radio de borde base es `100px` para botones y `12px` para tarjetas

### Historia 0.3: CI/CD, middleware e i18n base

Como desarrolladora,
quiero tener el pipeline de integración continua, el middleware de protección de rutas y la base de internacionalización configurados,
para que cada PR valide el código automáticamente y la seguridad de rutas esté activa desde el primer deploy.

**Acceptance Criteria:**

**Dado** que abro un Pull Request en GitHub
**Cuando** el CI se ejecuta
**Entonces** corre lint (ESLint) + typecheck (`tsc --noEmit`) + build
**Y** el merge queda bloqueado si cualquiera de los tres falla

**Dado** que se mergea código a la rama `main`
**Cuando** el pipeline de Vercel se ejecuta
**Entonces** el deploy a producción se completa automáticamente
**Y** cada PR tiene su propia URL de preview generada por Vercel

**Dado** que un usuario no autenticado intenta acceder a `/studio/cualquier-ruta`
**Cuando** el middleware procesa la request en Edge Runtime
**Entonces** es redirigido a `/login`

**Dado** que un usuario con `role !== 'ADMIN'` intenta acceder a `/admin/cualquier-ruta`
**Cuando** el middleware procesa la request
**Entonces** es redirigido a `/feed`

**Dado** que existe `src/i18n/messages/es.json` con las claves base
**Cuando** cualquier componente usa `useTranslations()`
**Entonces** los textos se sirven desde el archivo JSON en castellano
**Y** la estructura de `src/i18n/` está preparada para añadir `gl.json` en V3 sin modificar componentes

### Historia 0.4: Configuración de servicios externos (Resend, Cloudinary, Upstash)

Como desarrolladora,
quiero tener los clientes de Resend, Cloudinary y Upstash Redis configurados e instanciados antes de que cualquier épico funcional los necesite,
para que Historia 1.2 (recuperación de contraseña), Historia 2.3 (subida de imágenes) y las rutas con rate limiting puedan implementarse sin dependencias pendientes.

**Acceptance Criteria:**

**Dado** que las variables de entorno `RESEND_API_KEY` y `RESEND_FROM_EMAIL` están definidas en `.env.local`
**Cuando** se importa `src/lib/resend.ts`
**Entonces** exporta una instancia singleton del cliente Resend lista para usar en Route Handlers y Server Actions
**Y** `.env.example` documenta ambas variables con valores de ejemplo

**Dado** que las variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` están definidas
**Cuando** `POST /api/upload` recibe un archivo
**Entonces** el endpoint sube la imagen a Cloudinary y devuelve `{ url, publicId }`
**Y** las credenciales de Cloudinary nunca se exponen al cliente (solo usadas en el servidor)
**Y** `.env.example` documenta las tres variables

**Dado** que las variables `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` están definidas
**Cuando** se importa `src/lib/ratelimit.ts`
**Entonces** exporta limiters preconfigurados para los endpoints que los necesitan: `authLimiter` (10 req/min) · `messageLimiter` (30 req/min) · `checkoutLimiter` (5 req/min) · `disputeLimiter` (5 req/hora)
**Y** `.env.example` documenta ambas variables

**Dado** que cualquiera de las tres integraciones no está configurada (variable de entorno vacía)
**Cuando** la aplicación arranca en desarrollo
**Entonces** aparece un warning en consola indicando qué variable falta, sin romper el arranque

---

## Épico 1: Autenticación y Perfiles de Usuario

Artesanas y compradores pueden registrarse eligiendo su rol, iniciar sesión, crear y editar sus perfiles, seguir artesanas y gestionar sus derechos RGPD. Los perfiles de artesana son públicos e indexables.

### Historia 1.1: Registro con elección de rol

Como visitante,
quiero registrarme eligiendo si soy artesana o compradora,
para acceder a la plataforma con la experiencia adecuada a mi perfil.

**Acceptance Criteria:**

**Dado** que soy visitante y accedo a `/register`
**Cuando** veo la pantalla de registro
**Entonces** hay una elección clara de rol: "Artesana / Productora" y "Compradora"
**Y** cada opción tiene un icono que comunica el rol sin jerga técnica

**Dado** que elijo "Artesana" y completo email + contraseña + localidad
**Cuando** envío el formulario
**Entonces** mi cuenta se crea con `role: 'ARTISAN'` en la base de datos
**Y** la contraseña se almacena con hash bcrypt coste mínimo 12
**Y** soy redirigida a `/studio/dashboard` con prompt para publicar mi primer producto

**Dado** que elijo "Compradora" y completo email + contraseña + localidad
**Cuando** envío el formulario
**Entonces** mi cuenta se crea con `role: 'BUYER'`
**Y** soy redirigida a `/feed`

**Dado** que introduzco un email ya registrado
**Cuando** envío el formulario
**Entonces** veo un error inline en el campo email: "Este email ya está registrado"
**Y** el formulario no se envía

**Dado** que omito un campo obligatorio
**Cuando** intento enviar el formulario
**Entonces** el campo afectado muestra su error específico junto a él, nunca un mensaje genérico

### Historia 1.2: Login, logout y recuperación de contraseña

Como usuaria registrada,
quiero iniciar y cerrar sesión y recuperar mi contraseña si la olvido,
para acceder de forma segura a mi cuenta en todo momento.

**Acceptance Criteria:**

**Dado** que accedo a `/login` con credenciales correctas
**Cuando** envío el formulario
**Entonces** se crea una sesión de base de datos (tabla `Session` en Prisma)
**Y** soy redirigida a `/studio/dashboard` si soy artesana, o a `/feed` si soy compradora

**Dado** que tengo sesión activa y cierro sesión
**Cuando** la acción se procesa
**Entonces** la sesión se elimina de la base de datos y soy redirigida a `/login`

**Dado** que accedo a `/login` ya con sesión activa
**Cuando** el middleware procesa la request
**Entonces** soy redirigida directamente a `/feed` sin mostrar el formulario

**Dado** que accedo a `/login` con credenciales incorrectas
**Cuando** envío el formulario
**Entonces** veo: "Email o contraseña incorrectos" (sin especificar cuál)
**Y** la sesión no se crea

**Dado** que introduzco mi email en el formulario de recuperación
**Cuando** envío la solicitud
**Entonces** si el email existe, se envía un enlace de recuperación válido 1 hora vía Resend
**Y** la respuesta siempre dice "Si el email existe, recibirás las instrucciones" (sin revelar si existe)

### Historia 1.3: Perfil público de artesana

Como artesana,
quiero crear y editar mi perfil público con foto, nombre, descripción, localidad y categoría,
para que las compradoras me descubran y conozcan mi trabajo.

**Acceptance Criteria:**

**Dado** que soy artesana autenticada y edito mi perfil en `/studio/profile`
**Cuando** guardo los cambios
**Entonces** mi perfil queda publicado en `/artisan/[id]` accesible sin autenticación
**Y** la página incluye meta tags Open Graph con mi nombre y foto (SSR)

**Dado** que un visitante accede a mi perfil público
**Cuando** ve la página
**Entonces** el componente `ArtisanHeader` muestra: banner, avatar, nombre (The Girl Next Door), localidad, bio breve y botón "Seguir"
**Y** la página es indexable por buscadores (sin `noindex`)

**Dado** que publico una actualización de proceso (texto + foto opcional) desde `/studio/profile`
**Cuando** la guardo
**Entonces** aparece en la pestaña "Proceso" de mi perfil en orden cronológico inverso
**Y** el texto se muestra en estilo `ProcessUpdate` con The Girl Next Door en blockquote

**Dado** que subo una foto de perfil o banner
**Cuando** el upload se procesa
**Entonces** la imagen va a `POST /api/upload` (nunca credenciales Cloudinary en el cliente)
**Y** el `publicId` de Cloudinary se guarda en la base de datos

### Historia 1.4: Perfil de compradora y seguir artesanas

Como compradora,
quiero gestionar mi perfil privado y seguir a las artesanas que me interesan,
para personalizar mi experiencia y tener mi historial de compras accesible.

**Acceptance Criteria:**

**Dado** que soy compradora autenticada y edito mi perfil en `/account`
**Cuando** guardo los cambios
**Entonces** mis datos (nombre, localidad, email) se actualizan en la base de datos
**Y** mi perfil no tiene URL pública (solo artesanas tienen perfil público)

**Dado** que visito el perfil de una artesana
**Cuando** pulso "Seguir"
**Entonces** se crea la relación `Follow` en la base de datos
**Y** el botón cambia a "Siguiendo" de forma inmediata (optimistic update)

**Dado** que ya sigo a una artesana y pulso "Siguiendo"
**Cuando** confirmo que quiero dejar de seguirla
**Entonces** la relación `Follow` se elimina y el botón vuelve a "Seguir"

**Dado** que accedo a `/orders`
**Cuando** la página carga
**Entonces** veo la lista de mis pedidos con estado, artesana, producto y fecha
**Y** si no tengo pedidos, el empty state muestra: "Aquí verás tus pedidos cuando hagas tu primera compra"

### Historia 1.5: Derechos RGPD y gestión de cuenta

Como usuaria registrada,
quiero editar mis datos, gestionar mis cookies, solicitar la eliminación de mi cuenta y exportar mis datos personales,
para ejercer mis derechos RGPD sobre la información que Artelier tiene sobre mí.

**Acceptance Criteria:**

**Dado** que accedo a `/account/settings` y cambio mi contraseña
**Cuando** guardo el cambio
**Entonces** la nueva contraseña se almacena con hash bcrypt coste 12
**Y** todas mis sesiones activas salvo la actual se invalidan

**Dado** que solicito la eliminación de mi cuenta y confirmo con mi contraseña
**Cuando** la acción se procesa
**Entonces** mis datos personales (nombre, email, foto) se anonimizan en la base de datos
**Y** el campo `deletedAt` se establece en la fecha actual (soft-delete)
**Y** todas mis sesiones activas se eliminan

**Dado** que solicito la exportación de mis datos
**Cuando** el sistema procesa la solicitud
**Entonces** recibo por email un archivo JSON con todos mis datos personales en menos de 24h

**Dado** que accedo a Artelier por primera vez
**Cuando** la página carga
**Entonces** aparece el banner de consentimiento de cookies con opciones: "Aceptar todas" / "Solo necesarias" / "Configurar"
**Y** mi elección queda guardada en una cookie de preferencias válida 12 meses

---

## Épico 2: Catálogo y Publicación de Productos

Las artesanas pueden publicar, editar y gestionar sus productos con un flujo foto-primero en 3 pasos desde el móvil. El stock se agota automáticamente al comprar y los perecederos se retiran solos al vencer su fecha.

### Historia 2.1: Publicar un producto (flujo foto-primero)

Como artesana,
quiero publicar un producto en 3 pasos desde el móvil empezando por la foto,
para tener mi catálogo en línea con la mínima fricción posible.

**Acceptance Criteria:**

**Dado** que soy artesana autenticada y pulso "+" en la BottomNav
**Cuando** se abre el flujo de publicación
**Entonces** el primer paso es seleccionar 1–3 fotos (cámara o galería), con vista previa reordenable
**Y** no hay campos de texto visibles en este primer paso

**Dado** que he seleccionado las fotos y avanzo al paso 2
**Cuando** veo el formulario mínimo
**Entonces** aparecen: nombre del producto, precio en euros, descripción breve (máx. 280 caracteres con contador visible) y tipo (Única pieza / Perecedero / Otro)
**Y** si elijo "Perecedero", aparece un campo de fecha límite de disponibilidad
**Y** si elijo "Única pieza", el stock queda fijado en 1 unidad automáticamente

**Dado** que completo los campos obligatorios y pulso "Publicar"
**Cuando** el sistema procesa la publicación
**Entonces** el producto aparece en mi pestaña de tienda en `/artisan/[id]`
**Y** veo un toast: "Tu producto ya está en línea"
**Y** si es mi primer producto, el toast especial dice: "¡Tu primera pieza ya está en Artelier!" (The Girl Next Door)

**Dado** que omito precio o foto
**Cuando** intento publicar
**Entonces** el campo específico muestra su error junto a él, no un mensaje genérico

**Dado** que subo las fotos del producto
**Cuando** el upload se procesa
**Entonces** van a `POST /api/upload` → Cloudinary con transformación automática (WebP, resize)
**Y** el `publicId` se guarda en la base de datos

### Historia 2.2: Editar, eliminar productos y gestionar sellos

Como artesana,
quiero editar los datos de mis productos, eliminarlos cuando sea necesario y asignarles sellos verificados,
para mantener mi catálogo actualizado y mostrar mis certificaciones.

**Acceptance Criteria:**

**Dado** que accedo a la edición de un producto en `/studio/products/[id]`
**Cuando** modifico precio, descripción, fotos o tipo y guardo
**Entonces** los cambios se reflejan inmediatamente en el perfil público
**Y** no puedo editar productos con pedidos activos en curso (aparece aviso explicativo)

**Dado** que decido eliminar un producto
**Cuando** confirmo la eliminación
**Entonces** el campo `deletedAt` se establece en la fecha actual (soft-delete)
**Y** el producto desaparece del catálogo público y del feed

**Dado** que quiero añadir sellos a un producto (Km 0, Hecho en Galicia, Ecológico, Reciclado, Hecho a mano)
**Cuando** los selecciono en el formulario de edición
**Entonces** los sellos verificados previamente aprobados por el admin aparecen en el `ProductCard`
**Y** los sellos se muestran como `SealBadge` en la esquina de la foto con estilo de sello de producto (fondo sólido, The Girl Next Door)

**Dado** que accedo a `/studio/products`
**Cuando** la página carga
**Entonces** veo todos mis productos con estado (Activo / Agotado / Perecedero vencido)
**Y** si no tengo productos, el empty state muestra: "Publica tu primera pieza" con CTA

### Historia 2.3: Gestión de stock y pedidos personalizados

Como artesana,
quiero que el stock se agote automáticamente al producirse una compra y poder recibir solicitudes de pedidos personalizados,
para que mi catálogo refleje siempre la disponibilidad real sin trabajo manual.

**Acceptance Criteria:**

**Dado** que una compradora compra una de mis piezas únicas
**Cuando** el pago se confirma (implementado en Épico 5)
**Entonces** el campo `status` del producto cambia a `SOLD` automáticamente
**Y** el producto aparece como "No disponible" en el catálogo público
**Y** ninguna otra compradora puede añadirlo al carrito

**Dado** que una compradora envía una solicitud de pedido personalizado
**Cuando** la recibo en `/studio/orders`
**Entonces** veo los detalles: descripción del encargo, presupuesto sugerido y datos de contacto
**Y** puedo aceptar (se inicia conversación en mensajería — Épico 4) o rechazar la solicitud

**Dado** que acepto un encargo personalizado
**Cuando** confirmo la aceptación
**Entonces** se crea una conversación privada entre yo y la compradora
**Y** la compradora recibe una notificación (Épico 6)

### Historia 2.4: Retiro automático de productos perecederos

Como artesana,
quiero que mis productos perecederos se retiren automáticamente del catálogo cuando vence su fecha límite,
para no hacer seguimiento manual y evitar que compradoras intenten adquirir productos ya no disponibles.

**Acceptance Criteria:**

**Dado** que publiqué un producto con fecha de caducidad `2026-05-20`
**Cuando** el Vercel Cron Job diario se ejecuta el día `2026-05-21`
**Entonces** el `status` del producto cambia a `EXPIRED`
**Y** el producto desaparece del catálogo público y del feed

**Dado** que el endpoint `POST /api/cron/expire-products` recibe una request
**Cuando** la request no incluye el header `Authorization: Bearer {CRON_SECRET}`
**Entonces** devuelve `401 Unauthorized` y no procesa nada

**Dado** que el Cron se ejecuta y no hay productos perecederos vencidos
**Cuando** la query se completa
**Entonces** devuelve `{ data: { expired: 0 } }` sin error

**Dado** que un producto perecedero tiene un pedido activo en curso cuando vence
**Cuando** el Cron se ejecuta
**Entonces** el producto no se marca como `EXPIRED` hasta que el pedido finalice
**Y** se registra en el log para revisión manual

---

## Épico 3: Descubrimiento y Navegación Pública

Cualquier visitante puede explorar el catálogo sin cuenta (indexable por buscadores). Las compradoras registradas tienen un feed personalizado cronológico con scroll infinito y cursor pagination.

### Historia 3.1: Feed público y perfiles indexables por SEO

Como visitante,
quiero explorar el catálogo y los perfiles de artesanas sin necesidad de registrarme,
para descubrir Artelier de forma libre antes de decidir si me registro.

**Acceptance Criteria:**

**Dado** que accedo a Artelier sin cuenta
**Cuando** llego a la página principal
**Entonces** veo el feed de productos con `ProductCard` visible — foto, precio, nombre del producto y nombre de la artesana
**Y** no hay ningún muro de registro ni banner bloqueante antes de ver el contenido

**Dado** que hago clic en un `ProductCard`
**Cuando** accedo al detalle del producto
**Entonces** la página carga con SSR y tiene meta tags Open Graph (título, descripción, imagen)
**Y** la URL es limpia e indexable con slug del producto

**Dado** que hago clic en el nombre de la artesana desde el catálogo
**Cuando** accedo a su perfil
**Entonces** la página carga con SSR y es indexable por buscadores
**Y** el `ArtisanHeader` muestra banner, avatar, nombre, localidad, bio y badges de perfil

**Dado** que intento seguir a una artesana o comprar sin cuenta
**Cuando** pulso la acción
**Entonces** se me redirige a `/register` con el contexto de la acción interrumpida
**Y** tras completar el registro, la acción interrumpida se retoma automáticamente

### Historia 3.2: Feed personalizado con scroll infinito (cursor pagination)

Como compradora registrada,
quiero un feed cronológico de productos de las artesanas que sigo con scroll infinito,
para descubrir novedades sin perder items aunque se publiquen nuevos mientras navego.

**Acceptance Criteria:**

**Dado** que soy compradora autenticada y accedo a `/feed`
**Cuando** la página carga
**Entonces** veo los productos de las artesanas que sigo en orden cronológico inverso
**Y** se muestran 20 items por página con skeletons de `ProductCard` durante la carga

**Dado** que llego al final de la primera página
**Cuando** el `IntersectionObserver` detecta el último item visible
**Entonces** se hace `GET /api/products?cursor=<lastId>&take=20` automáticamente
**Y** los nuevos items se añaden al feed sin reemplazar los anteriores (append)
**Y** si `hasMore: false` no se hacen más requests

**Dado** que una artesana publica un producto nuevo mientras estoy haciendo scroll
**Cuando** cargo la siguiente página
**Entonces** no aparecen items duplicados ni saltos en el feed (cursor pagination lo garantiza)

**Dado** que no sigo a ninguna artesana todavía
**Cuando** accedo a `/feed`
**Entonces** el empty state muestra: "Descubre artesanas cerca de ti" con CTA a la búsqueda

### Historia 3.3: Búsqueda y filtros por localidad, categoría y sello

Como usuaria (visitante o registrada),
quiero buscar artesanas y productos por localidad, categoría o sello de verificación,
para encontrar lo que me interesa sin navegar todo el catálogo.

**Acceptance Criteria:**

**Dado** que accedo a la búsqueda y selecciono una localidad
**Cuando** el filtro se aplica
**Entonces** el feed muestra solo artesanas y productos de esa localidad
**Y** el filtro activo es visible con opción de eliminarlo

**Dado** que selecciono una categoría (cerámica, textil, alimentación, joyería…)
**Cuando** el filtro se aplica
**Entonces** solo aparecen productos de esa categoría
**Y** los filtros de localidad y categoría son combinables entre sí

**Dado** que selecciono un sello verificado (Km 0, Ecológico…)
**Cuando** el filtro se aplica
**Entonces** solo aparecen productos que tienen ese sello aprobado por el admin

**Dado** que el resultado tiene más de 20 items
**Cuando** llego al final de la lista
**Entonces** se carga la siguiente página con el mismo mecanismo de cursor pagination

**Dado** que no hay resultados para los filtros seleccionados
**Cuando** la búsqueda se completa
**Entonces** el empty state muestra: "No encontramos nada con estos filtros" con CTA para ampliar la búsqueda

### Historia 3.4: Páginas legales estáticas (LSSI)

Como visitante o usuaria,
quiero acceder al aviso legal, política de privacidad, cookies y condiciones generales desde cualquier página,
para conocer mis derechos y las condiciones de uso antes de comprar.

**Acceptance Criteria:**

**Dado** que accedo a cualquier página de Artelier
**Cuando** veo el footer
**Entonces** hay enlaces visibles a: Aviso legal · Privacidad · Cookies · Condiciones de uso
**Y** los enlaces son accesibles sin autenticación

**Dado** que accedo a cualquiera de las páginas legales
**Cuando** la página carga
**Entonces** se sirve como página estática (SSG) sin llamadas al servidor en tiempo real
**Y** el contenido está estructurado con encabezados legibles

**Dado** que un motor de búsqueda indexa las páginas legales
**Cuando** las rastrea
**Entonces** tienen meta tags correctos y no están bloqueadas con `noindex`

---

## Épico 4: Mensajería

Compradoras y artesanas pueden conversar directamente con actualización por polling, adjuntar imágenes y acceder a su historial completo de conversaciones.

### Historia 4.1: Iniciar y gestionar conversaciones

Como compradora,
quiero iniciar una conversación privada con una artesana desde su perfil o desde un producto,
para coordinar un encargo personalizado o hacer preguntas antes de comprar.

**Acceptance Criteria:**

**Dado** que soy compradora autenticada y pulso "Enviar mensaje" en el perfil o producto de una artesana
**Cuando** se abre la pantalla de conversación
**Entonces** si ya existe una conversación previa entre nosotras, se abre la existente (no se crea duplicada)
**Y** si es nueva, la `Conversation` se crea en la base de datos al enviar el primer mensaje

**Dado** que accedo a `/messages`
**Cuando** la página carga
**Entonces** veo la lista de todas mis conversaciones ordenadas por último mensaje (más reciente primero)
**Y** cada conversación muestra: avatar + nombre de la otra parte, último mensaje truncado y timestamp
**Y** si no tengo conversaciones, el empty state muestra: "Tus conversaciones con artesanas aparecerán aquí"

**Dado** que tengo mensajes no leídos en una conversación
**Cuando** veo la lista de conversaciones
**Entonces** esa conversación aparece con un indicador de no leído (dot de color primario)
**Y** el indicador desaparece al abrir la conversación

### Historia 4.2: Enviar y recibir mensajes con polling

Como artesana o compradora,
quiero enviar mensajes y ver los mensajes nuevos en tiempo casi real,
para mantener una conversación fluida sin recargar la página manualmente.

**Acceptance Criteria:**

**Dado** que estoy en una conversación activa con la pestaña en primer plano
**Cuando** han pasado 5 segundos desde la última actualización
**Entonces** se hace automáticamente `GET /api/messages/[conversationId]?since=<timestamp>`
**Y** los mensajes nuevos aparecen al final sin recargar la página

**Dado** que cambio de pestaña o minimizo el navegador
**Cuando** la Page Visibility API detecta que la pestaña está en segundo plano
**Entonces** el polling se pausa automáticamente y se reanuda al volver

**Dado** que escribo un mensaje y pulso "Enviar"
**Cuando** el mensaje se procesa
**Entonces** aparece en la conversación de forma inmediata (optimistic update)
**Y** se guarda en la base de datos vía `POST /api/messages/[conversationId]`
**Y** si el envío falla, el mensaje se marca con error y hay opción de reintentar

**Dado** que el endpoint de mensajes recibe más de 30 requests por minuto desde la misma IP
**Cuando** el rate limiter de Upstash Redis evalúa la request
**Entonces** devuelve `429 Too Many Requests` con el header `Retry-After`

### Historia 4.3: Adjuntar imágenes y ver historial completo

Como artesana o compradora,
quiero adjuntar imágenes en mis mensajes y ver el historial completo de una conversación,
para compartir fotos de referencias o del proceso de fabricación directamente en el chat.

**Acceptance Criteria:**

**Dado** que pulso el icono de adjuntar imagen en el chat
**Cuando** selecciono una imagen de la galería
**Entonces** la imagen se sube a `POST /api/upload` → Cloudinary
**Y** aparece en la conversación como imagen inline clicable (abre en tamaño completo)
**Y** el `publicId` de Cloudinary se guarda junto al mensaje en la base de datos

**Dado** que accedo a una conversación con muchos mensajes
**Cuando** la página carga
**Entonces** veo los mensajes más recientes (últimos 30) con scroll hacia arriba para cargar anteriores
**Y** el scroll se posiciona en el último mensaje al abrir la conversación

**Dado** que la conversación incluye mensajes de texto e imágenes
**Cuando** un lector de pantalla navega por ella
**Entonces** cada imagen tiene `alt` descriptivo, el `<time>` de cada mensaje es legible
**Y** la lista de mensajes usa el landmark semántico correcto

---

## Épico 5: Pagos y Checkout

Una compradora completa una compra con desglose completo de costes y elección de método de envío antes de pagar. La artesana cobra automáticamente vía Stripe Connect. El sistema gestiona cancelaciones en 24h, confirmación de envío y penalizaciones por incumplimiento. Primera venta sin comisión.

### Historia 5.1: Onboarding de artesana en Stripe Connect

Como artesana,
quiero conectar mi cuenta bancaria con Stripe Connect,
para poder recibir los pagos de mis ventas directamente en mi cuenta.

**Acceptance Criteria:**

**Dado** que soy artesana autenticada sin cuenta Stripe conectada
**Cuando** intento publicar mi primer producto
**Entonces** veo un aviso: "Conecta tu cuenta bancaria para poder vender" con CTA

**Dado** que inicio el proceso de onboarding de Stripe
**Cuando** pulso "Conectar cuenta bancaria"
**Entonces** se crea una Stripe Connect Express account vía API
**Y** soy redirigida al flujo de onboarding de Stripe (KYC delegado a Stripe)
**Y** Stripe tiene configuradas las URLs `return_url` y `refresh_url` correctas apuntando a Artelier

**Dado** que completo el onboarding en Stripe y regreso a Artelier
**Cuando** llego a la `return_url`
**Entonces** mi `stripeAccountId` queda guardado en la base de datos
**Y** veo confirmación: "Tu cuenta bancaria está conectada. Ya puedes vender."

**Dado** que el onboarding de Stripe queda incompleto o expira
**Cuando** regreso a Artelier vía `refresh_url`
**Entonces** se genera un nuevo enlace de onboarding y se me redirige automáticamente

### Historia 5.2: Checkout con método de envío y desglose completo de costes

Como compradora,
quiero elegir el método de envío durante el checkout y ver el desglose completo del coste total antes de confirmar el pago,
para tomar una decisión informada y saber exactamente qué protección tengo según el envío que elija.

**Acceptance Criteria:**

**Dado** que accedo al checkout en `/checkout`
**Cuando** veo la pantalla de pago
**Entonces** hay un selector de método de envío con las opciones disponibles: envío con la plataforma (precio incluido) / envío propio de la artesana / recogida en persona
**Y** al seleccionar cada opción, el desglose de costes se actualiza en tiempo real con el precio final

**Dado** que selecciono "envío con la plataforma"
**Cuando** el desglose se actualiza
**Entonces** el desglose muestra en líneas separadas: precio del producto + coste de envío + comisión de plataforma (%) + comisión de seguro (%) + fee Stripe = **Total**
**Y** el botón de pago muestra el total en su label: "Pagar XX,XX€"

**Dado** que selecciono "envío propio de la artesana" o "recogida en persona"
**Cuando** el desglose se actualiza
**Entonces** aparece un aviso destacado: "Sin envío de la plataforma, el seguimiento y la protección ante incidencias son limitados"
**Y** debo marcar un checkbox confirmando que entiendo las implicaciones antes de poder pagar

**Dado** que el producto es perecedero o personalizado
**Cuando** veo el checkout
**Entonces** hay un aviso explícito antes del botón de pago sobre la excepción al derecho de desistimiento (Art. 103 Directiva 2011/83/UE)
**Y** debo marcar un checkbox de aceptación separado antes de poder confirmar

**Dado** que confirmo el pago y Stripe procesa la transacción correctamente
**Cuando** el pago se completa
**Entonces** el `status` del producto cambia a `SOLD`
**Y** se crea el registro `Order` con `stripePaymentIntentId` y el método de envío elegido
**Y** soy redirigida a la confirmación de pedido

**Dado** que el pago falla
**Cuando** Stripe devuelve el error
**Entonces** veo el mensaje de error específico traducido al español
**Y** todos los datos del formulario se conservan (no se pierde lo introducido)

**Dado** que el endpoint `/api/checkout` recibe más de 10 requests por minuto desde la misma IP
**Cuando** el rate limiter evalúa la request
**Entonces** devuelve `429 Too Many Requests`

### Historia 5.3: Webhooks de Stripe e idempotencia de pagos

Como sistema,
quiero procesar los eventos de Stripe de forma segura e idempotente,
para garantizar que ningún pago se procese dos veces aunque Stripe reenvíe el mismo evento.

**Acceptance Criteria:**

**Dado** que Stripe envía un evento `payment_intent.succeeded` al webhook `POST /api/webhooks/stripe`
**Cuando** el endpoint recibe la request
**Entonces** verifica la firma con `stripe.webhooks.constructEvent` usando `STRIPE_WEBHOOK_SECRET`
**Y** si la firma es inválida, devuelve `400 Bad Request` sin procesar nada

**Dado** que el evento tiene firma válida
**Cuando** se procesa
**Entonces** busca en la base de datos si ya existe un `Order` con ese `stripeEventId`
**Y** si ya existe (evento duplicado), devuelve `200 OK` sin volver a crear el pedido

**Dado** que es la primera vez que llega ese evento
**Cuando** se procesa correctamente
**Entonces** se crea el `Order`, se actualiza el `status` del producto a `SOLD`
**Y** se guarda el `stripeEventId` en la base de datos para garantizar idempotencia
**Y** se llama a `sendOrderConfirmation(order)` y `sendNewSale(order)` desde `src/lib/resend.ts` — estas funciones deben existir aunque devuelvan `void` sin implementación real hasta Historia 6.1; el webhook no falla si el envío de email falla (fire-and-forget con try/catch silencioso)

**Dado** que ocurre un error interno al procesar el evento
**Cuando** el endpoint devuelve `500`
**Entonces** Stripe reintenta el evento con exponential backoff
**Y** el error queda registrado en Sentry

### Historia 5.4: Confirmación de envío, cancelaciones y penalizaciones

Como artesana y compradora,
quiero que el sistema gestione las cancelaciones en 24h, la confirmación del envío por parte de la artesana y las penalizaciones automáticas por incumplimiento,
para que el proceso postventa sea transparente y proteja a ambas partes.

**Acceptance Criteria:**

**Dado** que soy compradora y han pasado menos de 24h desde la confirmación del pedido
**Cuando** accedo al detalle del pedido en `/orders/[id]` y solicito la cancelación
**Entonces** puedo cancelarla con una justificación
**Y** el importe íntegro se devuelve automáticamente a mi método de pago vía Stripe Refund

**Dado** que soy artesana con un pedido confirmado en `/studio/orders/[id]`
**Cuando** preparo el envío
**Entonces** puedo confirmar el envío introduciendo el número de seguimiento (si aplica) o marcando "Listo para recogida"
**Y** el estado del pedido avanza y la compradora ve la actualización en su historial

**Dado** que la artesana no confirma el envío dentro del plazo establecido
**Cuando** el Cron Job diario detecta el vencimiento
**Entonces** el pedido se cancela automáticamente
**Y** el importe íntegro se devuelve a la compradora
**Y** se aplica una penalización económica a la artesana (descuento en su siguiente pago vía Stripe)

**Dado** que es la primera venta completada de una artesana
**Cuando** Stripe distribuye el pago
**Entonces** la comisión de plataforma no se descuenta de esa transacción (FR49)
**Y** el campo `firstSaleCompleted` de la artesana se marca como `true` en la base de datos

---

## Épico 6: Pedidos, Notificaciones y Proceso de En preparación

El comprador recibe su confirmación de pedido por email y puede seguir el estado de En preparación en tiempo real con actualizaciones personales de la artesana. Todos los eventos importantes generan notificaciones por email.

### Historia 6.1: Notificaciones por email transaccionales

Como usuaria de Artelier,
quiero recibir emails transaccionales bien diseñados en todos los eventos importantes,
para estar informada sin tener que entrar en la aplicación.

**Acceptance Criteria:**

**Dado** que soy compradora y acabo de completar el pago
**Cuando** el webhook de Stripe confirma el pago
**Entonces** recibo un email `OrderConfirmation` con: nombre del producto, nombre de la artesana, precio pagado, número de pedido, y botón "Ver mi pedido" que enlaza a `/orders/[id]`

**Dado** que soy artesana y alguien ha comprado uno de mis productos
**Cuando** el webhook de Stripe confirma el pago
**Entonces** recibo un email `NewSale` con: nombre del producto vendido, precio (comisión ya descontada si aplica), datos de envío del comprador, y botón "Ver pedido en mi estudio" que enlaza a `/studio/orders/[id]`

**Dado** que soy artesana y alguien me empieza a seguir
**Cuando** se crea un nuevo `Follow` en la base de datos
**Entonces** recibo un email `NewFollower` con el nombre y foto del comprador y botón "Ver su perfil"

**Dado** que soy compradora que sigo a una artesana
**Cuando** la artesana publica un nuevo producto
**Entonces** recibo un email `NewProduct` con foto, nombre y precio del producto, y botón "Ver producto" que enlaza al catálogo

**Dado** que soy usuaria y recibo un mensaje privado mientras no estoy activa en la app
**Cuando** han transcurrido 5 minutos desde el último mensaje no leído
**Entonces** recibo un email `NewMessage` con el nombre del remitente, un preview del mensaje, y botón "Ver conversación" que enlaza a `/messages/[conversationId]`
**Y** no se envía si el destinatario ha leído el mensaje antes de que expiren los 5 minutos

**Dado** que cualquier email transaccional es enviado
**Cuando** se renderiza
**Entonces** usa los tokens de diseño Tinta y Lino (The Girl Next Door para el nombre de Artelier en cabecera, DM Sans para el cuerpo)
**Y** incluye pie de página con enlace a preferencias de notificación y enlace de baja
**Y** es enviado mediante Resend con `from: noreply@artelier.es`

### Historia 6.2: Timeline de estados y actualizaciones de proceso

Como artesana y compradora,
quiero visualizar el progreso de un pedido en un timeline claro y que la artesana pueda añadir mensajes personales en cada avance de estado,
para que el proceso sea transparente y humano desde la confirmación hasta el envío.

**Acceptance Criteria:**

**Dado** que soy artesana con un pedido confirmado en `/studio/orders/[id]`
**Cuando** visualizo el detalle del pedido
**Entonces** veo el componente `OrderStatusTimeline` con los 6 estados: Confirmado → **En preparación** → Listo → Enviado → Entregado → Aceptado
**Y** el estado actual aparece marcado con `aria-current="step"` en el `<ol>` subyacente

**Dado** que soy artesana y quiero avanzar el estado del pedido
**Cuando** pulso "Avanzar estado" en el panel de estudio
**Entonces** puedo avanzar la secuencia Confirmado → En preparación → Listo → Enviado, añadiendo un mensaje personal opcional (máx. 280 caracteres) en cada paso
**Y** el mensaje personal se muestra como componente `ProcessUpdate` en el timeline de la compradora
**Y** el paso a "Entregado" no está disponible manualmente si el pedido usa envío de la plataforma — en ese caso lo marca el sistema automáticamente vía webhook del carrier (Historia 6.3)
**Y** el paso a "Aceptado" es exclusivo de la compradora o del sistema por vencimiento (Historia 6.3)

**Dado** que soy compradora viendo `/orders/[id]`
**Cuando** la artesana actualiza el estado del pedido
**Entonces** el timeline se actualiza automáticamente (polling cada 30s si la pestaña está visible, pausado si `document.hidden`)
**Y** veo el estado actualizado y el mensaje personal de la artesana como `ProcessUpdate`
**Y** recibo un email de notificación con el nuevo estado (Historia 6.1)

### Historia 6.3: Confirmación de entrega, aceptación del comprador y liberación de pago

Como artesana y compradora,
quiero que el estado "Entregado" se marque automáticamente cuando la mensajería lo confirme o manualmente cuando la artesana lo entregue en persona, y que el pago se libere solo cuando la compradora acepte o transcurran 48 horas sin disputa,
para que ambas partes estén protegidas hasta el cierre definitivo.

**Acceptance Criteria:**

**Dado** que el pedido usa el método de envío integrado de la plataforma
**Cuando** la empresa de mensajería confirma la entrega vía webhook
**Entonces** el `Order.status` pasa automáticamente a `ENTREGADO` sin intervención de la artesana
**Y** se registra el timestamp de entrega y el identificador del evento del courier en el pedido

**Dado** que el pedido usa un método de envío independiente (courier externo no gestionado por la plataforma)
**Cuando** la artesana recibe confirmación de entrega por parte del courier externo
**Entonces** puede marcar manualmente el estado "Entregado" desde `/studio/orders/[id]`
**Y** el `Order.status` pasa a `ENTREGADO`

**Dado** que el pedido se entrega en persona (recogida en taller o entrega directa de la artesana)
**Cuando** la artesana realiza la entrega en mano a la compradora
**Entonces** puede marcar manualmente el estado "Entregado" desde `/studio/orders/[id]`
**Y** el `Order.status` pasa a `ENTREGADO`

**Dado** que el `Order.status` pasa a `ENTREGADO` (por cualquiera de las tres vías anteriores)
**Cuando** se produce el cambio de estado
**Entonces** la compradora recibe inmediatamente un email: "Tu pedido ha llegado — tienes 48 horas para aceptarlo o abrir una incidencia"
**Y** en `/orders/[id]` aparece un CTA principal "Aceptar pedido" y un enlace secundario "Tengo un problema con este pedido"
**Y** se muestra un contador visual con el tiempo restante hasta la aceptación automática

**Dado** que soy compradora y pulso "Aceptar pedido"
**Cuando** confirmo la acción
**Entonces** el `Order.status` pasa a `ACEPTADO`
**Y** Stripe libera el pago retenido (transferencia a la cuenta Connect de la artesana)
**Y** el campo `paidOut` se marca como `true` en la base de datos
**Y** la opción de abrir una disputa desaparece permanentemente para este pedido
**Y** la compradora puede dejar una valoración (habilitado solo tras estado Aceptado)

**Dado** que el pedido lleva 48 horas en estado `ENTREGADO` sin acción de la compradora y sin disputa abierta
**Cuando** el Cron Job detecta el vencimiento
**Entonces** el `Order.status` pasa automáticamente a `ACEPTADO`
**Y** Stripe libera el pago retenido a la artesana
**Y** la compradora recibe email informando de la aceptación automática por vencimiento del plazo

---

## Épico 7: Confianza, Sellos y Disputas

Las artesanas pueden solicitar sellos verificados y los sellos automáticos se asignan al cumplir umbrales. Compradores y artesanas pueden abrir disputas formales con evidencias; la artesana decide si requiere devolución física en pedidos estándar y las disputas sin acuerdo escalan al admin.

### Historia 7.1: Sellos de producto — solicitud, aprobación y automáticos

Como artesana,
quiero solicitar sellos verificados para mis productos desde el formulario de publicación y que los sellos automáticos se asignen solos al cumplir umbrales,
para que cada producto comunique claramente sus atributos de calidad a la compradora.

**Glosario de sellos y badges — referencia compartida para tooltips, aria-labels y documentación de ayuda:**

| Sello / Badge | Tipo | Qué significa para la compradora | Qué transmite la artesana |
|---|---|---|---|
| Hecho a Mano | Producto · admin | Este producto ha sido elaborado manualmente por la artesana, sin producción industrial | Mi proceso es artesanal y puedo documentarlo |
| Ecológico | Producto · admin | Los materiales usados son naturales, sin componentes sintéticos ni químicos agresivos | Uso materias primas respetuosas con el entorno |
| Sostenible | Producto · admin | El proceso de elaboración tiene bajo impacto ambiental | Mi forma de producir cuida el planeta |
| Reciclado | Producto · admin | Este producto incorpora materiales reciclados o reutilizados en su elaboración | Doy segunda vida a materiales como parte de mi proceso creativo |
| Serie Limitada | Producto · admin | Este producto pertenece a una tirada limitada; una vez agotada, no se repetirá exactamente igual | Produzco en lotes pequeños y cada serie tiene su propia identidad |
| Superventas | Producto · auto | Más de 10 compradoras ya han elegido este producto | — |
| Muy Popular | Producto · auto | Más de 30 personas han guardado este producto como favorito | — |
| Recomendado | Producto · auto | Valorado con 4.5 o más por compradoras que lo han recibido | — |
| Artesana Verificada | Perfil · admin | La identidad y la actividad artesanal de esta persona han sido confirmadas por Artelier | Me he sometido al proceso de verificación de la plataforma |
| Taller Propio | Perfil · admin | Esta artesana trabaja en su propio espacio de producción | Tengo un taller propio documentado |
| Artesanía de Galicia | Perfil · admin | Certificado oficial de artesanía gallega expedido por la Xunta de Galicia o entidad equivalente | Cuento con reconocimiento institucional de mi oficio |
| Destacada | Perfil · auto | Más de 100 personas siguen a esta artesana | — |
| Activa | Perfil · auto | Esta artesana responde a los mensajes en menos de 4 horas de media | — |
| Envío Prioritario | Perfil · auto | Esta artesana confirma el envío de sus pedidos en menos de 48 horas de media | — |

**Acceptance Criteria:**

**Dado** que estoy en el formulario de publicar o editar un producto (`/studio/products/new` o `/studio/products/[id]/edit`)
**Cuando** llego al último paso del formulario
**Entonces** veo una sección opcional "Sellos para este producto" con los cinco sellos verificados disponibles: Hecho a Mano · Ecológico · Sostenible · Reciclado · Serie Limitada
**Y** cada sello muestra su descripción breve (extraída del glosario) para que la artesana sepa qué certifica
**Y** cada sello muestra su estado actual para ese producto: Sin solicitar / Pendiente / Aprobado / Rechazado
**Y** puedo pulsar "Solicitar" en cualquier sello que no tenga aún aprobado o pendiente

**Dado** que pulso "Solicitar" en un sello desde el formulario de producto
**Cuando** se abre el panel de solicitud
**Entonces** el producto ya está preseleccionado (no hay selector — el contexto es el producto actual)
**Y** puedo adjuntar justificación (máx. 500 caracteres) y hasta 3 imágenes de evidencia
**Y** se crea un `SealRequest` en estado `PENDING` vinculado al `productId` y a mi cuenta

**Dado** que el admin ha revisado mi solicitud de sello de producto (flujo admin en Historia 8.3)
**Cuando** el `SealRequest` cambia a `APPROVED` o `REJECTED`
**Entonces** si aprobado: el sello aparece inmediatamente en la `ProductCard` del producto correspondiente
**Y** recibo un email con el resultado y, si hay rechazo, el motivo proporcionado por el admin
**Y** puedo volver a solicitar un sello rechazado con nueva documentación

**Dado** que un producto existe en la base de datos
**Cuando** el sistema evalúa umbrales automáticos (job diario)
**Entonces** se asigna **Superventas** si el producto tiene ≥ 10 ventas completadas (solo productos no únicos)
**Y** se asigna **Muy Popular** si el producto tiene ≥ 30 guardados/favoritos
**Y** se asigna **Recomendado** si el producto tiene media ≥ 4.5 con ≥ 5 valoraciones

**Dado** que se muestran los sellos en `ProductCard`
**Cuando** un visitante ve el producto
**Entonces** los sellos de producto usan fondo sólido + borde crema + The Girl Next Door (posición esquina de la card)
**Y** cada sello tiene `aria-label` con la descripción completa del glosario ("Sello verificado: Hecho a Mano — elaborado manualmente por la artesana")

### Historia 7.2: Badges de perfil de artesana — solicitud, aprobación y automáticos

Como artesana,
quiero solicitar badges de perfil verificados por el admin desde el panel central de sellos y que los badges automáticos se asignen solos al cumplir umbrales,
para que mi perfil refleje mi trayectoria y compromisos de forma creíble para la compradora.

**Acceptance Criteria:**

**Dado** que soy artesana en `/studio/settings/seals`
**Cuando** accedo al panel de gestión
**Entonces** veo dos secciones diferenciadas: "Sellos de producto" (vista de estado de mis solicitudes por producto) y "Badges de perfil" (solicitud y estado de badges)
**Y** en "Sellos de producto" veo todas mis solicitudes agrupadas por producto con su estado: Pendiente / Aprobado / Rechazado, y un enlace a editar cada producto para solicitar nuevos sellos
**Y** en "Badges de perfil" veo los tres badges verificados (Artesana Verificada · Taller Propio · Artesanía de Galicia) con su estado y botón "Solicitar" si no están aprobados o pendientes
**Y** veo los tres badges automáticos (Destacada · Activa · Envío Prioritario) con su estado actual y el umbral necesario para obtenerlos

**Dado** que pulso "Solicitar" en un badge de perfil verificado
**Cuando** se abre el formulario de solicitud
**Entonces** no hay selector de producto — el badge se aplica al perfil completo
**Y** puedo adjuntar justificación (máx. 500 caracteres) y hasta 3 imágenes
**Y** para **Artesanía de Galicia** el formulario requiere adicionalmente un certificado oficial (PDF/imagen) expedido por la Xunta de Galicia o entidad equivalente
**Y** se crea un `SealRequest` en estado `PENDING` vinculado únicamente a mi cuenta

**Dado** que el admin ha revisado mi solicitud de badge de perfil (flujo admin en Historia 8.3)
**Cuando** el `SealRequest` cambia a `APPROVED` o `REJECTED`
**Entonces** si aprobado: el badge aparece inmediatamente en mi `ArtisanHeader`
**Y** recibo un email con el resultado y, si hay rechazo, el motivo proporcionado por el admin
**Y** puedo volver a solicitar un badge rechazado con nueva documentación

**Dado** que una artesana existe en la base de datos
**Cuando** el sistema evalúa umbrales automáticos (job diario)
**Entonces** se asigna **Destacada** si la artesana tiene ≥ 100 seguidores
**Y** se asigna **Activa** si su tiempo medio de respuesta a mensajes es < 4h en los últimos 30 días
**Y** se asigna **Envío Prioritario** si confirma el envío de los pedidos en < 48h de media en sus últimos 10 pedidos

**Dado** que se muestran los badges en `ArtisanHeader`
**Cuando** un visitante ve el perfil de la artesana
**Entonces** los badges de perfil usan estilo outlined + DM Sans (bajo el nombre de la artesana)
**Y** cada badge tiene `aria-label` con la descripción completa del glosario

### Historia 7.3: Apertura de disputas y política de devoluciones por tipo de producto


Como compradora o artesana,
quiero poder abrir una disputa formal con evidencias cuando hay un problema con un pedido,
para que el sistema aplique la política correcta según el tipo de producto.

**Acceptance Criteria:**

**Dado** que soy compradora y el pedido está en estado `ACEPTADO`
**Cuando** intento acceder a la opción de disputa
**Entonces** el botón "Tengo un problema" no aparece en la UI
**Y** si se llama directamente a `POST /api/disputes` con ese `orderId`, el endpoint devuelve `403` con mensaje: "No puedes abrir una disputa sobre un pedido ya aceptado"

**Dado** que soy compradora y el pedido está en estado `ENTREGADO` (dentro del plazo de 48h)
**Cuando** accedo a `/orders/[id]` y pulso "Tengo un problema con este pedido"
**Entonces** puedo seleccionar el motivo:
- **No he recibido mi pedido** — cubre tanto errores del sistema de mensajería interna de la plataforma (falso positivo del webhook del carrier) como marcados erróneos por parte de la artesana en entregas independientes o en persona
- **Producto dañado o no conforme**
- **No corresponde a la descripción**
- **Otro**
**Y** puedo adjuntar descripción (máx. 1000 caracteres) y hasta 5 imágenes
**Y** se crea un `Dispute` con estado `OPEN` vinculado al `orderId`
**Y** el estado del pedido pasa a `EN_DISPUTA`
**Y** el pago queda retenido (no transferido a la artesana si aún no lo estaba)

**Dado** que soy artesana y recibo una notificación de disputa
**Cuando** accedo al detalle en `/studio/orders/[id]`
**Entonces** puedo añadir mi versión y hasta 5 imágenes de evidencia
**Y** se registra mi respuesta en el `Dispute` con timestamp

**Dado** que se abre una disputa sobre un producto `PERISHABLE`
**Cuando** el sistema evalúa la política aplicable
**Entonces** se muestra la nota: "Los productos perecederos no admiten devolución física — el deterioro durante el transporte de vuelta hace imposible una inspección válida"
**Y** la resolución solo puede ser: reembolso directo o rechazo de la disputa

**Dado** que se abre una disputa sobre un producto `UNIQUE` (pedido personalizado)
**Cuando** el sistema evalúa la política aplicable
**Entonces** se muestra la nota: "Los pedidos personalizados están excluidos del derecho de desistimiento (Art. 103 LGDCU)"
**Y** la resolución solo puede ser: reembolso directo por defecto imputable a la artesana, o rechazo

**Dado** que se abre una disputa sobre un producto `STANDARD`
**Cuando** el sistema evalúa la política aplicable
**Entonces** aplica el derecho de desistimiento de 14 días hábiles desde la entrega
**Y** la artesana decide si requiere devolución física o acepta reembolso directo (ver Historia 7.3)

**Dado** que se envía `POST /api/disputes`
**Cuando** el endpoint recibe la petición
**Entonces** Upstash Redis aplica rate limiting: máx. 5 disputas por usuario por hora

### Historia 7.4: Resolución de disputas — decisión de la artesana, devolución física y escalado

Como artesana y compradora,
quiero que la artesana decida si requiere devolución física o acepta reembolso directo en pedidos estándar,
para que el proceso sea ágil y solo escale al admin cuando haya desacuerdo.

**Acceptance Criteria:**

**Dado** que soy artesana y hay una disputa abierta sobre un pedido estándar
**Cuando** accedo a `/studio/orders/[id]` con disputa activa
**Entonces** tengo dos opciones de resolución:
- **Aceptar reembolso directo** (sin necesidad de que la compradora devuelva el producto)
- **Requerir devolución física** antes de procesar el reembolso

**Dado** que la artesana selecciona "Aceptar reembolso directo"
**Cuando** confirma la acción
**Entonces** se ejecuta un Stripe Refund al método de pago original por el importe total del pedido
**Y** el estado del `Dispute` pasa a `RESOLVED` y el `Order` a `REEMBOLSADO`
**Y** ambas partes reciben email de notificación con el resultado

**Dado** que la artesana selecciona "Requerir devolución física"
**Cuando** confirma la acción
**Entonces** el estado del `Dispute` pasa a `RETURN_REQUESTED`
**Y** la compradora recibe notificación con instrucciones de envío de vuelta y un plazo de 7 días naturales para enviarlo
**Y** la compradora puede marcar "Solicitar que la artesana asuma el coste de envío de devolución"

**Dado** que la compradora solicita que la artesana asuma el coste de envío de devolución
**Cuando** la artesana recibe la solicitud
**Entonces** puede aceptar (el coste se descuenta de su pago Stripe) o rechazar (la compradora asume el coste)
**Y** independientemente de la decisión de coste, la compradora debe enviar el producto en el plazo indicado

**Dado** que la compradora envía el producto de vuelta
**Cuando** marca "Producto enviado" en `/orders/[id]` con número de seguimiento opcional
**Entonces** el estado del `Dispute` pasa a `RETURN_IN_TRANSIT`
**Y** la artesana recibe notificación para estar pendiente de la recepción

**Dado** que la artesana confirma haber recibido el producto
**Cuando** pulsa "Producto recibido y revisado" en `/studio/orders/[id]`
**Entonces** puede seleccionar: "Aceptar devolución — iniciar reembolso" o "Rechazar devolución — producto no corresponde"
**Y** si acepta: se ejecuta el Stripe Refund, `Order` pasa a `REEMBOLSADO`, ambas partes reciben email
**Y** si rechaza: `Dispute` pasa a `ESCALATED` y el admin recibe alerta en el panel

**Dado** que la artesana no responde a la disputa en 5 días hábiles
**Cuando** el Cron Job diario detecta el vencimiento
**Entonces** el `Dispute` se escala automáticamente a `ESCALATED` con alerta al admin

**Dado** que la compradora no está de acuerdo con la decisión de la artesana
**Cuando** pulsa "Escalar al administrador" en `/orders/[id]`
**Entonces** el `Dispute` pasa a `ESCALATED`
**Y** el admin puede revisar todas las evidencias de ambas partes y resolver con reembolso total, parcial o rechazo definitivo

**Dado** que el admin resuelve una disputa escalada
**Cuando** selecciona la resolución final en `/admin/disputes/[id]`
**Entonces** puede ejecutar reembolso total, reembolso parcial (importe personalizado) o rechazo definitivo
**Y** la decisión del admin es inapelable y genera email de notificación a ambas partes con el detalle de la resolución

---

## Épico 8: Panel de Administración y Cumplimiento Legal

El admin tiene un panel protegido con TOTP 2FA desde donde modera perfiles, gestiona sellos y ve métricas de plataforma. Las artesanas pueden ver sus estadísticas propias en el estudio. Las páginas legales obligatorias están publicadas y accesibles desde todas las páginas.

### Historia 8.1: Acceso al panel de administración con TOTP 2FA

Como administradora,
quiero acceder al panel de administración protegido con autenticación de doble factor TOTP,
para que ningún acceso no autorizado pueda moderar perfiles ni gestionar disputas aunque conozca la contraseña.

**Acceptance Criteria:**

**Dado** que es la primera vez que activo el 2FA en mi cuenta admin
**Cuando** accedo a `/admin/setup-2fa`
**Entonces** el sistema genera un secreto TOTP con `otplib` y muestra un código QR con `qrcode` para escanear con una app autenticadora (Google Authenticator, Authy)
**Y** debo introducir un código válido de 6 dígitos para confirmar que la configuración es correcta antes de activarla
**Y** se guardan 8 códigos de recuperación de un solo uso que puedo descargar en ese momento

**Dado** que el 2FA ya está configurado en mi cuenta admin e inicio sesión con email/contraseña
**Cuando** las credenciales son correctas
**Entonces** soy redirigida a `/admin/verify-2fa` en lugar de al panel directamente
**Y** debo introducir el código TOTP de 6 dígitos actual (ventana de 30s, tolerancia ±1 ventana)
**Y** si el código es correcto: el flag `twoFactorVerified: true` se establece en la sesión y soy redirigida a `/admin`
**Y** si el código es incorrecto 5 veces consecutivas: la sesión se bloquea y se envía email de alerta a la dirección admin

**Dado** que intento acceder a cualquier ruta `/admin/*` con sesión sin `twoFactorVerified`
**Cuando** el middleware de Next.js evalúa la sesión
**Entonces** soy redirigida a `/admin/verify-2fa` independientemente de si tengo sesión activa
**Y** el middleware corre en Edge Runtime usando `auth.config.ts` (sin importar Prisma)

**Dado** que uso un código de recuperación en lugar del TOTP
**Cuando** lo introduzco en `/admin/verify-2fa`
**Entonces** el código se invalida permanentemente (uso único)
**Y** si solo quedan 2 códigos de recuperación, se envía email de aviso para regenerarlos

### Historia 8.2: Estadísticas de artesana y métricas de plataforma

Como artesana y como administradora,
quiero poder ver estadísticas relevantes — la artesana las suyas propias, la admin las de toda la plataforma —
para tomar decisiones informadas sobre mis productos y el estado del marketplace.

**Acceptance Criteria:**

**Dado** que soy artesana en `/studio/stats`
**Cuando** accedo a mis estadísticas
**Entonces** veo las métricas básicas de mi perfil:
- Visitas al perfil (últimos 30 días)
- Número de seguidoras actuales
- Ventas completadas (total histórico y últimos 30 días)
- Ingresos netos del último mes (tras comisión de plataforma)
- Producto más visto y producto más vendido

**Y** los datos se actualizan una vez al día (no en tiempo real)
**Y** no hay métricas de comparación con otras artesanas ni rankings públicos (filosofía slow commerce)

**Dado** que soy admin en `/admin/metrics`
**Cuando** accedo al panel de métricas
**Entonces** veo las métricas de actividad de la plataforma:
- Usuarias registradas totales (artesanas / compradoras)
- Productos activos publicados
- Pedidos completados (últimos 30 / 90 días)
- Volumen total de ventas (últimos 30 / 90 días)
- Disputas abiertas y tiempo medio de resolución
- Solicitudes de sellos pendientes de revisión

**Y** puedo filtrar métricas por rango de fechas (últimos 7 / 30 / 90 días)
**Y** los datos se calculan con queries directas a Prisma, sin herramienta de analytics externa

### Historia 8.3: Moderación de perfiles y gestión de solicitudes de sellos

Como administradora,
quiero poder suspender o eliminar perfiles que incumplan las condiciones de uso y gestionar las solicitudes de sellos verificados,
para mantener la integridad del marketplace y la confianza de las usuarias.

**Acceptance Criteria:**

**Dado** que accedo a `/admin/users`
**Cuando** busco una usuaria por nombre, email o ID
**Entonces** veo su perfil con: fecha de registro, rol, estado de cuenta (activa / suspendida), número de productos y pedidos
**Y** puedo pulsar "Suspender cuenta" con campo de motivo obligatorio (visible solo para la admin, no para la usuaria)
**Y** puedo pulsar "Eliminar cuenta" con confirmación explícita (soft-delete: `deletedAt` en `User`)

**Dado** que suspendo una cuenta de artesana
**Cuando** la artesana intenta iniciar sesión
**Entonces** ve el mensaje "Tu cuenta está temporalmente suspendida. Contacta con soporte para más información"
**Y** sus productos dejan de aparecer en el catálogo público mientras dure la suspensión
**Y** los pedidos en curso no se cancelan automáticamente (la admin gestiona caso a caso)

**Dado** que accedo a `/admin/seals`
**Cuando** veo la lista de solicitudes pendientes
**Entonces** están ordenadas por fecha de solicitud (más antiguas primero)
**Y** cada solicitud muestra: tipo de sello, nombre de la artesana, nombre del producto (si aplica), justificación, imágenes adjuntas y, para Artesanía de Galicia, el certificado subido

**Dado** que reviso una solicitud de sello
**Cuando** selecciono "Aprobar" o "Rechazar"
**Entonces** si apruebo: el `SealRequest` pasa a `APPROVED`, se crea el registro `ProductSeal` o `ProfileBadge` y la artesana recibe email de confirmación
**Y** si rechazo: debo introducir un motivo (visible para la artesana), el `SealRequest` pasa a `REJECTED` y la artesana recibe email con el motivo
**Y** la artesana puede volver a solicitar ese sello con nueva documentación tras un rechazo

### Historia 8.4: Páginas legales LSSI y gestión de cookies

Como visitante o usuaria de Artelier,
quiero poder acceder en todo momento a las páginas legales obligatorias y gestionar mis preferencias de cookies,
para que la plataforma cumpla con la LSSI, el RGPD y la normativa de cookies.

**Acceptance Criteria:**

**Dado** que accedo a cualquier página de Artelier
**Cuando** inspecciono el footer
**Entonces** existen enlaces permanentes a: Aviso Legal · Política de Privacidad · Política de Cookies · Condiciones Generales de Uso y Venta
**Y** los enlaces llevan a páginas estáticas generadas con SSG en `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies`, `/legal/condiciones`

**Dado** que es mi primera visita a Artelier (sin cookies previas)
**Cuando** cargo cualquier página
**Entonces** aparece el banner de consentimiento de cookies con: botón "Aceptar todas", botón "Solo esenciales" y enlace "Gestionar preferencias"
**Y** hasta que no interactúo con el banner, solo se cargan cookies estrictamente necesarias

**Dado** que pulso "Gestionar preferencias" en el banner
**Cuando** se abre el panel de preferencias
**Entonces** puedo activar o desactivar por categoría: cookies esenciales (siempre activas) · cookies de analítica · cookies de preferencias
**Y** mi elección se guarda en `localStorage` y se respeta en todas las visitas posteriores

**Dado** que las páginas legales son renderizadas
**Cuando** se generan en build time
**Entonces** son páginas SSG sin JavaScript de cliente innecesario
**Y** incluyen fecha de última actualización visible en el documento
**Y** cumplen con los requisitos de información obligatoria de la LSSI: datos del titular, domicilio, NIF, email de contacto
