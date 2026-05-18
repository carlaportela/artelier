---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
releaseMode: 'phased'
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-05-11-0000.md']
workflowType: 'prd'
briefCount: 0
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
classification:
  projectType: 'web_app (MVP) + mobile_app_flutter (V2)'
  domain: 'e-commerce/marketplace'
  complexity: 'medium'
  projectContext: 'greenfield'
---

# Product Requirements Document - Artelier

**Autor:** Maldita
**Fecha:** 2026-05-11

## Clasificación del Proyecto

| Campo | Valor |
|-------|-------|
| **Tipo de proyecto** | Web App SSR/SSG (MVP) · Mobile App Flutter iOS/Android (V2) — marketplace fullstack |
| **Dominio** | E-commerce / Marketplace de artesanía local |
| **Complejidad** | Media — marketplace de dos lados, Stripe Connect, dos tipos de perfil diferenciados |
| **Contexto** | Greenfield — producto nuevo desde cero |
| **Modelo de desarrollo** | MVP web-only (validación) → V2 mobile + crecimiento → V3 visión completa |

---

## Resumen Ejecutivo

Artelier es un marketplace online de artesanía y producción local, disponible 24/7, que conecta artesanos y pequeños productores de Galicia con compradores interesados en consumo lento, responsable y de proximidad. La plataforma opera bajo una filosofía de *slow commerce*: el tiempo de espera no es un defecto sino parte del valor artesanal, y el proceso de creación es contenido diferencial en sí mismo.

**Problema que resuelve:** Los artesanos locales dependen de mercados físicos puntuales con coste elevado (inscripción, stand, transporte) que generan ganancia mínima o negativa incluso en días de alta venta (≈€100). Su presencia digital está fragmentada entre Instagram, Wallapop, Vinted y Etsy, sin plataforma unificada, sin cobro con tarjeta y sin disponibilidad permanente. Los compradores interesados en artesanía local no tienen un canal centralizado de descubrimiento, seguimiento y compra.

**Usuarios objetivo:**
- **Artesanos y productores locales** — crean perfil público gratuito, gestionan catálogo, reciben pedidos y pagos, publican contenido de proceso. El perfil es su escaparate permanente sin coste fijo.
- **Compradores** — descubren artesanos por localidad o categoría, siguen productores, compran desde el catálogo o realizan encargos personalizados directos.

**Mercado inicial:** Galicia. La plataforma está diseñada para escalar a nivel nacional e internacional sin cambios estructurales.

### Qué hace especial a Artelier

**1. El artesano como protagonista, no como vendedor anónimo**
El comprador no compra cerámica; compra la cerámica de Pedro de Pontevedra, que lleva 15 años en el oficio y publica el proceso de cada pieza. Cada perfil es una historia, no una tienda. La plataforma facilita **contacto directo entre artesano y comprador** — mediante mensajería privada para coordinar pedidos personalizados y comentarios públicos en productos y perfiles donde la comunidad participa. Este vínculo directo genera exclusividad real: el comprador puede encargar una pieza única adaptada a sus necesidades, algo imposible en cualquier marketplace genérico.

**2. Slow commerce como ventaja competitiva**
Artelier no compite con Amazon en velocidad — compite en autenticidad. Los pre-pedidos, la transparencia del proceso de fabricación y la escasez natural del producto artesanal (stock único por pieza) se convierten en mecánicas de exclusividad y anticipación.

**3. Complementario al ecosistema artesanal físico**
Artelier no sustituye los mercados físicos — los extiende digitalmente. Los artesanos añaden un canal permanente y gratuito a su mix actual. Los mercados temáticos de la plataforma (eventos de 48h con productos exclusivos) son un formato nuevo que el mercado físico no puede ofrecer: sin desplazamiento, sin stand, con contenido multimedia desde el taller.

**4. Modelo alineado con los incentivos del artesano**
Perfil siempre gratuito. Comisión solo cuando hay venta. Primera venta sin comisión. El artesano no asume riesgo económico hasta que Artelier le genera valor real.

**Insight central:** La demanda de artesanía local está probada — los mercados físicos tienen asistencia masiva. La barrera no es la demanda; es la fricción: disponibilidad limitada, fragmentación digital y coste de acceso. Artelier elimina esas fricciones sin cambiar la esencia de lo que hace especial a la artesanía.

---

## Criterios de Éxito

### Éxito del Usuario

- El artesano recibe su primera interacción (mensaje, seguidor, me gusta o pre-reserva) durante las primeras 72h tras publicar su perfil.
- El comprador encuentra y contacta con un artesano relevante en su primera sesión en la plataforma.
- El artesano completa su primera venta a través de la plataforma sin fricción técnica ni asistencia del equipo.
- Un comprador realiza una segunda compra al mismo artesano dentro del primer año — indicador de vínculo establecido, no compra puntual.
- El artesano percibe Artelier como complemento rentable a su actividad, no como carga adicional de gestión.

