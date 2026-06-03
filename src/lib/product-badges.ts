// Helper centralizado para labels y clases CSS de los badges de estado de producto.
// Usado en ProductCard, CatalogoView (studio) y ArtisanProfileTabs (perfil público).

type Status = "ACTIVE" | "SOLD" | "EXPIRED";

interface Badge {
  label: string;
  className: string;
}

/**
 * Devuelve el badge apropiado según el estado y si el producto es perecedero.
 * - ACTIVE + expiresAt  → "Por tiempo limitado" (ámbar)
 * - ACTIVE sin expiresAt → null (no se muestra badge)
 * - SOLD                → "Vendido" (gris oscuro casi negro)
 * - EXPIRED             → "No disponible" (gris oscuro)
 *
 * @param variant "overlay" para fondos semi-transparentes (sobre imagen),
 *                "solid"   para fondos sólidos (vista lista)
 */
export function getProductBadge(
  status: Status,
  expiresAt: Date | null,
  variant: "overlay" | "solid" = "overlay",
): Badge | null {
  if (status === "ACTIVE" && expiresAt) {
    return {
      label: "Por tiempo limitado",
      className: variant === "overlay" ? "bg-[#c4956a]/90 text-white" : "bg-[#c4956a] text-white",
    };
  }
  if (status === "ACTIVE") return null;
  if (status === "SOLD") {
    return {
      label: "Vendido",
      className: "bg-gray-900/65 text-white",
    };
  }
  // EXPIRED
  return {
    label: "No disponible",
    className: variant === "overlay" ? "bg-gray-700/80 text-white" : "bg-gray-700 text-white",
  };
}
