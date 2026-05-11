---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Artelier - app para conectar artesanos y productores locales de Galicia con compradores'
session_goals: 'Clarificar visión del producto, modelo de negocio, sistema de pagos, flujos de pedidos y alcance del MVP'
selected_approach: 'progressive-flow'
techniques_used: ['What If Scenarios', 'Six Thinking Hats', 'SCAMPER Method', 'Decision Tree Mapping']
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitador:** Maldita
**Fecha:** 2026-05-11

## Session Overview

**Tema:** Artelier — plataforma para conectar artesanos y productores locales de Galicia con compradores

**Objetivos:**
- Clarificar la visión y propuesta de valor del producto
- Definir el modelo de negocio viable
- Decidir el enfoque de pagos y pedidos
- Acotar el alcance real del MVP

### Contexto de partida

- La app conecta artesanos/productores locales de Galicia con compradores interesados en productos artesanales
- Dos tipos de usuario: compradores y artesanos/productores
- MVP incluye perfiles de artesano + catálogo de productos con precio + sistema de compra y pago
- Plataforma web y móvil nativa (iOS/Android)
- Lanzamiento inicial en Galicia
- Dudas abiertas: modelo de negocio, pasarela de pago, flujo de pedidos

### Session Setup

_Sesión iniciada el 2026-05-11. Enfoque en clarificación de visión y decisiones clave antes de crear el PRD._

---

## Fase 4 — Planificación de Acción (Decision Tree Mapping)

### Árbol de decisiones del MVP

```
ARTELIER MVP
│
├── 1. PERFILES
│   ├── Artesano: tienda (catálogo + descripción breve) + pestaña de contenidos + configuración
│   └── Consumidor: home feed cronológico + descubrimiento + seguir artesanos + compra
│
├── 2. CATÁLOGO
│   ├── Producto único (1 unidad → compra agota stock automáticamente)
│   ├── Producto perecedero (fecha de caducidad → auto-retiro del catálogo)
│   └── Pedido personalizado (solicitud directa a artesano concreto)
│
├── 3. PAGOS (Stripe Connect)
│   ├── Comisión plataforma % → Artelier
│   ├── Comisión seguro % → fondo protección comprador
│   ├── Fee transacción → Stripe
│   ├── Primera venta sin comisión (incentivo onboarding artesano)
│   └── Sistema de disputas y devoluciones gestionado por admin
│
├── 4. MENSAJERÍA PRIVADA
│   └── Artesano ↔ Comprador (coordinación, encargos personalizados, disputas)
│
├── 5. SELLOS VERIFICADOS (admin otorga)
│   └── Km 0 · Hecho en Galicia · Ecológico · Reciclado · Artesanal certificado
│   └── Funcionan también como filtros de búsqueda
│
└── 6. NOTIFICACIONES
    └── Nueva venta · Mensaje recibido · Nuevo seguidor · Pre-reserva · Nuevo producto de artesano seguido
```

### Orden de construcción
Perfiles → Catálogo → Pagos → Mensajería → Sellos → Notificaciones

### Métricas de éxito del MVP — las 4 señales de vida
1. Existen perfiles de artesano y comprador activos
2. Se produce al menos una venta
3. Un comprador sigue a un artesano
4. Un comprador contacta con un artesano

---

## Resumen ejecutivo de decisiones

**Identidad del producto:**
Artelier es un mercado online de artesanía gallega, disponible 24/7 y sin coste para el artesano, que celebra el consumo lento, local y responsable. Conecta a compradores con los productores que hay detrás de lo que compran.

**Modelo de negocio:**
- Perfil del artesano: siempre gratuito
- Comisión por venta: % sobre total (pagado por el comprador)
- Comisión de seguro: % sobre total (pagado por el comprador)
- Fee Stripe: coste de transacción (pagado por el comprador)
- El artesano recibe el precio de venta limpio
- Primera venta sin comisión (onboarding)
- Penalización al artesano por incumplimiento: todas las comisiones

