# Deferred Work

## Deferred from: code review of 0-1-inicializacion-del-proyecto-t3 (2026-05-19)

- `authorize()` retorna null — stub intencional para Historia 1.2; deferred a esa historia
- `layout.tsx` con metadata placeholder de T3 (`"Create T3 App"`, `lang="en"`) — diferido a Historia 0.2 (sistema de diseño)
- `src/middleware.ts` no existe — diferido a Historia 0.3 (middleware e i18n)
- Índices de BD ausentes en FKs frecuentes (Order.buyerId, Message.conversationId, etc.) — añadir en historias cuando las queries sean implementadas
- Secrets de producción opcionales (Stripe, Cloudinary, Resend, Upstash, Cron) — se harán requeridos en sus historias de integración respectivas (Épicos 5, 6)
