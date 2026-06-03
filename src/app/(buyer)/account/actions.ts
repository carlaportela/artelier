"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

const accountSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
  image: z.string().optional(),
});

export async function saveAccount(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { name, locality, image } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: { name, locality, ...(image !== undefined && { image }) },
  });

  revalidatePath("/account");
  revalidatePath("/", "layout"); // refresca AppHeader (imagen en nav)

  return { success: true } as const;
}
