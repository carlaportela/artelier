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
