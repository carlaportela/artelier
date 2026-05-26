//Avatar con forma de paleta de pintor, que muestra la foto recortada o la inicial del nombre si no hay foto. Incluye un borde alrededor para separarlo visualmente del banner.

"use client";//Se renderiza en cliente

import { useId } from "react";

//Variable con el path del SVG de la paleta, reutilizado para el clipPath, el fondo de color y el borde. Permite que la sombra siga la forma exacta de la plaeta.
const PATH =
  "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z";

interface Props {
  src: string | null;
  name: string | null;
  className?: string;
  fillColor?: string;
}

/**
 * Avatar con forma de paleta de pintor.
 * - Anillo blanco alrededor de la silueta para separarlo visualmente del banner.
 * - Sombra drop-shadow que sigue la forma irregular exacta.
 * - Con foto: recorta la imagen con la forma de paleta.
 * - Sin foto: muestra la paleta rellena con la inicial del nombre.
 */
export default function PaletteAvatar({
  src,
  name,
  className = "h-20 w-20",
  fillColor = "#94a49e",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const clipId = `palette-${uid}`;
  const initial = name?.charAt(0).toUpperCase() ?? "A";

  return (
    <svg
      viewBox="0 0 24 24"
      className={`palette-avatar ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={name ?? "Artesana"}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={PATH} />
        </clipPath>
      </defs>

      {/* Anillo color fondo app: separa el avatar del banner sin añadir color extra */}
      <path d={PATH} fill="#f4f0e8" stroke="#f4f0e8" strokeWidth="1.4" />

      {src ? ( //Si existe src, muestra la foto recortada; si no, muestra la paleta con la inicial.
        /* Foto recortada con la forma de paleta, encima del anillo blanco */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — <image> SVG válido; @types/react no cubre todos sus atributos
        <image
          href={src}
          x="0"
          y="0"
          width="24"
          height="24"
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        /* Paleta rellena con inicial, encima del anillo blanco */
        <>
          <path d={PATH} fill={fillColor} />
          <text
            x="12"
            y="11"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="7"
            fontFamily="The Girl Next Door, cursive"
          >
            {initial}
          </text>
        </>
      )}
    </svg>
  );
}
