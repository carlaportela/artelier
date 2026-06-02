//Server actions para gestión de encargos personalizados desde el studio de la artesana.
//Solo la artesana propietaria puede aceptar o rechazar sus propias solicitudes.

"use server";

import { revalidatePath } from "next/cache";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

//Acepta un encargo personalizado: cambia status a ACCEPTED y crea/reutiliza una Conversation.
//La transacción garantiza que ambas operaciones son atómicas.
export async function acceptCustomOrder(requestId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  const request = await db.customOrderRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    select: { artisanId: true, buyerId: true, status: true },
  });
  if (!request) return { error: { code: "NOT_FOUND" as const } };
  if (request.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (request.status !== "PENDING") return { error: { code: "ALREADY_PROCESSED" as const } };

  try {
    await db.$transaction([
      db.customOrderRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
      db.conversation.upsert({
        where: {
          buyerId_artisanId: {
            buyerId: request.buyerId,
            artisanId: session.user.id,
          },
        },
        create: { buyerId: request.buyerId, artisanId: session.user.id },
        update: {},
      }),
    ]);
  } catch {
    return { error: { code: "DB_ERROR" as const } };
  }

  revalidatePath("/studio/pedidos");
  return { success: true as const };
}

//Rechaza un encargo personalizado: cambia status a REJECTED.
//La solicitud permanece en BD como histórico pero deja de aparecer en la lista de pendientes.
export async function rejectCustomOrder(requestId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  const request = await db.customOrderRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    select: { artisanId: true, status: true },
  });
  if (!request) return { error: { code: "NOT_FOUND" as const } };
  if (request.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (request.status !== "PENDING") return { error: { code: "ALREADY_PROCESSED" as const } };

  try {
    await db.customOrderRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
  } catch {
    return { error: { code: "DB_ERROR" as const } };
  }

  revalidatePath("/studio/pedidos");
  return { success: true as const };
}
