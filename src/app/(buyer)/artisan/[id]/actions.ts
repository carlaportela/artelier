//Server actions para el perfil público de la artesana — acciones de la compradora.

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import { sendNewFollowerEmail } from "~/lib/resend";

// ─── Seguir / Dejar de seguir ────────────────────────────────────────────────

export async function followArtisan(artisanId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  await db.follow.create({
    data: { followerId: session.user.id, followingId: artisanId },
  });

  //Se avisa a la artesana de la nueva seguidora, sin bloquear la respuesta al comprador.
  void sendNewFollowerEmail(session.user.id, artisanId).catch(console.error);

  revalidatePath(`/artisan/${artisanId}`);
  return { success: true } as const;
}

export async function unfollowArtisan(artisanId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  await db.follow.delete({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: artisanId,
      },
    },
  });

  revalidatePath(`/artisan/${artisanId}`);
  return { success: true } as const;
}

// ─── Encargo personalizado ────────────────────────────────────────────────────

const submitSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Describe el encargo con al menos 10 caracteres")
    .max(500, "La descripción no puede superar 500 caracteres"),
  budgetInCents: z.number().int().positive("El presupuesto debe ser mayor que 0").optional(),
});

//Envía una solicitud de encargo personalizado a una artesana.
//Solo compradoras autenticadas pueden enviar solicitudes.
export async function submitCustomOrderRequest(artisanId: string, data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "BUYER") return { error: { code: "FORBIDDEN" as const } };

  //Verificar que la artesana existe y está activa.
  const artisan = await db.user.findFirst({
    where: { id: artisanId, role: "ARTISAN", deletedAt: null, suspended: false },
    select: { id: true },
  });
  if (!artisan) return { error: { code: "NOT_FOUND" as const } };

  const parsed = submitSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  try {
    await db.customOrderRequest.create({
      data: {
        buyerId: session.user.id,
        artisanId,
        description: parsed.data.description,
        budgetInCents: parsed.data.budgetInCents,
      },
    });
  } catch {
    return { error: { code: "DB_ERROR" as const } };
  }

  return { success: true as const };
}
