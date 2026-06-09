// Avatar con forma de galleta (cookie) — círculo interior + 10 bumps exteriores.
// Muestra la foto de perfil recortada con esa forma, o la inicial del nombre sobre fondo de color.

"use client";

import { useId } from "react";

// ─── Parámetros de la forma (viewBox 24×24) ───────────────────────────────────
// Círculo interior: r=9.0 | 10 bumps de r=3.0 a R=9.0 del centro, cada 36°
// BUMP_R=3.0 garantiza que bumps adyacentes se solapen (sin costuras visibles)
const COOKIE_R = 9.0;
const BUMP_R   = 3.0;
const BUMPS = Array.from({ length: 10 }, (_, i) => {
  const a = (i * 2 * Math.PI) / 10;
  return {
    cx: parseFloat((12 + COOKIE_R * Math.cos(a)).toFixed(2)),
    cy: parseFloat((12 + COOKIE_R * Math.sin(a)).toFixed(2)),
  };
});

// Versión ampliada para el anillo de separación (plain={false}, sobre banners)
const RING_R      = 9.7;
const RING_BUMP_R = 3.7;

interface Props {
  src: string | null;
  name: string | null;
  className?: string;
  fillColor?: string;
  /** Sin anillo — usar en superficies planas; activar con false solo sobre banners */
  plain?: boolean;
}

export default function PaletteAvatar({
  src,
  name,
  className = "h-20 w-20",
  fillColor = "#4a9e8c",
  plain = true,
}: Props) {
  const uid    = useId().replace(/:/g, "");
  const clipId = `cookie-${uid}`;
  const initial = name?.charAt(0).toUpperCase() ?? "A";

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={name ?? "Avatar"}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r={COOKIE_R} />
          {BUMPS.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={BUMP_R} />
          ))}
        </clipPath>
      </defs>

      {/* Anillo en el color de fondo de la app para separar el avatar del banner */}
      {!plain && (
        <>
          <circle cx="12" cy="12" r={RING_R} fill="#f4f0e8" />
          {BUMPS.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={RING_BUMP_R} fill="#f4f0e8" />
          ))}
        </>
      )}

      {src ? (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — <image> SVG válido; @types/react no lo cubre completamente
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
        <g clipPath={`url(#${clipId})`}>
          <rect width="24" height="24" fill={fillColor} />
          <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="7"
            fontFamily="The Girl Next Door, cursive"
          >
            {initial}
          </text>
        </g>
      )}
    </svg>
  );
}
