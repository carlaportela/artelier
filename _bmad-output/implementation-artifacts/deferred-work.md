# Deferred Work

## Deferred from: code review of 0-1-inicializacion-del-proyecto-t3 (2026-05-19)

- `authorize()` retorna null — stub intencional para Historia 1.2; deferred a esa historia
- `layout.tsx` con metadata placeholder de T3 (`"Create T3 App"`, `lang="en"`) — diferido a Historia 0.2 (sistema de diseño)
- `src/middleware.ts` no existe — diferido a Historia 0.3 (middleware e i18n)
- Índices de BD ausentes en FKs frecuentes (Order.buyerId, Message.conversationId, etc.) — añadir en historias cuando las queries sean implementadas
- Secrets de producción opcionales (Stripe, Cloudinary, Resend, Upstash, Cron) — se harán requeridos en sus historias de integración respectivas (Épicos 5, 6)

## Deferred from: code review of 0-2-sistema-de-diseno-tinta-y-lino (2026-05-19)

- `@font-face` manual en globals.css es inerte en runtime (next/font/local lo sobreescribe y usa nombres de familia hasheados) pero AC2 lo exige explícitamente — revisar si el AC debe actualizarse en futuras iteraciones
- The Girl Next Door sin estilo italic registrado — el navegador sintetiza italics artificialmente; si en futuras historias se usa esta fuente en cursiva, añadir un archivo italic y declarar el @font-face correspondiente
- Tokens Artelier (`--bg`, `--surface`, etc.) sin contrapartes en `.dark` — cuando se implemente el selector de tema (Historia 1.2 o posterior), añadir paleta dark para estos tokens
- Cadena de fallback de `--font-sans` se pierde cuando next/font/local sobreescribe la variable — si se migra a un CDN o se detectan problemas, considerar añadir la cadena completa en la configuración del localFont
- `--text-light` (#8a8478 sobre #f4f0e8) tiene ratio de contraste ~2.8:1 que falla WCAG AA — comunicar al equipo de diseño para revisión; no usar para texto de contenido, solo para elementos decorativos

## Deferred from: code review of 0-3-ci-cd-middleware-e-i18n-base (2026-05-20)

- **AC4 role check ausente en middleware** — el middleware solo bloquea usuarios no autenticados en `/admin/*`, no verifica el rol ADMIN. Edge Runtime no puede consultar la BD. Solución planificada: Historia 1.2 implementará caché de roles en Upstash Redis (`sessionId → role`) con TTL ~15 min; el middleware leerá el rol desde Upstash en lugar de Prisma.
- **Redirect targets `/login` y `/feed` no existen todavía** — el middleware redirige correctamente pero las páginas de destino serán implementadas en Historias 1.1 y 1.2.
- **`getMessages()` en layout.tsx usa locale hardcodeado** — funciona para V1 (solo castellano), pero cuando se implemente routing por locale en V3 (gallego), habrá que migrar a `app/[locale]/layout.tsx` y detección de locale desde URL/cookie.
- **Middleware matcher no excluye explícitamente archivos de `public/`** — sin impacto actual (solo hay fuentes y favicon ya excluidos), revisar cuando se añadan más assets públicos.

## Deferred from: code review of 1-1-registro-con-eleccion-de-rol (2026-05-20)

## Deferred from: code review of 1-2-login-logout-y-recuperacion-de-contrasena (2026-05-21)

- **Token UUID de reset almacenado en texto plano en BD** — security hardening (hashear el token antes de guardar, comparar hash en lookup); no es bug, práctica estándar para este nivel; revisar antes de producción pública
- **Sesiones expiradas no se purgan automáticamente** — el middleware solo verifica presencia de cookie (TTL de cookie coincide con BD); añadir job de limpieza periódica (Upstash/cron) cuando se implemente infraestructura de tareas en background
- **Usuarios suspendidos/soft-deleted permanecen autenticados hasta que expira la cookie (30 días)** — requiere feature de admin (fuera de scope H1.2); cuando se implemente suspensión, añadir check en middleware o usar caché de estado en Upstash
- **Entrypoint dual: Auth.js Credentials + login manual** — workaround necesario para incompatibilidad Auth.js v5 + database sessions + Credentials; revisar cuando Auth.js publique fix oficial
- **Error de envío de email silencioso** — si Resend falla, el token queda en BD válido 1h pero el usuario no recibe email; añadir monitoreo/alerting sobre el `console.error` antes de producción

- **Sin rate limiting en la Server Action de registro** — necesita infraestructura (ej. Upstash/Redis), fuera de scope de H1.1; planificar antes de producción
- **Sesión manual bypassa ciclo de vida de Auth.js** — workaround inevitable por incompatibilidad de Auth.js v5 + Credentials + database sessions; documentado en Completion Notes; revisar si Auth.js añade soporte en futuras versiones
- **Cast unsafe de `user.role` en session callback** — pre-existing de H0.3, no introducido en H1.1; revisar en iteración de hardening de auth
- **Nombre de cookie hardcodeado** — `authjs.session-token` / `__Secure-authjs.session-token` frágil si Auth.js cambia; extraer a constante compartida en futuro refactor de auth
- **Email enumeration por timing** — diferencia de tiempo entre `EMAIL_EXISTS` y hash bcrypt revela emails registrados; hardening de seguridad para antes de producción pública
- **Sin longitud máxima en campos del formulario** — `email`, `password`, `locality` sin `.max()`; añadir en próxima iteración de validaciones
- **Estado del formulario persiste al volver al selector de rol** — errores stale visibles si el usuario va atrás y vuelve; UX polish para iteraciones posteriores
- **`isPending` no desactiva el botón de volver** — back button activo durante envío puede causar comportamiento confuso si el SA resuelve tras navegar; UX polish futuro
- **Mensajes de error de Zod hardcodeados** — `passwordMin` y `localityRequired` en Zod schema no usan i18n; requiere patrón de mensajes dinámicos o schema factory; diferir a refactor de i18n completo
- **`emailExists` hardcodeado en server action** — i18n en server actions requiere patrón diferente (no hooks); diferir a refactor de i18n server-side