### Éxito de Negocio

**A 3 meses del lanzamiento:**
- ≥100 artesanos o productores con perfil activo (al menos un producto publicado)
- ≥100 compradores registrados con al menos una interacción
- ≥1 transacción de venta completada en la plataforma

**Al primer año:**
- ≥1 transacción por semana de forma sostenida
- Al menos 1 comprador repite compra con el mismo artesano
- Se celebra al menos 1 evento o mercado en la plataforma con asistencia del ≥10% de la comunidad activa
- Comunidad identificable: artesanos con seguidores activos, comentarios en productos, interacciones recurrentes

### Éxito Técnico

- **Pagos:** 0% de fallos en transacciones completadas. Ninguna pérdida de datos de pago. Stripe Connect configurado correctamente con distribución de comisiones automática.
- **Disponibilidad:** El sistema soporta carga de pagos simultáneos durante eventos de mercado de 48h sin degradación de servicio ni fallos de transacción.
- **Rendimiento:** Carga aceptable en redes móviles con cobertura limitada (zonas rurales de Galicia) — especialmente en listado de catálogo e inicio del flujo de pago.

### Resultados Medibles

| Métrica | Objetivo 3 meses | Objetivo 12 meses |
|---------|-----------------|-------------------|
| Artesanos activos | ≥100 | Crecimiento sostenido |
| Compradores registrados | ≥100 | Crecimiento sostenido |
| Transacciones completadas | ≥1 | ≥1/semana |
| Tasa de repetición de compra | — | ≥1 comprador recurrente |
| Asistencia a evento | — | ≥10% comunidad activa |
| Fallos de pago | 0% | 0% |

---

## Alcance del Producto

### MVP — Producto Mínimo Viable

Funcionalidades esenciales para validar la hipótesis central: *¿compran usuarios productos artesanales a través de una plataforma digital en Galicia?*

- **Perfiles diferenciados:** Perfil artesano (tienda + pestaña de contenidos + configuración) y perfil consumidor (home feed cronológico + descubrimiento + seguir artesanos)
- **Catálogo de productos:** Producto único (1 unidad — compra agota stock automáticamente), producto perecedero (fecha de caducidad con auto-retiro), pedido personalizado directo al artesano
- **Pasarela de pagos:** Stripe Connect con comisión de plataforma (% comprador) + comisión de seguro (% comprador) + fee Stripe (comprador). Primera venta sin comisión para el artesano
- **Mensajería privada:** Canal directo artesano ↔ comprador para coordinación, encargos personalizados y gestión de disputas
- **Sellos verificados de producto (admin):** Hecho a Mano · Ecológico · Sostenible · Reciclado · Serie Limitada. **Automáticos de producto:** Superventas · Muy Popular · Recomendado. **Badges de perfil (admin):** Artesana Verificada · Taller Propio · Artesanía de Galicia (requiere certificado oficial). **Automáticos de perfil:** Destacada · Activa · Envío Prioritario. Actúan también como filtros de búsqueda
- **Notificaciones:** Nueva venta · Mensaje recibido · Nuevo seguidor · Nuevo producto de artesano seguido
- **Descubrimiento:** Filtro manual de localidad · Búsqueda por categoría · Feed cronológico de artesanos seguidos
- **Sistema de disputas y devoluciones:** Ventana de cancelación de 24h · Solicitud formal con evidencia · Revisión por admin · Política anti-abuso para productos artesanales

### Funcionalidades de Crecimiento (V2 — Post-MVP)

- App móvil Flutter para iOS y Android con paridad de funcionalidades respecto a web
- Mapa interactivo de Galicia con marcadores de artesanos activos y bocadillos de producto
- Mercados temáticos de plataforma: eventos de 48h con productos exclusivos organizados por Artelier
- Pre-pedidos y pre-ventas de productos en fabricación
- Herramientas de contenido asistido por IA (descripción de producto y perfil desde palabras clave y fotos)
- Envío coordinado multi-artesano con tarifa única (menor huella de carbono)
- Algoritmo de recomendación personalizado (gustos, compras, geolocalización)
- Engagement social: me gusta, listas de favoritos, comentarios públicos en productos y perfiles

### Visión (V3 — Futuro)

- Live streaming desde el taller durante mercados de plataforma
- Cesta multi-artesano con un solo pago y envío coordinado
- Eventos promocionales de plataforma gestionados por admin (ej. 24h envío gratis)
- Interfaz multiidioma: gallego y castellano según preferencia del usuario

