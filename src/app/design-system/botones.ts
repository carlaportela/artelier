//Las cuatro clases de la convención de botones de Artelier, tal y como se escriben hoy en la app.
//Esta es la fuente a copiar: si necesitas un botón, cópialo de aquí y no de la pantalla que
//tengas más a mano — copiar de la pantalla de al lado es exactamente cómo aparecen cuatro
//opacidades distintas de hover gris.
//
//Vive en su propio fichero (sin JSX ni imports) para que lo puedan usar tanto las secciones
//de servidor como las de cliente sin arrastrar componentes de un lado al otro.

export const BOTON = {
  primario:
    "cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60",
  secundario:
    "cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-2 text-sm text-foreground transition-colors hover:bg-[#ccc8bc] disabled:cursor-not-allowed disabled:opacity-60",
  peligro:
    "cursor-pointer rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50",
  peligroSolido:
    "cursor-pointer rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50",
  acento:
    "cursor-pointer rounded-full bg-[#c4956a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d4a57a] disabled:cursor-not-allowed disabled:opacity-60",
} as const;
