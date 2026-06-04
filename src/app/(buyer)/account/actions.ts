"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";

const accountSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().trim().optional(),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
  image: z.string().optional(),
  street: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
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

  const { name, lastName, locality, image, street, postalCode, city, province } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      lastName: lastName ?? null,
      locality,
      ...(image !== undefined && { image }),
      street: street ?? null,
      postalCode: postalCode ?? null,
      city: city ?? null,
      province: province ?? null,
    },
  });

  revalidatePath("/account");
  revalidatePath("/", "layout");

  return { success: true } as const;
}

/** Guarda solo la foto de perfil de forma inmediata, sin esperar al submit del formulario. */
export async function saveProfileImage(imageUrl: string | null) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  await db.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl ?? null },
  });

  revalidatePath("/account");
  revalidatePath("/", "layout");

  return { success: true } as const;
}