---

## Journeys de Usuario

### Journey 1 — María, la ceramista que da el salto digital

**Situación:** María tiene 42 años, lleva 12 haciendo cerámica en su taller de Lugo. Vende en dos ferias al año y a través de Instagram por DMs. En su mejor feria ganó €150, pero después de gasolina, stand e inscripción se quedó en €40. Tiene seguidores en Instagram pero coordinar ventas por mensaje le agota.

**Descubrimiento:** Una amiga artesana le habla de Artelier. Entra desde el móvil, ve que el perfil es gratuito y que solo paga cuando vende. En 20 minutos tiene su perfil publicado: foto, descripción, localidad Lugo, sello "Hecho a Mano" solicitado al admin desde el formulario del producto.

**Primera interacción:** Tres días después recibe una notificación — alguien de Santiago la ha seguido. Una semana después, otro usuario le escribe por mensajería privada preguntando si hace tazas personalizadas con nombres. María responde, acuerdan el encargo, el comprador paga a través de la plataforma. El producto queda reservado.

**Momento de valor:** María ve el dinero en su cuenta de Stripe dos días después del envío. Sin ferias, sin stand, sin salir del taller. Piensa: *"esto funciona mientras yo trabajo"*.

**Nueva realidad:** María publica actualizaciones de su proceso en la pestaña de contenidos. Tiene 23 seguidores que esperan ver qué crea. Sus ventas online ya superan lo que ingresa en ferias, sin los costes asociados.

*Capacidades reveladas: registro artesano, configuración de perfil, solicitud de sellos, mensajería privada, pedido personalizado, notificaciones, pasarela de pago, pestaña de contenidos.*

---

### Journey 2 — Carlos, el comprador que quiere saber de dónde viene lo que come

**Situación:** Carlos tiene 35 años, vive en A Coruña y lleva tiempo queriendo comprar directamente a productores locales. Va al mercado de los domingos cuando puede, pero muchas veces llega tarde y ya no queda nada. Compra en Mercadona porque es lo que hay, aunque preferiría no hacerlo.

**Descubrimiento:** Ve Artelier mencionado en un grupo de Telegram de consumo responsable en Galicia. Se registra como comprador en cinco minutos.

**Exploración:** Filtra por localidad "A Coruña y alrededores". Ve perfiles de una productora de miel de Monfero, un huerto ecológico de Betanzos y una quesería artesanal. Lee las historias de cada uno, ve fotos del proceso. No se siente en una tienda — se siente conociendo a personas reales.

**Primera compra:** Compra un tarro de miel y un queso. Paga con tarjeta, recibe confirmación inmediata. Dos días después llega el paquete. Dentro, una nota escrita a mano por la productora.

**Momento de valor:** Carlos sigue a la productora de miel. Dos semanas después recibe notificación: *"Nueva cosecha de miel de castaño disponible"*. La compra antes de que se agote. Piensa: *"es como tener un mercado que no cierra"*.

**Nueva realidad:** Carlos tiene cinco artesanos seguidos. Compra cada mes algo de al menos uno de ellos. Ha recomendado Artelier a tres amigos.

*Capacidades reveladas: registro comprador, filtro de localidad, perfiles de artesano, feed cronológico, carrito y pago, notificaciones de nuevo producto, seguir artesano.*

---

### Journey 3 — Pedro, el artesano que gestiona una incidencia

**Situación:** Pedro hace joyería en plata en Pontevedra. Tiene ocho productos publicados en Artelier. Recibe un pedido de un colgante — €85. Envía por su propio servicio de mensajería (fuera de la plataforma).

**Incidencia:** El comprador abre una solicitud de reembolso alegando que el paquete llegó dañado. Adjunta foto. Pedro cree que el daño ocurrió en el transporte, no en origen.

**Gestión:** Ambas partes abren solicitud formal en la plataforma con evidencias. El admin revisa fotos del empaquetado original de Pedro y del estado de llegada. Determina que el daño es de transporte — la plataforma media pero no tiene responsabilidad económica porque el envío fue externo. Recomienda a Pedro gestionar reclamación con su mensajero.

**Resolución:** Pedro aprende la lección: en el siguiente pedido usa el método de envío de Artelier para tener el seguro incluido. El comprador, aunque insatisfecho con el mensajero, valora que la plataforma respondió con transparencia.

*Capacidades reveladas: sistema de disputas, solicitud de reembolso con evidencias, rol admin de arbitraje, distinción entre envío interno y externo, política anti-abuso.*

---

### Journey 4 — Admin, el guardián de la confianza

**Situación:** El equipo de Artelier recibe la solicitud de sello "Hecho a Mano" de María la ceramista y la de "Ecológico" de una productora de verduras de Ourense.

