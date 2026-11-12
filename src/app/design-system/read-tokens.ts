//Lee los valores reales de globals.css en el servidor, para que el hex mostrado junto a
//cada swatch nunca se desactualice — escribirlo a mano es justo el problema que esta hoja
//existe para evitar (el cuadrado de color ya lee var(--token) en el navegador; esto hace
//que el texto de al lado también sea en vivo, en vez de una copia que alguien se olvida
//de actualizar).
//
//Se relee en cada llamada: el fichero pesa unos pocos KB y así un cambio en globals.css se
//refleja también en desarrollo, sin reiniciar el servidor — cachearlo sería reintroducir la
//misma clase de desfase que esto corrige.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function getRootTokens(): Record<string, string> {
  const css = readFileSync(
    join(process.cwd(), "src/styles/globals.css"),
    "utf-8",
  );

  //El único bloque :root del fichero es donde se declaran los valores reales.
  const body = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";

  const tokens: Record<string, string> = {};
  for (const m of body.matchAll(/(--[a-zA-Z0-9-]+):\s*([^;]+);/g)) {
    const [, name, value] = m;
    if (name && value) tokens[name] = value.trim();
  }
  return tokens;
}
