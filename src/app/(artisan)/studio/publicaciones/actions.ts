"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "~/server/db";
import { getServerSession } from "~/server/auth/session";

const schema = z.object({
  content: z.string().trim().min(1, "El texto no puede estar vacío").max(500),
  imageUrl: z.string().min(1, "La imagen es obligatoria"),
});

export async function createPublicacion(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.processUpdate.create({
    data: {
      artisanId: session.user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
    },
  });

  revalidatePath("/studio/publicaciones");
}

export async function updatePublicacion(id: string, data: unknown) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.processUpdate.updateMany({
    where: { id, artisanId: session.user.id },
    data: {
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
    },
  });

  revalidatePath("/studio/publicaciones");
}

export async function deletePublicacion(id: string) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  await db.processUpdate.updateMany({
    where: { id, artisanId: session.user.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/studio/publicaciones");
}