**Verificación de sellos:** El admin revisa la información del perfil, localidad declarada y descripción del proceso. Aprueba el "Hecho a Mano" de María (elaboración manual documentada). Para el "Ecológico" solicita certificación oficial a la productora antes de otorgarlo.

**Gestión de evento:** El admin crea el primer Mercado de Primavera de Artelier — evento de 48h. Notifica a todos los artesanos activos. Doce artesanos se apuntan con productos exclusivos. El admin activa el evento, monitoriza el tráfico y los pagos en tiempo real durante las 48h.

**Moderación:** Durante el evento, un usuario reporta un perfil sospechoso de revender productos industriales como artesanales. El admin investiga, determina que es válido e informa al reportador. La plataforma mantiene su integridad.

*Capacidades reveladas: panel de admin, gestión de sellos, creación de eventos, moderación de perfiles, monitorización de pagos en tiempo real.*

---

### Resumen de Capacidades por Journey

| Capacidad | Journey 1 | Journey 2 | Journey 3 | Journey 4 |
|-----------|-----------|-----------|-----------|-----------|
| Registro y perfiles | ✓ | ✓ | | |
| Catálogo y stock | ✓ | ✓ | | |
| Mensajería privada | ✓ | | ✓ | |
| Pagos y Stripe | ✓ | ✓ | ✓ | ✓ |
| Notificaciones | ✓ | ✓ | | |
| Sellos verificados | ✓ | ✓ | | ✓ |
| Disputas y devoluciones | | | ✓ | ✓ |
| Panel de admin | | | ✓ | ✓ |
| Eventos de plataforma | | | | ✓ |
| Feed y descubrimiento | | ✓ | | |

---

## Requisitos de Dominio

### Cumplimiento y Regulación

**RGPD / LOPDGDD (Protección de Datos)**
- Política de privacidad y cookies obligatoria, accesible desde todas las páginas
- Consentimiento explícito para comunicaciones de marketing (opt-in, no opt-out)
- Derechos del usuario implementados: acceso, rectificación, supresión, portabilidad y oposición
- Gestión interna por el equipo de Artelier — sin delegación a terceros en el MVP
- Registro de actividades de tratamiento mantenido internamente

**LSSI — Ley de Servicios de la Sociedad de la Información** *(requerido en MVP)*
- Aviso legal con datos identificativos del titular de la plataforma
- Información precontractual visible antes de confirmar cada compra: precio del producto + comisión de plataforma + comisión de seguro + fee Stripe = total a pagar
- Confirmación de pedido enviada por correo electrónico al comprador
- Condiciones generales de uso y venta accesibles desde todas las páginas

### Política de Devoluciones — Excepciones Legales

La política de devoluciones de Artelier se ajusta a la Directiva Europea de Derechos del Consumidor. Las siguientes excepciones al derecho de desistimiento de 14 días se informan al comprador **antes de confirmar la compra**, mediante aviso explícito en el flujo de pago:

| Tipo de producto | Derecho de desistimiento | Motivo legal |
|-----------------|--------------------------|--------------|
| Producto personalizado o a medida | **No aplica** | Art. 103.c Directiva 2011/83/UE |
| Producto perecedero (alimentos frescos, flores) | **No aplica** | Art. 103.d Directiva 2011/83/UE |
| Producto con sello de higiene roto | **No aplica** | Art. 103.e Directiva 2011/83/UE |
| Producto estándar no perecedero | **14 días** | Aplica el régimen general |

El comprador acepta explícitamente estas condiciones antes de completar el pago. La política anti-abuso de devoluciones (solicitud formal + evidencias + revisión admin) complementa este marco legal.

### Restricciones Técnicas

**Pagos (PCI-DSS)**
- Artelier no almacena datos de tarjeta en ningún momento — toda la gestión de datos de pago es responsabilidad de Stripe
- La integración con Stripe Connect debe seguir las guías de cumplimiento de Stripe para marketplaces
- Logs de transacciones almacenados para auditoría

**Seguridad de datos**
- Comunicaciones cifradas HTTPS en todas las interacciones
- Datos personales de usuarios almacenados en servidores dentro de la UE
- Contraseñas almacenadas con hash seguro (bcrypt o equivalente)

### Riesgos de Dominio y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Abuso de devoluciones en productos artesanales | Política diferenciada por tipo de producto + revisión admin |
| Fraude en pagos | Stripe Radar integrado para detección de fraude |
| Revendedores haciéndose pasar por artesanos | Proceso de verificación de sellos por admin + moderación de perfiles |
| Incumplimiento de envío por parte del artesano | Sistema de penalización automática tras plazo vencido |

---

## Innovación y Patrones Novedosos

