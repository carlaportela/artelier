# Story 0.2: Sistema de diseño Tinta y Lino

Status: done

## Story

Como desarrolladora,
quiero implementar el sistema de tokens de diseño y tipografía self-hosted,
para que todos los componentes usen la identidad visual de Artelier de forma consistente.

## Acceptance Criteria

1. **[Tokens de color]** Dado que abro el CSS global, cuando lo reviso, entonces contiene los tokens de color como CSS custom properties: `--primary` #3D5A4F · `--accent` #C4956A · `--bg` #F4F0E8 · `--surface` #EAE5DA · `--surface-2` #DDD7C8 · `--text` #1A1A18 · `--text-muted` #5A5648 · `--text-light` #8A8478 · `--border` #CCC8BC, y los tokens de sellos: `--seal-mano`, `--seal-eco`, `--seal-reciclado`, `--seal-galicia`, `--seal-km0` con sus colores de texto y fondo.

2. **[Tipografía self-hosted]** Dado que existen los archivos de fuente en `public/fonts/`, cuando cargo cualquier página, entonces The Girl Next Door y DM Sans se cargan desde el servidor local, el `<head>` no contiene ninguna referencia a `fonts.googleapis.com`, y la directiva `@font-face` está declarada en el CSS global.

3. **[shadcn/ui integrado]** Dado que shadcn/ui está inicializado, cuando los componentes Button, Input, Card, Dialog, Tabs, Badge, Avatar, Sheet, Separator y Sonner están instalados, entonces todos usan CSS custom properties del sistema Tinta y Lino, el radio de borde base es `100px` para botones y `12px` para tarjetas.

4. **[Layout base]** Dado que cualquier página carga, cuando reviso el HTML generado, entonces `<html lang="es">`, el `<title>` es "Artelier", la descripción es "Marketplace de artesanía gallega", y el `<body>` usa la fuente DM Sans como base tipográfica.

5. **[Build limpio]** Dado que aplico todos los cambios, cuando ejecuto `npm run build`, entonces el build pasa sin errores ni warnings de fuentes o variables CSS.

## Tasks / Subtasks

- [x] Task 1: Descargar fuentes y colocar en public/fonts/ (AC: 2)
  - [x] Descargar The Girl Next Door: `TheGirlNextDoor-Regular.woff2` y `.woff`
  - [x] Descargar DM Sans: Regular (400), Medium (500), Bold (700) en `.woff2` y `.woff`
  - [x] Colocar todos los archivos en `public/fonts/`

- [x] Task 2: Actualizar globals.css con Tinta y Lino (AC: 1, 2, 3)
  - [x] Añadir `@font-face` para The Girl Next Door y DM Sans al inicio del archivo
  - [x] Reemplazar tokens `:root` de shadcn con los valores Tinta y Lino
  - [x] Añadir tokens semánticos de Artelier (`--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--text-light`)
  - [x] Añadir tokens de sellos verificados (`--seal-mano-*`, `--seal-eco-*`, etc.)
  - [x] Actualizar `@theme` con las fuentes: `--font-display` y `--font-sans`
  - [x] Ajustar `--radius` a `0.75rem` (12px para tarjetas)

- [x] Task 3: Actualizar layout.tsx (AC: 2, 4)
  - [x] Reemplazar `import { Geist } from "next/font/google"` por `import localFont from "next/font/local"`
  - [x] Configurar `dmSans` y `theGirlNextDoor` con `next/font/local`
  - [x] Actualizar metadata: title "Artelier", description "Marketplace de artesanía gallega"
  - [x] Cambiar `<html lang="en">` a `<html lang="es">`
  - [x] Aplicar las dos variables CSS de fuente en el `<html>`

- [x] Task 4: Actualizar page.tsx (AC: 4, 5)
  - [x] Reemplazar el contenido T3 placeholder con un placeholder mínimo de Artelier
  - [x] Usar clases de Tailwind con los tokens Tinta y Lino
  - [x] Sin hardcodear colores hexadecimales — solo usar CSS variables

