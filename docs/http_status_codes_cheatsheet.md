# Chuleta — Códigos de Estado HTTP

Referencia rápida de los códigos HTTP más usados en APIs REST.
**Regla general: 4xx = culpa del cliente · 5xx = culpa del servidor**

---

## 2xx — Éxito

| Código | Nombre | Cuándo usarlo |
|--------|--------|---------------|
| `200` | OK | Petición exitosa (GET, PUT, PATCH) |
| `201` | Created | Recurso creado correctamente (POST) |
| `204` | No Content | Éxito sin cuerpo de respuesta (DELETE) |

---

## 4xx — Error del cliente

| Código | Nombre | Cuándo usarlo |
|--------|--------|---------------|
| `400` | Bad Request | Datos inválidos o incompletos enviados por el cliente |
| `401` | Unauthorized | No hay sesión / usuario no autenticado |
| `403` | Forbidden | Autenticado pero sin permiso (rol incorrecto) |
| `404` | Not Found | El recurso solicitado no existe |
| `405` | Method Not Allowed | El método HTTP no está permitido (ej. GET en un endpoint POST) |
| `409` | Conflict | El recurso existe pero está en un estado incompatible con la operación |
| `422` | Unprocessable Entity | Datos bien formados pero semánticamente inválidos |
| `429` | Too Many Requests | Rate limit superado |

---

## 5xx — Error del servidor

| Código | Nombre | Cuándo usarlo |
|--------|--------|---------------|
| `500` | Internal Server Error | Error inesperado en el servidor |
| `503` | Service Unavailable | Servicio externo no configurado o caído |
| `504` | Gateway Timeout | Timeout esperando respuesta de un servicio externo |

---

## Ejemplos reales (proyecto Artelier)

| Situación | Código correcto |
|-----------|----------------|
| Usuario no autenticado | `401` |
| Compradora intentando acceder a endpoint de artesana | `403` |
| Stripe no configurado (`stripe === null`) | `503` |
| Rate limit superado | `429` |
| Producto inactivo o eliminado | `409` |
| Artesana sin cuenta Stripe para cobrar | `409` |

---

## Errores frecuentes a evitar

| Error | Por qué está mal | Correcto |
|-------|-----------------|----------|
| `405` para producto no disponible | 405 = método HTTP incorrecto, no estado del recurso | `409` |
| `504` para cuenta Stripe no configurada | 504 = timeout de red, no error de lógica | `409` o `503` |
| `200` con `{ error: ... }` en el body | HTTP 200 significa éxito — contradice el error | Usa el código correcto |