### Áreas de Innovación Detectadas

**1. Slow Commerce como modelo de negocio deliberado**
El e-commerce convencional optimiza para reducir la fricción y el tiempo entre deseo y entrega. Artelier hace lo contrario: el tiempo de espera, la escasez y la anticipación son parte del valor entregado. Los pre-pedidos no son un workaround — son una mecánica de exclusividad. Esto no tiene precedente directo en marketplaces de escala.

**2. Creator economy aplicada a bienes físicos locales**
Plataformas como Substack o Patreon trasladaron el modelo "sigue al creador, no al contenido" al mundo digital. Artelier aplica esa misma lógica a bienes físicos producidos localmente: el comprador sigue a María la ceramista, no al catálogo de cerámica. La compra es consecuencia del vínculo, no el objetivo principal. Ningún marketplace artesanal existente (Etsy, Not On The High Street) opera bajo este principio.

**3. Escasez estructural como ventaja competitiva**
En e-commerce convencional, el stock único por producto es un problema a resolver. En Artelier, es una feature: cada compra agota el stock automáticamente porque cada pieza artesanal es única. La escasez es inherente al modelo, no fabricada artificialmente.

**4. Proceso de fabricación como capa de contenido diferencial**
Artelier añade una dimensión que ningún marketplace tiene: la transparencia del proceso de creación como contenido que el comprador consume entre compras. El artesano publica actualizaciones del taller, estados de fabricación, fotos del proceso — convirtiendo la espera en experiencia y generando retención sin necesidad de nuevas compras.

### Contexto de Mercado y Competencia

| Competidor | Modelo | Diferencia con Artelier |
|------------|--------|------------------------|
| Etsy | Marketplace global de artesanía | Sin foco local, sin slow commerce, artesano como vendedor anónimo |
| Wallapop / Vinted | Segunda mano y artesanía informal | Sin perfiles profesionales, sin pagos seguros estructurados |
| Instagram + DMs | Venta social informal | Sin pasarela de pago integrada, sin catálogo, sin protección al comprador |
| Mercados físicos | Venta presencial puntual | Sin disponibilidad 24/7, coste elevado para el artesano |
| Not On The High Street | Marketplace UK de artesanía | Sin foco geográfico local, sin filosofía slow commerce |

**Hueco real:** No existe en España una plataforma que combine disponibilidad digital 24/7, foco geográfico local, filosofía de consumo lento y el artesano como protagonista con herramientas de contenido.

### Enfoque de Validación

Las hipótesis innovadoras de Artelier se validan con el MVP de las 4 señales de vida:
1. ¿Compra alguien a través de la plataforma? → valida el canal digital
2. ¿Un comprador sigue a un artesano? → valida el modelo "creador, no tienda"
3. ¿Un comprador contacta directamente con un artesano? → valida el vínculo directo
4. ¿Un comprador repite compra? → valida la retención por vínculo, no por precio

La comunidad fundadora (artesanas conocidas por la fundadora) elimina el riesgo de arranque en frío y permite validar en un entorno controlado antes de escalar.

### Mitigación de Riesgos de Innovación

| Riesgo | Mitigación |
|--------|------------|
| El comprador no entiende el modelo slow commerce | Comunicación clara en onboarding: "aquí las cosas buenas se esperan" |
| El artesano no adopta la capa de contenido | Es opcional en MVP — la tienda funciona sin actualizaciones de proceso |
| La escasez (1 unidad) genera frustración si el producto se agota | Notificación de disponibilidad + pre-pedidos (V2) como válvula de escape |
| El modelo de comisión solo al comprador genera rechazo | Transparencia total en el checkout: desglose completo antes de pagar |

---

## Arquitectura Técnica del MVP

### Visión General

Artelier es un marketplace fullstack web-first. En el MVP, el único cliente es la **web app con SSR/SSG**, que consume una API backend. El backend gestiona perfiles, catálogo, pagos (Stripe Connect), mensajería y notificaciones. La app móvil Flutter (iOS + Android) se implementa en V2 sobre la misma API, sin cambios estructurales. Ver [Alcance del Producto — V2] y [Scoping del Proyecto — Fase 2] para el alcance mobile.

### Arquitectura Web (SSR/SSG)

**Framework recomendado:** Next.js (React) o Nuxt (Vue)

- Renderizado en servidor (SSR) para páginas de perfiles de artesano y catálogo — indexables por Google
- Generación estática (SSG) para páginas de marketing, aviso legal, condiciones de uso y política de privacidad
- SEO completo: meta tags, Open Graph, URLs limpias por artesano (ej. `/artesanos/maria-ceramista-lugo`)
- Diseño responsive — funciona en móvil, tablet y escritorio
- Accesibilidad WCAG AA: contraste suficiente, navegación por teclado, textos redimensionables, alt text en imágenes

