"use server";

import { revalidatePath } from "next/cache";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function followArtisan(artisanId: string) {
  const session = await auth();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  await db.follow.create({
    data: { followerId: session.user.id, followingId: artisanId },
  });

  revalidatePath(`/artisan/${artisanId}`);
  return { success: true } as const;
}

export async function unfollowArtisan(artisanId: string) {
  const session = await auth();
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
