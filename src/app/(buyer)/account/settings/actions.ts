"use server";

import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/server/db";
import { getServerSession } from "~/server/auth/session";
import { renderToBuffer } from "@react-pdf/renderer";
import { resend, FROM_EMAIL } from "~/lib/resend";
import { changePasswordSchema, deleteAccountSchema } from "~/lib/validations/auth";
import { DataExportEmail } from "~/lib/resend/DataExportEmail";
import { DataExportPdf } from "~/lib/pdf/DataExportPdf";

export async function changePassword(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR" as const, fields: parsed.error.flatten().fieldErrors } };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) return { error: { code: "UNAUTHORIZED" as const } };

  const valid = await compare(parsed.data.currentPassword, user.password);
  if (!valid) return { error: { code: "WRONG_PASSWORD" as const } };

  const hashed = await hash(parsed.data.newPassword, 12);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });
    await tx.session.deleteMany({
      where: {
        userId: session.user.id,
        NOT: { sessionToken: session.sessionToken },
      },
    });
  });

  return { success: true };
}

export async function deleteAccount(data: unknown) {
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };

  const parsed = deleteAccountSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR" as const, fields: parsed.error.flatten().fieldErrors } };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) return { error: { code: "UNAUTHORIZED" as const } };

  const valid = await compare(parsed.data.password, user.password);
  if (!valid) return { error: { code: "WRONG_PASSWORD" as const } };

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        name: null,
        email: `deleted_${session.user.id}@artelier.deleted`,
        image: null,
        bannerImage: null,
        bio: null,
        password: null,
        deletedAt: new Date(),
      },
    });
    await tx.session.deleteMany({ where: { userId: session.user.id } });
  });

  const isProduction = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.delete(isProduction ? "__Secure-authjs.session-token" : "authjs.session-token");

  redirect("/");
}

export async function requestDataExport() {
  const session = await getServerSession();
  if (!session?.user?.email) return { error: { code: "UNAUTHORIZED" as const } };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      locality: true,
      bio: true,
      createdAt: true,
      buyerOrders: {
        where: { deletedAt: null },
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalInCents: true,
          product: { select: { name: true } },
          artisan: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return { error: { code: "UNAUTHORIZED" as const } };

  const pdfBuffer = await renderToBuffer(
    DataExportPdf({
      name: user.name,
      email: session.user.email,
      locality: user.locality,
      bio: user.bio,
      createdAt: user.createdAt,
      orders: user.buyerOrders,
      generatedAt: new Date(),
    })
  );

  const { error: emailError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: session.user.email,
    subject: "Tus datos de Artelier",
    react: DataExportEmail({ name: session.user.name }),
    attachments: [
      {
        filename: "mis-datos-artelier.pdf",
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (emailError) {
    console.error("[requestDataExport] Resend error:", emailError);
    return { error: { code: "EMAIL_ERROR" as const } };
  }

  return { success: true };
}