**Objetivos de rendimiento:**
- Core Web Vitals en verde (LCP < 2.5s, CLS < 0.1, FID < 100ms)
- Carga aceptable en conexiones 3G (zonas rurales de Galicia)

### Mensajería y Tiempo Real

**Modelo MVP:** Polling periódico (cada 5-10 segundos cuando la pestaña está activa en primer plano)
- Actualización por polling en pantalla de conversación activa
- Notificación por email para mensajes nuevos cuando el usuario no está activo en la plataforma
- Migración a WebSockets planificada para V2

### Consideraciones de Implementación

- Backend compartido entre web y mobile (API REST)
- Stripe Connect Express para distribución automática de comisiones — más simple que Standard, con sandbox extensivo antes de producción
- Datos de usuario y transacciones en servidores dentro de la UE (cumplimiento RGPD)
- CI/CD desde el inicio para despliegues frecuentes durante la fase de validación

### Arquitectura Mobile (V2)

La app móvil se implementa en V2 con **Flutter** (una base de código para iOS y Android). Funcionalidades específicas de mobile que no aplican al MVP web: notificaciones push nativas (APNs + FCM), modo offline básico con caché local, acceso a cámara nativa para fotografiar productos desde el taller, y distribución en Apple App Store y Google Play Store.

---

## Scoping del Proyecto y Desarrollo por Fases

### Estrategia y Filosofía del MVP

**Enfoque:** MVP de validación — el camino más corto hacia las 4 señales de vida con la menor superficie técnica posible.

**Contexto de recursos:** Proyecto personal, autofinanciado, desarrolladora en solitario, sin plazo fijo. El riesgo principal es el agotamiento antes del lanzamiento — el alcance del MVP se ha ajustado en consecuencia.

**Equipo mínimo necesario para el MVP:** 1 desarrolladora fullstack con conocimientos de Next.js, API REST, Stripe Connect y despliegue en cloud.

**Decisión de alcance:** El MVP es web-only. La app móvil Flutter (iOS + Android) se traslada a V2, cuando existan usuarios reales que la demanden. Las notificaciones push nativas se sustituyen por notificaciones por email en el MVP sin pérdida de valor esencial.

### Funcionalidades MVP — Fase 1 (Web App)

**Journeys cubiertos:** María la ceramista (J1), Carlos el comprador (J2), gestión de incidencias (J3), operaciones de admin (J4 parcial)

**Capacidades esenciales:**

- **Perfiles diferenciados:** Registro y autenticación para artesano y consumidor. Perfil artesano: foto, nombre, descripción, localidad, categoría, pestaña de tienda + pestaña de contenidos. Perfil consumidor: home feed cronológico, seguir artesanos.
- **Catálogo de productos:** Publicación de producto con foto, nombre, descripción, precio, categoría y tipo (único / perecedero con fecha de caducidad). Compra agota stock automáticamente. Pedido personalizado directo al artesano.
- **Pasarela de pagos (Stripe Connect):** Checkout con desglose completo visible antes de pagar (precio + comisión plataforma % + comisión seguro % + fee Stripe). Primera venta sin comisión para el artesano. Penalización automática por incumplimiento de envío.
- **Mensajería privada:** Chat artesano ↔ comprador con polling cada 5-10 segundos. Notificación por email para mensajes nuevos cuando el usuario no está activo.
- **Sellos verificados:** Flujo de solicitud por artesano (desde formulario de producto o `/studio/settings/seals`) + revisión y aprobación por admin. Sellos automáticos asignados por el sistema al cumplir umbrales. Todos actúan como filtros de búsqueda (Hecho a Mano, Ecológico, Sostenible, Artesana Verificada, Artesanía de Galicia).
- **Notificaciones por email:** Nueva venta, mensaje recibido, nuevo seguidor, nuevo producto de artesano seguido, confirmación de pedido (LSSI).
- **Descubrimiento:** Filtro manual de localidad, búsqueda por categoría y sello, feed cronológico de artesanos seguidos.
- **Sistema de disputas y devoluciones:** Solicitud formal con evidencias, revisión por admin, política de excepciones legales visible en checkout, ventana de cancelación de 24h.
- **Panel de administración básico:** Gestión de sellos, revisión de disputas, moderación de perfiles.
- **Páginas legales (LSSI):** Aviso legal, política de privacidad, política de cookies, condiciones generales de uso y venta.

### Hoja de Ruta Post-MVP

