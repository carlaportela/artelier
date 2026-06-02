//Componente de sello verificado. Existen dos tipos de sellos: asignados automáticamente por el sistema y verificados por el admin a petición de la artesana.
//Se usa tanto en tarjetas de producto como en la página de edición y en el perfil de artesana.

interface SealBadgeProps {
  name: string;
  className?: string;
}

export function SealBadge({ name, className }: SealBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#c4956a] px-2 py-0.5 font-display text-[10px] font-medium text-white ${className ?? ""}`}
    >
      {name}
    </span>
  );
}
