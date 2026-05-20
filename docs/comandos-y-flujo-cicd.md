# Comandos y Flujo CI/CD — Artelier

---

## Comandos principales

### `npm run dev`
Arranca el servidor local para desarrollar. El código se recompila automáticamente cada vez que guardas un archivo.

- **Cuándo usarlo:** siempre abierto mientras desarrollas
- **URL local:** `localhost:3000`
- **Motor:** Turbopack (rápido, incluido en T3)
- **Nunca usar en producción**

---

### `npm run lint`
ESLint revisa el código buscando malas prácticas, imports no usados y patrones problemáticos.

- **Cuándo usarlo:** antes de cada commit
- **Qué detecta:** `var` en vez de `const`, imports sin usar, patrones inseguros
- **Si falla:** corrige los errores antes de continuar

---

### `npm run typecheck`
TypeScript verifica que no hay errores de tipos sin compilar el proyecto.

- **Cuándo usarlo:** antes de cada commit
- **Comando interno:** `tsc --noEmit`
- **Más rápido que build** — solo verifica tipos, no genera archivos
- **Si falla:** corrige los errores de tipos antes de continuar

---

### `npm run build`
Compila el proyecto completo como si fuera a producción. La comprobación más completa.

- **Cuándo usarlo:** antes de abrir un Pull Request
- **Más lento que typecheck** — compila todo
- **Detecta errores que `dev` a veces no muestra**
- **Si falla:** el PR no debería abrirse hasta corregirlo

---

## Flujo completo de desarrollo

```
DESARROLLO DIARIO
─────────────────
npm run dev          ← abierto siempre mientras codificas
                       cambios visibles en localhost:3000 al guardar

ANTES DE HACER COMMIT
─────────────────────
npm run lint         ← ¿código limpio?
npm run typecheck    ← ¿tipos correctos?
git add + git commit

ANTES DE ABRIR PR
─────────────────
npm run build        ← ¿compila en producción?
git push -u origin feature/nombre-historia

EN GITHUB — PULL REQUEST
────────────────────────
GitHub Actions ejecuta automáticamente:
  ✓ lint
  ✓ typecheck
  ✓ build
  ✓ Vercel genera preview URL

Si todo pasa → merge habilitado → deploy automático a producción
Si algo falla → merge bloqueado → corregir y volver a pushear
```

---

## Comprobaciones automáticas en PR (CI/CD)

Configuradas en `.github/workflows/ci.yml`. Se ejecutan automáticamente en cada Pull Request hacia `main`.

### 1. Lint (ESLint)
- **Qué comprueba:** malas prácticas, imports no usados, patrones problemáticos
- **Comando:** `npm run lint`
- **Si falla:** merge bloqueado

### 2. Typecheck (TypeScript)
- **Qué comprueba:** errores de tipos en todo el proyecto
- **Comando:** `npm run typecheck`
- **Si falla:** merge bloqueado

### 3. Build (Next.js)
- **Qué comprueba:** compilación completa en modo producción
- **Comando:** `npm run build`
- **Si falla:** merge bloqueado

### 4. Preview deployment (Vercel)
- **Qué hace:** genera una URL única con el resultado visual del PR
- **Cuándo:** automático al abrir o actualizar el PR
- **Para qué:** revisar el resultado visual antes de mergear
- **Si falla:** merge bloqueado

---

## Tabla resumen

| Comando | Qué detecta | Cuándo usarlo | Automático en PR |
|---|---|---|---|
| `npm run dev` | Errores en tiempo real | Siempre durante desarrollo | No |
| `npm run lint` | Malas prácticas | Antes de cada commit | Sí |
| `npm run typecheck` | Errores de tipos | Antes de cada commit | Sí |
| `npm run build` | Errores de producción | Antes de abrir PR | Sí |
| Vercel preview | Resultado visual | Al abrir PR | Sí |

---

## Regla de oro

> Si `lint`, `typecheck` o `build` fallan localmente — **no hagas push**.  
> Corrígelos primero. GitHub Actions los volverá a ejecutar en el PR  
> y bloqueará el merge si alguno falla.

---

*Artelier — Referencia técnica interna*
