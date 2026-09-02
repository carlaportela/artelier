//Lógica de negocio compartida sobre pedidos, reutilizada por los endpoints de cancelación/rechazo
//(comprador, artesana, y el cron de cancelación automática).

import { db } from "~/server/db";
import type { CancelledBy } from "generated/prisma";

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

interface ClaimAndCancelOrderParams {
  orderId: string;
  cancellationReason: string;
  cancelledBy: CancelledBy;
  product: ReactivatableProduct;
  productId: string;
  //Solo lo indica el cron de cancelación automática — el rechazo voluntario de la artesana no penaliza.
  penalty?: { artisanId: string; amountCents: number };
}

//Reclama atómicamente un pedido CONFIRMED (lo cancela) y, en la misma transacción, reactiva el
//producto si procede y aplica la penalización si se indica. El "where" del updateMany exige que el
//pedido siga en CONFIRMED en el momento exacto de la escritura, para no pisar una decisión
//concurrente (aceptación de la artesana, u otra cancelación) que haya ocurrido justo antes. Al ir
//todas las escrituras en la misma transacción, nunca queda el pedido cancelado sin que el producto
//se reactive o la penalización se aplique (o viceversa) si algo falla a medias.
//Devuelve true si este llamador reclamó el pedido (y por tanto debe proceder con el reembolso de
//Stripe), false si ya lo había procesado otra petición.
export async function claimAndCancelOrder({
  orderId,
  cancellationReason,
  cancelledBy,
  product,
  productId,
  penalty,
}: ClaimAndCancelOrderParams): Promise<boolean> {
  const claimedCount = await db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: "CONFIRMED" },
      data: { status: "CANCELLED", cancellationReason, cancelledBy },
    });
    if (claimed.count === 0) {
      return 0;
    }
    if (canReactivateProduct(product)) {
      await tx.product.update({
        where: { id: productId },
        data: { status: "ACTIVE" },
      });
    }
    if (penalty) {
      await tx.user.update({
        where: { id: penalty.artisanId },
        data: { pendingPenaltyInCents: { increment: penalty.amountCents } },
      });
    }
    return claimed.count;
  });
  return claimedCount > 0;
}
