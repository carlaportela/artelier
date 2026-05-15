---
stepsCompleted: [1]
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
