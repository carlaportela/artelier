# Sprint Change Proposal — 2026-07-15

## 1. Resumen del problema

Durante el code review de la Historia 6.1 (2026-07-08) se detectó que **no existe ninguna vía para que la artesana acepte o rechace un pedido tras la venta**. El pedido nace en estado `CONFIRMED` (pago procesado) y lo único que la artesana puede hacer es confirmar el envío o marcarlo listo para recogida — no tiene forma de cancelarlo si no puede realizarlo (sin stock, no lo vio a tiempo, etc.). El endpoint de cancelación existente (`cancel/route.ts`) está restringido a rol `BUYER`.

El copy ya escrito en `NewSaleEmail.tsx`/`FirstSaleEmail.tsx` prometía "24 horas para aceptar o cancelar" — una funcionalidad que nunca se planificó ni implementó. Se corrigió ese texto durante el review de H6.1 para no prometer una acción inexistente, y se dejó anotado como propuesta para una historia futura.

Categoría del cambio: hueco en los requisitos originales (PRD/épicos nunca contemplaron este gate), confirmado como nuevo requisito de producto por Maldita (PO).

## 2. Análisis de impacto

**Épicos:** Épico 6 (Pedidos, Notificaciones y Proceso) es el único afectado. Sigue siendo viable, pero necesita una historia nueva insertada antes del timeline de estados, con la consiguiente renumeración de las dos historias siguientes. Épicos 7 y 8 no se ven afectados.

**Historias:**
- Nueva Historia 6.2: Aceptación o rechazo de pedido por la artesana
- Historia 6.2 (Timeline) → renumerada a 6.3, con ajuste de punto de partida ("pedido ya aceptado") y referencias internas actualizadas
- Historia 6.3 (Confirmación de entrega) → renumerada a 6.4, sin cambios de contenido

**PRD:** Nuevo `FR51` añadido tras `FR50` (último FR del documento, sin necesidad de renumerar el resto). Tabla de mapeo FR→épico actualizada.

**Arquitectura:** Requiere nueva ruta de API (cancelación/rechazo por la artesana, con su propio check de rol `ARTISAN`), nueva ventana de tiempo (24h) y lógica de cron para el auto-cancelado. Se detectó un impacto técnico relacionado: el cron `cancel-overdue-orders` actual solo vigila pedidos en estado `CONFIRMED` — cuando H6.3 introduzca los estados intermedios (`IN_PREPARATION`, `READY`), un pedido parado ahí quedaría sin vigilancia. Se deja como nota para el diseño técnico de H6.3, no bloquea H6.2.

**UX:** El componente `OrderStatusTimeline` no contempla ningún paso de rechazo. Se necesita una pantalla/tarjeta nueva en `/studio/orders/[id]` con las opciones "Aceptar pedido" / "No puedo con este pedido", visible solo mientras el pedido está en `CONFIRMED` y no ha sido aceptado.

**Otros artefactos:** `sprint-status.yaml` actualizado con la nueva historia y la renumeración. Memoria de proyecto actualizada (la idea deja de estar "diferida sin historia" y pasa a referenciar H6.2 directamente).

## 3. Enfoque recomendado

**Opción elegida: Ajuste directo (Direct Adjustment)** — insertar una historia nueva dentro del Épico 6 existente, sin tocar el resto del roadmap.

Se descartaron las otras dos opciones del checklist:
- **Rollback:** no aplica — H6.1 ya está mergeada y no entra en conflicto, el cambio es puramente aditivo.
- **Revisión de MVP:** no aplica — el MVP no se ve amenazado, es un refinamiento natural dentro de un épico ya planificado, no un pivote estratégico.

Esfuerzo: medio (nueva ruta de API, nueva ventana de tiempo/cron, nueva UI). Riesgo: bajo (no rompe nada ya construido, es aditivo).

## 4. Decisiones de producto tomadas durante el análisis

- Plazo de 24 horas desde la confirmación del pago para que la artesana acepte o rechace el pedido
- Rechazo voluntario (con motivo, mínimo 10 caracteres) → cancelación **sin** penalización económica
- Falta de respuesta dentro del plazo → cancelación automática por el sistema **con** la penalización económica ya existente (`PENALTY_AMOUNT_CENTS`)
- La compradora recibe email de notificación tanto si la artesana acepta como si rechaza el pedido (dos emails nuevos, además del ya existente de cancelación por el sistema)

## 5. Cambios aplicados

Todos los cambios de este documento ya se aplicaron directamente (modo incremental, con aprobación de Maldita en cada paso):

| Artefacto | Cambio |
|---|---|
| `_bmad-output/planning-artifacts/prd.md` | Nuevo `FR51` |
| `_bmad-output/planning-artifacts/epics.md` | Tabla de mapeo FR→épico actualizada; resumen del Épico 6 reescrito; nueva Historia 6.2 completa con AC; Historia 6.2→6.3 (Timeline) con ajustes; Historia 6.3→6.4 (Entrega) renumerada |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Nueva entrada `6-2-aceptacion-o-rechazo-de-pedido-por-la-artesana: ready-for-dev`; renumeración de las dos historias siguientes |
| Memoria de proyecto (`project_state.md`) | Idea actualizada de "diferida sin historia" a "resuelta, ahora es H6.2" |

## 6. Alcance del cambio y siguiente paso

**Clasificación: Menor/Moderado** — no requiere replanificación estratégica (PM/Arquitecto), pero sí reorganización de backlog ya completada en este documento. No queda ningún artefacto de planificación por tocar.

**Siguiente paso:** generar el story file completo de la Historia 6.2 con `bmad-create-story` (detalle técnico: schema, endpoints, cron, componentes UI) antes de implementar. Responsable: Developer agent, con Maldita revisando cada decisión técnica igual que en H6.1.