**MVP (V1):** Perfiles artesano/consumidor · Catálogo (stock único + perecederos) · Pagos Stripe · Mensajería privada · Sellos verificados · Notificaciones · Filtro manual de localidad · Feed cronológico

**V2:** Mapa interactivo · Mercados temáticos 48h · Pre-pedidos · Herramientas IA de contenido · Envío coordinado multi-artesano · Algoritmo de recomendación · Engagement social (likes, listas, comentarios)

**V3:** Live streaming en mercados · Cesta multi-artesano · Eventos promocionales de plataforma · Multiidioma gallego/castellano

---

## Fase 3 — Desarrollo de Ideas (SCAMPER)

**S — Stripe desde el principio**
Sin migraciones futuras. Transparencia y continuidad de comisiones para el usuario desde el día uno.

**C — Mensajería privada en MVP / Engagement social a V2**
La relación directa artesano-comprador es el núcleo. Likes, listas y comentarios públicos son amplificadores que pueden esperar.

**A — Perfil de artesano: dos pestañas**
- *Tienda (principal):* catálogo, disponibilidad, precios. Descripción breve del artesano siempre visible — como un puesto de mercado.
- *Contenidos:* actualizaciones de proceso, fotos, novedades. Experiencia tipo red social.
- *Home del comprador:* feed cronológico V1 de artesanos seguidos + recomendados. Algoritmo de personalización en V2.

**M — La lógica del puesto de mercado**
Entras a "la tienda de María": productos protagonistas + pincelada de María (foto, nombre, descripción breve configurable). El usuario profundiza si quiere, no es obligatorio.

**P — Mensajería y notificaciones como infraestructura transversal**
Un solo sistema sirve para: coordinación de compra/recogida, pedidos personalizados, disputas con admin, alertas de mercados y nuevos productos de artesanos seguidos.

**E — Simplificaciones del MVP**
- Geolocalización → filtro manual de localidad en V1
- Feed → cronológico de artesanos seguidos (sin algoritmo) en V1
- Sellos verificados se mantienen en MVP: actúan como filtros y hashtags (Km 0, Ecológico, Hecho en Galicia...)

**R — Pedidos personalizados directos, sin solicitudes abiertas**
El comprador hace un encargo a un artesano concreto que ya eligió. No hay convocatoria abierta al mejor postor. La personalización nace de una relación, no de una licitación. El artesano es protagonista, no recurso anónimo.

---

## Fase 2 — Reconocimiento de Patrones (Six Thinking Hats)

**🤍 Blanco — Datos reales del mercado**
- Artesanos grandes: web propia o DMs. Pequeños: Instagram, Wallapop, Vinted, Etsy.
- Dependencia de mercados físicos puntuales con coste real: inscripción + stand + transporte → ganancia mínima o negativa en un buen día (≈€100 ventas).
- Demanda en mercados físicos masiva: asistentes con propósito + casualidad + turistas locales y extranjeros.
- Pain del artesano: coste elevado, fragmentación digital, sin cobro con tarjeta.
- Pain del comprador: disponibilidad solo en mercados, contacto por DM, sin pago con tarjeta.

**❤️ Rojo — Emociones**
- Momento de máximo valor emocional del artesano: ser descubierto, no solo vender. → Las notificaciones son el motor de retención.
- Preocupación real: abuso de devoluciones (usar y devolver sin justificación). → Política anti-abuso obligatoria.

**💛 Amarillo — Beneficios**
- Artesano: escaparate 24/7 sin coste fijo. Venta posible siempre, sin esfuerzo físico ni económico.
- Comprador: plataforma unificada de descubrimiento, seguimiento y compra. Acceso a lo que nunca encontraría en un mercado físico.
- Sistémico: mejor aprovechamiento de recursos perecederos locales. Resuelve cadena de suministro hiperlocal.

