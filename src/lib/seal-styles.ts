//Clases de estilo de los sellos verificados — un color pastel por tipo, declarado en globals.css.
//Fuente única: cualquier componente que muestre un sello lee este mapa por su `type`
//("mano", "eco", "reciclado", "galicia", "km0"), nunca declara su propio objeto de clases.
export const SEAL_CLASS: Record<string, string> = {
  mano: "seal-mano",
  eco: "seal-eco",
  reciclado: "seal-reciclado",
  galicia: "seal-galicia",
  km0: "seal-km0",
};

//Para un type que no esté en el mapa (no debería ocurrir con los datos actuales).
export const SEAL_FALLBACK_CLASS = "bg-card text-muted-foreground";
