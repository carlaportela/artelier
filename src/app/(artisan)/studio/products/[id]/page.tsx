//Página de edición de un producto del studio de la artesana.
//Server Component: verifica sesión, carga el producto con sus sellos y pedidos activos.
//Si el producto no existe o no es de la artesana, redirige silenciosamente a /studio/products.

import { redirect } from "next/navigation";

import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";
import EditProductForm from "./EditProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const session = await requireArtisanSession();

  const product = await db.product.findUnique({
    where: { id, deletedAt: null },
    include: {
      seals: {
        include: { seal: { select: { id: true, name: true } } },
      },
      orders: {
        where: {
          status: { in: ["CONFIRMED", "IN_PREPARATION", "READY", "SHIPPED"] },
        },
        select: { id: true },
      },
    },
  });

  //Ownership check — redirige sin exponer si el producto existe o no.
  if (product?.artisanId !== session.user.id) {
    redirect("/studio/products");
  }

  const hasActiveOrders = product.orders.length > 0;

  //Los sellos son read-only — asignados por el sistema, no por la artesana.
  const seals = product.seals.map((ps) => ps.seal);

  return (
    <EditProductForm
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        priceInCents: product.priceInCents,
        type: product.type,
        status: product.status,
        imageUrls: product.imageUrls,
        category: product.category,
        expiresAt: product.expiresAt ? product.expiresAt.toISOString().slice(0, 10) : undefined,
      }}
      seals={seals}
      hasActiveOrders={hasActiveOrders}
    />
  );
}
