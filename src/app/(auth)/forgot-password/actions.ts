"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { resend, FROM_EMAIL } from "~/lib/resend";
import PasswordResetEmail from "~/lib/emails/PasswordResetEmail";

const forgotPasswordSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
});

const GENERIC_RESPONSE = { success: true } as const;

export async function requestPasswordReset(data: unknown) {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return GENERIC_RESPONSE;
  }

  const { email } = parsed.data;

  const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

  if (user) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({ where: { identifier: email } });
      await tx.verificationToken.create({
        data: { identifier: email, token, expires },
      });
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Recupera tu contraseña — Artelier",
        react: PasswordResetEmail({ resetUrl, name: user.name }),
      });
    } catch (err) {
      console.error("[Artelier] Error enviando email de recuperación:", err);
    }
  }

  // Siempre retornar la misma respuesta — no revelar si el email existe
  return GENERIC_RESPONSE;
}
