interface ArtelierLogoProps {
  width?: number;
  height?: number;
}

export default function ArtelierLogo({ width = 96, height = 56 }: ArtelierLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Artelier"
    >
      {/* Banderillas — rotadas para seguir la curvatura local del hilo */}
      <polygon
        points="5,20 21,20 13,36"
        fill="#3d5a4f"
        transform="rotate(26, 13, 20)"
      />
      <polygon
        points="22,25 38,25 30,41"
        fill="#c4956a"
        transform="rotate(9, 30, 25)"
      />
      <polygon
        points="42,25 58,25 50,41"
        fill="#3d5a4f"
        opacity="0.55"
        transform="rotate(-9, 50, 25)"
      />
      <polygon
        points="59,20 75,20 67,36"
        fill="#3d5a4f"
        transform="rotate(-26, 67, 20)"
      />

      {/* Hilo encima — cruza los bordes superiores de las banderillas */}
      <path
        d="M 2 12 C 22 30, 58 30, 78 12"
        stroke="#3d5a4f"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
