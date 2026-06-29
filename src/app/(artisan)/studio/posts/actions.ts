"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "~/server/db";
import { requireArtisanSession } from "~/server/auth/guards";

const schema = z.object({
  content: z.string().trim().min(1, "El texto no puede estar vacío").max(500),
  imageUrl: z.string().min(1, "La imagen es obligatoria"),
});

export async function createPublicacion(data: unknown) {
  const session = await requireArtisanSession();

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.processUpdate.create({
    data: {
      artisanId: session.user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
    },
  });

  revalidatePath("/studio/posts");
}

export async function updatePublicacion(id: string, data: unknown) {
  const session = await requireArtisanSession();

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.processUpdate.updateMany({
    where: { id, artisanId: session.user.id },
    data: {
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
    },
  });

  revalidatePath("/studio/posts");
}

export async function deletePublicacion(id: string) {
  const session = await requireArtisanSession();

  await db.processUpdate.updateMany({
    where: { id, artisanId: session.user.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/studio/posts");
}
