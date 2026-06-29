"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";

const profileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().trim().max(150, "La bio no puede superar 150 caracteres").optional().or(z.literal("")),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
  image: z.string().url().optional().or(z.literal("")),
  bannerImage: z.string().url().optional().or(z.literal("")),
});

const processUpdateSchema = z.object({
  content: z.string().trim().min(1, "El contenido no puede estar vacío").max(500, "Máximo 500 caracteres"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

// Guarda solo los campos de texto del perfil (nombre, bio, localidad) sin tocar las imágenes
export async function saveProfileInfo(data: unknown) {
  const session = await requireArtisanSession();

  const schema = z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
    bio: z.string().trim().max(150, "La bio no puede superar 150 caracteres").optional().or(z.literal("")),
    locality: z.string().trim().min(2, "Introduce tu localidad"),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { name, bio, locality } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: { name, bio: bio ?? null, locality },
  });

  revalidatePath(`/artisan/${session.user.id}`);
  revalidatePath("/studio/profile");

  return { success: true } as const;
}

export async function saveProfile(data: unknown) {
  const session = await requireArtisanSession();

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { name, bio, locality, image, bannerImage } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio: bio ?? null,
      locality,
      image: image?.length ? image : null,
      bannerImage: bannerImage?.length ? bannerImage : null,
    },
  });

  revalidatePath(`/artisan/${session.user.id}`);

  return { success: true } as const;
}

export async function createProcessUpdate(data: unknown) {
  const session = await requireArtisanSession();

  const parsed = processUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { content, imageUrl } = parsed.data;

  await db.processUpdate.create({
    data: {
      artisanId: session.user.id,
      content,
      imageUrl: imageUrl ?? null,
    },
  });

  revalidatePath(`/artisan/${session.user.id}`);

  return { success: true } as const;
}