Las funcionalidades de V2 (Mobile + Crecimiento) y V3 (Visión) están definidas en la sección [Alcance del Producto]. El orden de priorización responde a la misma lógica: validar el canal digital primero con la menor superficie técnica posible → extender a mobile cuando existan usuarios reales que lo demanden → escalar con features de crecimiento y visión sobre una base probada.

### Estrategia de Mitigación de Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Stripe Connect es la integración más compleja del MVP | Usar Stripe Connect Express (más simple que Standard) + sandbox extensivo antes de producción |
| Baja tracción inicial de compradores | La red de artesanas conocidas genera los primeros perfiles. Cada artesana invita a sus compradores habituales. |
| Agotamiento de la desarrolladora antes de lanzar | MVP web-only sin móvil. Funcionalidades mínimas que validan la hipótesis. Sin perfeccionismo en V1. |
| Calidad del contenido de artesanos (fotos, descripciones) | Guía de onboarding con ejemplos. Las herramientas de IA de contenido llegan en V2. |

---

## Requisitos Funcionales

### Gestión de Usuarios

- **FR1:** Un visitante puede registrarse eligiendo el tipo de perfil: artesano o comprador
- **FR2:** Un usuario registrado puede iniciar y cerrar sesión
- **FR3:** Un usuario puede recuperar su contraseña
- **FR4:** Un usuario puede editar su información de cuenta
- **FR5:** Un usuario puede solicitar la eliminación de su cuenta y datos asociados (RGPD)
- **FR6:** Un usuario puede exportar sus datos personales (RGPD)
- **FR7:** Un usuario puede gestionar sus preferencias de cookies

### Perfil del Artesano

- **FR8:** Un artesano puede crear y editar su perfil público (foto, nombre, descripción, localidad, categoría de producción)
- **FR9:** Un artesano puede publicar actualizaciones libres de proceso en su pestaña de contenidos (texto + foto)
- **FR10:** Un artesano puede solicitar sellos de verificación al administrador
- **FR11:** Un artesano puede ver estadísticas básicas de su perfil (visitas, seguidores, ventas realizadas)

### Perfil del Comprador

- **FR12:** Un comprador puede ver y editar su perfil privado
- **FR13:** Un comprador puede seguir y dejar de seguir artesanos
- **FR14:** Un comprador puede ver su historial de compras y pedidos

### Catálogo y Productos

- **FR15:** Un artesano puede publicar un producto con foto, nombre, descripción, precio, categoría y tipo (único / perecedero)
- **FR16:** Un artesano puede asignar a un producto perecedero una fecha de caducidad tras la cual se retira automáticamente del catálogo
- **FR17:** Un artesano puede editar y eliminar sus productos publicados
- **FR18:** Un artesano puede recibir y responder solicitudes de pedido personalizado de compradores concretos
- **FR19:** El sistema marca un producto como no disponible cuando es comprado
- **FR20:** El sistema retira automáticamente del catálogo los productos perecederos al vencer su fecha de caducidad

### Descubrimiento y Búsqueda

- **FR21:** Un visitante no registrado puede ver perfiles de artesanos y catálogos de productos (acceso público, indexable por buscadores)
- **FR22:** Un comprador puede ver un feed cronológico de productos y contenidos de artesanos que sigue
- **FR23:** Un usuario puede filtrar artesanos y productos por localidad
- **FR24:** Un usuario puede buscar artesanos y productos por categoría
- **FR25:** Un usuario puede filtrar artesanos y productos por sello de verificación

### Mensajería

- **FR26:** Un comprador puede iniciar una conversación privada con un artesano
- **FR27:** Un artesano puede responder mensajes de compradores
- **FR28:** Ambas partes pueden adjuntar imágenes en los mensajes
- **FR29:** Un usuario puede ver el historial completo de sus conversaciones

### Pagos y Transacciones

- **FR30:** Un comprador puede adquirir un producto mediante pasarela de pago integrada
- **FR31:** El sistema muestra el desglose completo de costes antes de confirmar el pago (precio del producto + comisión de plataforma + comisión de seguro + fee Stripe)
- **FR32:** El sistema informa al comprador de las excepciones al derecho de desistimiento aplicables según el tipo de producto, antes de confirmar el pago
- **FR33:** Un comprador puede cancelar una compra dentro de las 24h con justificación
- **FR34:** Un artesano puede elegir entre el método de envío de la plataforma, un método de envío propio o recogida en persona por parte del comprador — en los tres casos el pago se realiza siempre a través de la plataforma como mecanismo de reserva
- **FR35:** Un artesano puede confirmar el envío de un pedido con número de seguimiento, o marcar un pedido como listo para recogida
- **FR36:** El sistema cancela automáticamente un pedido y devuelve el importe íntegro al comprador si el artesano no confirma el envío o la disponibilidad para recogida dentro del plazo establecido
- **FR37:** El sistema aplica penalización económica al artesano cuando el incumplimiento de envío es imputable a él