- [x] Task 5: Verificar (AC: 5)
  - [x] `npm run build` pasa sin errores
  - [x] Comprobar que no hay `fonts.googleapis.com` en el HTML renderizado
  - [x] Comprobar que los CSS custom properties están presentes en el `:root`

## Dev Notes

### CRÍTICO: Tailwind v4 — No existe tailwind.config.ts

Este proyecto usa **Tailwind CSS v4**. En Tailwind v4 **no hay `tailwind.config.ts`** — toda la configuración de design tokens ocurre en el CSS mediante directivas `@theme` e `@theme inline`. El AC menciona "tailwind.config.ts" pero la implementación correcta es en `src/styles/globals.css`.

```css
/* En globals.css — así se añaden tokens en Tailwind v4 */
@theme {
  --font-display: "The Girl Next Door", cursive;
  --font-sans: "DM Sans", sans-serif;
}
```

Para usar los tokens en clases de Tailwind: `font-display`, `font-sans`, `text-primary`, `bg-bg`, etc.

### Estado actual de globals.css (LEER ANTES DE MODIFICAR)

`src/styles/globals.css` actualmente contiene:
- `@import "tailwindcss"` + `@import "tw-animate-css"` + `@import "shadcn/tailwind.css"`
- `@custom-variant dark`
- `@theme` block con `--font-sans` apuntando a Geist
- `@theme inline` block con referencias a variables shadcn (`--color-background`, etc.)
- `:root` con los valores por defecto de shadcn en formato `oklch()`
- `.dark` con los overrides de modo oscuro
- `@layer base` con reglas globales de body/html

**CONSERVAR la estructura — solo modificar los valores de las variables en `:root`.**

### Mapeo: tokens Artelier → tokens shadcn

shadcn usa su propio sistema de nombres. Necesitamos REEMPLAZAR los valores de los tokens shadcn con los valores de Tinta y Lino:

| Token shadcn | Valor actual (Zinc) | Valor Tinta y Lino | Hex |
|---|---|---|---|
| `--background` | blanco | fondo app | `#F4F0E8` |
| `--foreground` | casi negro | texto principal | `#1A1A18` |
| `--card` | blanco | superficie tarjeta | `#EAE5DA` |
| `--card-foreground` | casi negro | texto principal | `#1A1A18` |
| `--popover` | blanco | superficie elevada | `#EAE5DA` |
| `--popover-foreground` | casi negro | texto principal | `#1A1A18` |
| `--primary` | casi negro | verde pizarra | `#3D5A4F` |
| `--primary-foreground` | blanco | crema/blanco | `#F4F0E8` |
| `--secondary` | gris claro | superficie-2 | `#DDD7C8` |
| `--secondary-foreground` | casi negro | texto principal | `#1A1A18` |
| `--muted` | gris claro | superficie-2 | `#DDD7C8` |
| `--muted-foreground` | gris medio | texto secundario | `#5A5648` |
| `--accent` | gris claro | superficie hover | `#DDD7C8` |
| `--accent-foreground` | casi negro | texto principal | `#1A1A18` |
| `--destructive` | rojo | mantener rojo | (sin cambio) |
| `--border` | gris claro | borde lino | `#CCC8BC` |
| `--input` | gris claro | borde lino | `#CCC8BC` |
| `--ring` | gris | verde pizarra | `#3D5A4F` |
| `--radius` | 0.625rem | 12px tarjetas | `0.75rem` |

**IMPORTANTE:** shadcn usa `oklch()` para sus valores. Puedes usar hex directamente en `:root` — CSS soporta ambos formatos. Las hex son más legibles y corresponden exactamente a los valores del spec.