**🖤 Negro — Riesgos y soluciones**
- Riesgo tracción → Primera venta sin comisión para el artesano.
- Riesgo stock desactualizado → Producto artesanal es único (1 unidad): la compra agota el stock automáticamente. Perecederos con fecha de caducidad auto-retiro.
- Riesgo competencia con mercados físicos → Artelier es complementario: un mercado más, gratis y desde casa, con herramientas que el físico no puede ofrecer (live, multimedia, sin stand).

**💚 Verde — Ideas creativas validadas**
- Mapa interactivo de Galicia con bocadillos de productos/artesanos + vista alternativa en lista.
- Sellos verificados: Hecho en Galicia, Km 0, Ecológico, Reciclado, Artesanal certificado.
- Compra multi-artesano con envío único coordinado (menor huella de carbono) o recogida en persona — pago siempre por plataforma como mecanismo de reserva.

**🔵 Azul — Síntesis validada**
MVP confirmado: dos perfiles (artesano/consumidor) + catálogo + mensajería privada y pública + pasarela de pagos + primera venta sin comisión + notificaciones.
V2: mapa · mercados · pre-pedidos · IA de contenido · sellos · envío coordinado.
V3: live streaming · cesta multi-artesano · eventos de plataforma · multiidioma.

**Estructura de costes al comprador (confirmada):**
- Comisión de plataforma (% sobre total)
- Comisión de seguro (% sobre total)
- Comisión de transacción Stripe
El artesano recibe el precio de venta limpio. Solo paga comisiones como penalización por incumplimiento.

---

## Fase 1 — Exploración Expansiva (What If Scenarios)

### Ideas y decisiones generadas

