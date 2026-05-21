"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "~/server/db";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function resetPassword(data: unknown) {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { token, password } = parsed.data;

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return {
      error: {
        code: "INVALID_TOKEN" as const,
      },
    };
  }

  const hashedPassword = await hash(password, 12);

  await db.$transaction([
    db.session.deleteMany({ where: { user: { email: verificationToken.identifier } } }),
    db.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  redirect("/login");
}
