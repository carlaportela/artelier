//Lógica de negocio compartida sobre pedidos, reutilizada por los endpoints de cancelación/rechazo
//(comprador, artesana, y el cron de cancelación automática).

interface ReactivatableProduct {
  type: string;
  expiresAt: Date | null;
}

//Un producto puede reactivarse (volver a "ACTIVE") tras cancelar un pedido salvo que sea perecedero
//y su fecha límite ya haya pasado.
export function canReactivateProduct(product: ReactivatableProduct): boolean {
  return (
    product.type !== "PERISHABLE" ||
    !product.expiresAt ||
    product.expiresAt > new Date()
  );
}