**El `--accent` de shadcn (hover state) ≠ el `--accent` del diseño (ámbar #C4956A).**  
Solución: usa `--accent` de shadcn para hover states (→ `--surface-2`) y añade `--brand-accent: #C4956A` como token propio de Artelier.

### Tokens propios de Artelier (además de shadcn)

Añadir en `:root` como propiedades adicionales:

```css
/* Tokens semánticos Artelier */
--bg: #F4F0E8;
--surface: #EAE5DA;
--surface-2: #DDD7C8;
--text: #1A1A18;
--text-muted: #5A5648;
--text-light: #8A8478;
--brand-accent: #C4956A;   /* ámbar — ojo: diferente de --accent de shadcn */

/* Sellos verificados — producto */
--seal-mano-text: #3D5A4F;   /* Hecho a Mano */
--seal-mano-bg: #C8DDD8;
--seal-eco-text: #2E6B48;    /* Ecológico */
--seal-eco-bg: #C4E0D4;
--seal-reciclado-text: #4A7C5E; /* Reciclado */
--seal-reciclado-bg: #D4EAE0;
--seal-galicia-text: #6B5E2E;  /* Artesanía de Galicia */
--seal-galicia-bg: #E0D9C4;
--seal-km0-text: #7C4E2A;     /* Serie Limitada / Km0 */
--seal-km0-bg: #F0DDD0;
```

### Fuentes: descarga y configuración

**The Girl Next Door** (display/titulares):
- Fuente en Google Fonts: [fonts.google.com/specimen/The+Girl+Next+Door](https://fonts.google.com/specimen/The+Girl+Next+Door)
- Solo tiene un peso: Regular (400)
- Archivos a descargar: `TheGirlNextDoor-Regular.woff2`, `TheGirlNextDoor-Regular.woff`
- Alternativa rápida: descargar desde [gwfh.mranftl.com](https://gwfh.mranftl.com/fonts/the-girl-next-door) que ya genera los WOFF2

**DM Sans** (body/UI):
- Fuente en Google Fonts: [fonts.google.com/specimen/DM+Sans](https://fonts.google.com/specimen/DM+Sans)
- Pesos necesarios: 400 (Regular), 500 (Medium), 700 (Bold)
- Archivos: `DMSans-Regular.woff2`, `DMSans-Medium.woff2`, `DMSans-Bold.woff2`
- Alternativa: [gwfh.mranftl.com](https://gwfh.mranftl.com/fonts/dm-sans)

**@font-face en globals.css:**

```css
/* Añadir al inicio de globals.css, antes de @import "tailwindcss" */
@font-face {
  font-family: "The Girl Next Door";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/TheGirlNextDoor-Regular.woff2") format("woff2"),
       url("/fonts/TheGirlNextDoor-Regular.woff") format("woff");
}

@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/DMSans-Regular.woff2") format("woff2"),
       url("/fonts/DMSans-Regular.woff") format("woff");
}

@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/DMSans-Medium.woff2") format("woff2"),
       url("/fonts/DMSans-Medium.woff") format("woff");
}

@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/DMSans-Bold.woff2") format("woff2"),
       url("/fonts/DMSans-Bold.woff") format("woff");
}
```

Nota: en Next.js, `/fonts/` en la URL corresponde a `public/fonts/` en el proyecto.

### Fuentes en next/font/local (layout.tsx)

Reemplazar el Geist actual con `next/font/local` para que Next.js optimice la carga (preloading automático):

```typescript
import localFont from "next/font/local";

const dmSans = localFont({
  src: [
    { path: "../../public/fonts/DMSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/DMSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/DMSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const theGirlNextDoor = localFont({
  src: "../../public/fonts/TheGirlNextDoor-Regular.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});
```

Usar ambas variables en el elemento `<html>`:
```tsx
<html lang="es" className={`${dmSans.variable} ${theGirlNextDoor.variable}`}>
```

El `@font-face` en globals.css sirve como fallback/documentación. Con `next/font/local`, Next.js inyecta automáticamente los `@font-face` en el `<head>` — no habrá referencias a `fonts.googleapis.com`.

### Radios de borde

| Uso | Valor |
|---|---|
| Sellos (SealBadge) | 4px → clase `rounded-[4px]` o `rounded-sm` |
| Notices, avisos | 8px → clase `rounded-[8px]` |
| Tarjetas, modales, perfiles | 12px → clase `rounded-[12px]` o `rounded-xl` con --radius: 0.75rem |
| Botones pill | 100px → clase `rounded-full` o `rounded-[100px]` |

En shadcn, el Button usa `--radius` para su borde. Dado que queremos `--radius: 0.75rem` (12px para tarjetas), los botones de shadcn tendrán 12px por defecto. Para botones pill en Artelier se usará la clase `rounded-full` en los botones principales (CTA). No modificar `src/components/ui/button.tsx`.

**NUNCA modificar archivos en `src/components/ui/`** — son gestionados por shadcn. Siempre extender mediante composición.

### Estado actual de layout.tsx (LEER ANTES DE MODIFICAR)

Actualmente `src/app/layout.tsx`:
- Importa `Geist` de `"next/font/google"` (referencia a Google Fonts — debe eliminarse)
- metadata: title "Create T3 App", description "Generated by create-t3-app"
- `<html lang="en">` (debe cambiarse a "es")
- Aplica `${geist.variable}` en el html

Todo esto debe reemplazarse según Task 3.

### page.tsx: reemplazar placeholder T3

El `src/app/page.tsx` actual tiene el contenido T3 de demostración. Reemplazar con un placeholder mínimo que use los tokens Tinta y Lino. Este archivo será reemplazado completamente en Historia 3.1 (feed público), así que no invertir tiempo — solo quitar el contenido de T3:

```tsx
// src/app/page.tsx — placeholder temporal, se reemplaza en Historia 3.1
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[--bg]">
      <p className="font-display text-[--primary] text-2xl">Artelier</p>
    </main>
  );
}
```

### Aprendizajes de Historia 0.1

- **`db push` vs `migrate dev`**: la migración `migrate dev` necesita terminal interactivo. Usar `db push --accept-data-loss` en entornos no interactivos durante desarrollo.
- **shadcn init**: usar flag `-d` para evitar prompts interactivos (`npx shadcn@latest init -d`)
- **TypeScript build**: `npx tsc --noEmit` es más rápido que `npm run build` para verificar tipos durante desarrollo
- **`components.json`**: style es `"base-nova"` (Tailwind v4), no "New York". No modificar este archivo.
- **Build debe pasar en cada tarea**: verificar con `npx tsc --noEmit` después de cada Task

### Restricciones de arquitectura

- `NUNCA` importar fuentes de `fonts.googleapis.com` — self-hosted obligatorio (AR12)
- `NUNCA` modificar archivos en `src/components/ui/`
- `NUNCA` usar colores hex hardcodeados en JSX/TSX — siempre CSS variables (`bg-[--bg]`, `text-[--text]`)
- `NUNCA` crear `tailwind.config.ts` — Tailwind v4 no lo usa
- Modo oscuro: el spec no define paleta dark para V1. Mantener el bloque `.dark` de shadcn con los overrides existentes (puede ignorarse en V1).

### Estructura de archivos de esta historia

```
public/
  fonts/
    TheGirlNextDoor-Regular.woff2    ← NEW
    TheGirlNextDoor-Regular.woff     ← NEW
    DMSans-Regular.woff2             ← NEW
    DMSans-Regular.woff              ← NEW
    DMSans-Medium.woff2              ← NEW
    DMSans-Medium.woff               ← NEW
    DMSans-Bold.woff2                ← NEW
    DMSans-Bold.woff                 ← NEW
src/
  styles/
    globals.css                      ← UPDATE (tokens + @font-face)
  app/
    layout.tsx                       ← UPDATE (localFont, metadata, lang)
    page.tsx                         ← UPDATE (reemplazar placeholder T3)
```

### Referencias

- [UX Design Specification — Sistema de Color](../planning-artifacts/ux-design-specification.md#sistema-de-color)
- [UX Design Specification — Sistema Tipográfico](../planning-artifacts/ux-design-specification.md#sistema-tipográfico)
- [Épicos — UX-DR1 a UX-DR5](../planning-artifacts/epics.md#ux-design-requirements)
- ARs cubiertos: AR12 (next-intl) no aplica en esta historia — los tokens de diseño son el objetivo

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- DM Sans v17 es una variable font: misma URL para pesos 400/500/700 en Google Fonts. Se descargó como `DMSans-Variable.woff2` con rango `weight: 100 900`. Configuración en layout.tsx adaptada respecto al ejemplo de la historia (que asumía archivos separados por peso).
- `@font-face` colocado después de los `@import` en globals.css para evitar conflictos de orden CSS (aunque los @import de Tailwind v4 son directivas PostCSS procesadas en build time).
- `--font-heading: var(--font-display)` en `@theme inline` para que la utilidad `font-heading` use The Girl Next Door en lugar de DM Sans.
- Build warning en `src/server/auth/config.ts` línea 22: eslint-disable innecesario. Es residual de Historia 0.1, no introducido en esta historia.

### Completion Notes List

- Fuentes descargadas directamente de Google Fonts CDN vía curl con user-agent Chrome. DM Sans v17 es variable font (un solo archivo cubre pesos 100-900).
- globals.css: shadcn tokens reemplazados con paleta Tinta y Lino en hex, tokens semánticos Artelier añadidos (`--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--text-light`, `--brand-accent`), 5 grupos de tokens de sellos.
- layout.tsx: Geist eliminado, `next/font/local` configurado para DM Sans (variable) y The Girl Next Door. metadata y lang="es" actualizados.
- page.tsx: placeholder T3 eliminado, reemplazado con placeholder mínimo usando tokens Tinta y Lino.
- `npm run build` pasa sin errores. Verificado: sin googleapis, tokens presentes en CSS generado, lang="es" y title "Artelier" en HTML.

### File List

- public/fonts/TheGirlNextDoor-Regular.woff2 (NEW)
- public/fonts/TheGirlNextDoor-Regular-ext.woff2 (NEW — latin-ext subset)
- public/fonts/DMSans-Variable.woff2 (NEW — variable font, cubre pesos 100-900)
- public/fonts/DMSans-Variable-ext.woff2 (NEW — latin-ext subset)
- src/styles/globals.css (UPDATE)
- src/app/layout.tsx (UPDATE)
- src/app/page.tsx (UPDATE)

### Change Log

- 2026-05-19: Historia 0.2 implementada — sistema de diseño Tinta y Lino completo

### Review Findings (AI) — 2026-05-19

- [x] [Review][Decision] `--accent` vs `--brand-accent`: AC1 requiere `--accent` #C4956A pero implementación usa `--brand-accent: #c4956a` y `--accent: #ddd7c8` para shadcn hover states. Dev notes justifican la solución pero hay conflicto literal con el texto del AC. → Decisión: mantener `--brand-accent` (opción A). El ámbar es `--brand-accent`; `--accent` queda para shadcn hover states.
- [x] [Review][Patch] Archivos -ext.woff2 descargados pero nunca referenciados [public/fonts/] → Eliminados DMSans-Variable-ext.woff2 y TheGirlNextDoor-Regular-ext.woff2
- [x] [Review][Defer] @font-face manual en globals.css funcionalmente inerte en runtime (next/font/local sobreescribe) pero requerido por AC2 — conflicto heredado del AC [src/styles/globals.css] — deferred, pre-existing
- [x] [Review][Defer] The Girl Next Door sin estilo italic — síntesis artificial del navegador [src/app/layout.tsx] — deferred, pre-existing
- [x] [Review][Defer] Tokens Artelier sin variante .dark — V1 no requiere paleta oscura per spec [src/styles/globals.css] — deferred, pre-existing
- [x] [Review][Defer] Cadena de fallback perdida cuando next/font/local sobreescribe --font-sans — V1 risk aceptable [src/app/layout.tsx] — deferred, pre-existing
- [x] [Review][Defer] --text-light (#8a8478) falla WCAG AA (2.8:1) — decisión de diseño del UX spec [src/styles/globals.css] — deferred, pre-existing