**[Negocio #1]: Comisión por venta universal**
_Concepto:_ Artelier cobra comisión sobre todas las ventas — catálogo permanente y mercados. El perfil es siempre gratuito. El artesano no paga por existir, solo cuando vende.
_Novedad:_ Alineación total de incentivos. Artelier crece cuando los artesanos crecen.

**[Producto #2]: Herramientas de contenido asistido por IA**
_Concepto:_ El artesano introduce palabras clave y fotos → la plataforma genera descripción del producto, historia del perfil, post de novedad. Él revisa y publica.
_Novedad:_ Elimina la barrera digital más grande para artesanos rurales de Galicia. No necesitan saber escribir para internet.

**[Modelo #3]: Mercados temáticos de plataforma + catálogo permanente**
_Concepto:_ Artelier organiza eventos periódicos (Mercado de Primavera, Navidad...), los artesanos se apuntan con productos exclusivos de 48h. Fuera de mercados, su catálogo normal sigue activo y vendiendo.
_Novedad:_ Dos velocidades de compra: urgencia (mercados) + descubrimiento tranquilo (catálogo).

**[Producto #4]: Stock manual + pre-pedidos como palanca de comunidad**
_Concepto:_ Catálogo solo muestra lo disponible. Stock manual. Los pre-pedidos generan anticipación: "Mis tarros de mermelada de castañas estarán listos en noviembre. Resérvate uno ahora."
_Novedad:_ Transforma la escasez del artesano en exclusividad percibida. La espera es parte del valor artesanal.

**[Producto #5]: Logística híbrida con geolocalización como brújula**
_Concepto:_ El artesano gestiona su propio envío o usa la tarifa negociada de la plataforma. El algoritmo de descubrimiento prioriza siempre lo local.
_Novedad:_ La tecnología refuerza el valor cultural. No es solo conveniencia, es coherencia con la filosofía de km 0.

**[Tracción #6]: Comunidad fundadora de artesanas**
_Concepto:_ La creadora del producto es artesana con red propia — primera usuaria y puerta de entrada a los primeros productores. El MVP no necesita resolver adquisición de cero.
_Novedad:_ Credibilidad interna que ningún equipo externo puede comprar.

**[Identidad #7]: Filosofía de producto — Slow Commerce con raíces**
_Concepto:_ Artelier es un mercado que celebra la idiosincrasia local gallega, promueve el consumo lento, responsable y de km 0. El tiempo de espera es parte del ritual de compra.
_Novedad:_ Posicionamiento radicalmente opuesto al e-commerce convencional. No compite con Amazon.

**[UX #8]: Presencia 24/7 + transparencia de proceso**
_Concepto:_ Una ventana siempre abierta al mundo del artesano — no solo el producto final, sino el proceso en tiempo real. El comprador puede ver que la pieza que quiere se está fabricando ahora.
_Novedad:_ Transforma el tiempo de espera en experiencia. La transparencia del proceso es el contenido.

**[UX #9]: El primer pulso de vida — la interacción**
_Concepto:_ El momento de valor para el artesano no es la venta, es la primera señal de que alguien le ve: un mensaje, un me gusta, una pre-reserva.
_Novedad:_ Implica que el MVP necesita notificaciones y mensajería básica desde el día uno — es el núcleo, no una feature secundaria.

**[Producto #10]: Multilingüe con identidad gallega preservada**
_Concepto:_ Interfaz en gallego o castellano según preferencia del usuario. Los artesanos escriben en el idioma que quieran; la plataforma ofrece siempre alternativa en castellano.
_Novedad:_ Resuelve la tensión entre identidad local y escalabilidad futura con elegancia.

**[Producto #11]: Proceso como contenido — doble capa**
_Concepto:_ Actualizaciones libres (foto + texto) + estados estructurados de fabricación (En proceso → Listo → Enviado). El comprador sigue el viaje de su pedido como un documental corto.
_Novedad:_ El proceso artesanal es el contenido diferencial. Nadie más enseña cómo se hace lo que compraste.

**[UX #12]: Mensajería doble — privada + pública**
_Concepto:_ Mensajes privados entre comprador y artesano. Comentarios públicos en productos y perfiles donde la comunidad participa y construye prueba social.
_Novedad:_ La conversación pública convierte las preguntas frecuentes en contenido que vende.

**[Negocio #13]: Modelo financiero claro**
_Concepto:_ Comisión proporcional al precio de venta (% sobre total). Gastos de pasarela (Stripe) repercutidos al comprador. Sin planes de descuento por fidelidad — la fidelidad viene de la vitrina gratuita y permanente. Eventos promocionales de plataforma (ej. 24h envío gratis) gestionados por el administrador.
_Novedad:_ Modelo limpio y sin fricción para el artesano.

**[Negocio #14]: Sistema de protección y disputas**
_Concepto:_ Envío por plataforma = comisión adicional como seguro. Incumplimiento del artesano = cancelación + devolución íntegra al comprador + penalización de todas las comisiones al artesano. Ventana de 24h para cancelar sin penalización económica (solo Stripe). Disputas gestionadas por admin con solicitud formal + pruebas. Envío externo = la plataforma media sin responsabilidad económica.
_Novedad:_ Sistema de confianza asimétrico pero justo. El admin tiene herramientas reales para arbitrar.

**[MVP #15]: El núcleo mínimo viable**
_Concepto:_ Perfil de artesano + catálogo de productos + mensajería + pasarela de pagos. Todo lo demás es v2 o v3.
_Novedad:_ Lanzamiento enfocado que valida la hipótesis central: ¿compra alguien productos artesanales a través de una plataforma digital en Galicia?

**[Producto #16]: Dos perfiles diferenciados**
_Concepto:_ Perfil artesano (vitrina, catálogo, pedidos, contenido de proceso, mercados) vs. perfil consumidor (descubrimiento, seguimiento, compra, pre-pedidos, comentarios). Dos experiencias de producto distintas en la misma plataforma.
_Novedad:_ El artesano es creador; el consumidor es audiencia y comprador.

---
