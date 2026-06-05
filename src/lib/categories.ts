//Lista de categorías de productos

export const CATEGORIES = [
  "Joyería y bisutería",
  "Cerámica y alfarería",
  "Textil y costura",
  "Madera",
  "Papel y encuadernación",
  "Pintura y dibujo",
  "Fotografía",
  "Alimentación",
  "Perfumería y cosmética natural",
  "Otros",
] as const;

export const PERISHABLE_CATEGORIES: readonly string[] = [
  "Alimentación",
  "Perfumería y cosmética natural",
];
