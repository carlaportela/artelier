---
stepsCompleted: [1, 2, 3]
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
FR50: Un artesano puede actualizar el estado de fabricación de un pedido activo (En fabricación → Listo → Enviado / Listo para recogida), visible para el comprador

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
UX-DR7: Componente `OrderStatusTimeline` — 5 pasos: Confirmado → En fabricación → Listo → Enviado → Entregado. Estados: done (✓ verde), active (✦ ámbar con halo), pending (○ gris). Lista `<ol>` con ARIA.
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
FR10: Épico 1 + Épico 7 — Solicitud de sellos (artesana) / Aprobación (admin)
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
FR43: Épico 7 — Admin revisa, aprueba o rechaza disputas
FR44: Épico 7 — Sistema aplica política de devoluciones según tipo de producto
FR45: Épico 7 — Admin aprueba o rechaza solicitudes de sellos
FR46: Épico 8 — Admin suspende o elimina perfiles por incumplimiento
FR47: Épico 8 — Panel de métricas básicas de actividad
FR48: Épico 8 — Páginas legales accesibles desde todas las páginas (LSSI)
FR49: Épico 5 — Primera venta sin comisión para la artesana
FR50: Épico 6 — Artesana actualiza estado de fabricación visible para el comprador

## Epic List

### Épico 0: Fundación y Sistema de Diseño
El proyecto queda inicializado con el stack completo, schema de base de datos, sistema de diseño Tinta y Lino, CI/CD y estructura de directorios lista para construir las funcionalidades de usuario.
**ARs cubiertos:** AR1 · AR2 · AR3 · AR12 · AR13
**UX-DRs cubiertos:** UX-DR1 · UX-DR2 · UX-DR17

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

### Épico 6: Pedidos, Notificaciones y Proceso de Fabricación
El comprador recibe su confirmación de pedido por email y puede seguir el estado de fabricación en tiempo real con actualizaciones personales de la artesana. Todos los eventos importantes generan notificaciones por email.
**FRs cubiertos:** FR38 · FR39 · FR40 · FR50
**ARs cubiertos:** AR8
**UX-DRs cubiertos:** UX-DR7 · UX-DR8

### Épico 7: Confianza, Sellos y Disputas
Las artesanas pueden solicitar sellos verificados y el admin los aprueba o rechaza. Compradores y artesanas pueden abrir disputas formales con evidencias, y el admin las resuelve aplicando la política de devoluciones según el tipo de producto.
**FRs cubiertos:** FR10 (aprobación admin) · FR41 · FR42 · FR43 · FR44 · FR45
**UX-DRs cubiertos:** UX-DR5 (sistema de sellos completo)

### Épico 8: Panel de Administración y Cumplimiento Legal
El admin tiene un panel protegido con TOTP 2FA donde puede ver métricas de actividad, moderar perfiles, y ver las estadísticas de artesanas. Las páginas legales obligatorias (LSSI) están publicadas y accesibles.
**FRs cubiertos:** FR11 · FR46 · FR47 · FR48
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