### Notificaciones

- **FR38:** Un usuario recibe notificación por email cuando se produce una nueva venta, un mensaje nuevo, un nuevo seguidor o un nuevo producto de un artesano seguido
- **FR39:** Un comprador recibe confirmación de pedido por email tras cada compra (LSSI)
- **FR40:** Un artesano recibe notificación por email de cada nuevo pedido recibido

### Sistema de Confianza y Disputas

- **FR41:** Un comprador puede abrir una solicitud de disputa o reembolso con evidencias adjuntas
- **FR42:** Un artesano puede abrir una solicitud de disputa con evidencias adjuntas
- **FR43:** El administrador puede revisar, aprobar o rechazar solicitudes de disputa y reembolso
- **FR44:** El sistema aplica la política de devoluciones según el tipo de producto (perecedero, personalizado o a medida, estándar)

### Administración

- **FR45:** El administrador puede revisar y aprobar o rechazar solicitudes de sellos de verificación
- **FR46:** El administrador puede suspender o eliminar perfiles que incumplan las condiciones de uso
- **FR47:** El administrador puede acceder a un panel con métricas básicas de actividad (artesanos activos, compradores registrados, transacciones, disputas abiertas)

### Cumplimiento Legal

- **FR48:** La plataforma muestra aviso legal, política de privacidad, política de cookies y condiciones generales de uso accesibles desde todas las páginas
- **FR49:** La plataforma exime de la primera comisión de venta al artesano en su primera transacción completada

### Estados de Pedido y Proceso

- **FR50:** Un artesano puede actualizar el estado de fabricación de un pedido activo (En preparación → Listo → Enviado / Listo para recogida), visible para el comprador en su historial de pedidos

---

## Requisitos No Funcionales

### Rendimiento

- **NFR1:** Las páginas de perfil de artesano y catálogo de productos cargan en menos de 2.5 segundos en conexiones 3G (Core Web Vitals: LCP < 2.5s)
- **NFR2:** El flujo completo de checkout se completa en menos de 5 segundos en condiciones normales de red
- **NFR3:** El sistema de polling de mensajería actualiza las conversaciones activas con una latencia máxima de 10 segundos
- **NFR4:** El sistema mantiene disponibilidad operativa durante eventos de alta concurrencia (mercados de 48h) sin degradación de la pasarela de pago
- **NFR5:** El CLS (Cumulative Layout Shift) es inferior a 0.1 para evitar clicks accidentales en el flujo de pago

### Seguridad

- **NFR6:** Todas las comunicaciones entre cliente y servidor se realizan sobre HTTPS/TLS 1.2 o superior
- **NFR7:** Artelier no almacena datos de tarjeta de pago — la gestión de datos PCI es responsabilidad exclusiva de Stripe
- **NFR8:** Las contraseñas de usuario se almacenan con hash bcrypt (coste mínimo 12), nunca en texto plano
- **NFR9:** Los datos personales de usuarios se almacenan en servidores ubicados dentro de la Unión Europea
- **NFR10:** Las sesiones de usuario expiran tras 30 días de inactividad
- **NFR11:** El panel de administración está protegido con autenticación de doble factor (2FA)
- **NFR12:** Los logs de transacciones económicas se conservan durante un mínimo de 5 años (cumplimiento fiscal)

### Escalabilidad

- **NFR13:** La arquitectura soporta crecimiento de 100 a 10.000 usuarios sin cambios estructurales, únicamente ajustando recursos de infraestructura
- **NFR14:** El sistema gestiona picos de tráfico durante eventos de mercado (estimado: 10x tráfico habitual en 48h) sin interrupción del servicio de pagos
- **NFR15:** La base de datos soporta hasta 50.000 productos publicados sin degradación de los tiempos de búsqueda y filtrado

### Accesibilidad

- **NFR16:** La interfaz web cumple el estándar WCAG 2.1 nivel AA
- **NFR17:** Todas las imágenes de productos y perfiles incluyen texto alternativo descriptivo
- **NFR18:** El flujo completo de compra es navegable mediante teclado sin ratón
- **NFR19:** Los contrastes de color en elementos interactivos y textos cumplen el ratio mínimo de 4.5:1 (WCAG AA)

### Integraciones

- **NFR20:** La integración con Stripe Connect Express mantiene una tasa de éxito de transacciones ≥ 99.9%
- **NFR21:** Los emails transaccionales se entregan en menos de 2 minutos desde el evento que los genera
- **NFR22:** El sistema detecta y gestiona fallos de la API de Stripe con reintentos automáticos y notificación al usuario en caso de fallo irrecuperable
