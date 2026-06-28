//Server actions para editar y eliminar un producto del studio de la artesana.
//Todas las mutaciones verifican sesión, rol y ownership antes de actuar.
//NUNCA se borra físicamente — siempre soft-delete con deletedAt.

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireArtisanSession } from "~/server/auth/guards";
import { db } from "~/server/db";

//Estados de pedido que bloquean la edición/eliminación del producto.
const BLOCKING_ORDER_STATUSES = [
  "CONFIRMED",
  "IN_PREPARATION",
  "READY",
  "SHIPPED",
] as const;

//Schema compartido entre updateProduct y la validación del formulario.
const updateProductSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
    description: z
      .string()
      .trim()
      .max(280, "La descripción no puede superar 280 caracteres"),
    priceInCents: z
      .number()
      .int()
      .min(1, "El precio debe ser mayor que 0")
      .max(2_147_483_647, "El precio introducido es demasiado alto"),
    type: z.enum(["UNIQUE", "PERISHABLE", "STANDARD"]),
    imageUrls: z
      .array(z.string().url())
      .min(1, "Añade al menos una imagen")
      .max(6, "Máximo 6 imágenes"),
    category: z.string().trim().min(1, "Selecciona una categoría"),
    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
      .optional(),
  })
  //Validaciones cruzadas: expiresAt solo es válido para productos perecederos y viceversa.
  .superRefine((data, ctx) => {
    if (data.type === "PERISHABLE" && !data.expiresAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de caducidad es obligatoria para productos perecederos",
        path: ["expiresAt"],
      });
    }
    if (data.type !== "PERISHABLE" && data.expiresAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Solo los productos perecederos pueden tener fecha de caducidad",
        path: ["expiresAt"],
      });
    }
  });

//Helper: carga el producto con ownership y pedidos activos.
//Devuelve null si no existe o está soft-deleted.
async function loadProduct(productId: string) {
  return db.product.findUnique({
    where: { id: productId, deletedAt: null },
    select: {
      artisanId: true,
      orders: {
        where: { status: { in: [...BLOCKING_ORDER_STATUSES] } },
        select: { id: true },
      },
    },
  });
}

//Actualiza los datos editables de un producto (nombre, descripción, precio, tipo, fotos, categoría, expiresAt).
//Bloquea la edición si hay pedidos activos en curso.
export async function updateProduct(productId: string, data: unknown) {
  const session = await requireArtisanSession();

  const product = await loadProduct(productId);
  if (!product) return { error: { code: "NOT_FOUND" as const } };
  if (product.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (product.orders.length > 0) return { error: { code: "HAS_ACTIVE_ORDERS" as const } };

  const parsed = updateProductSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { expiresAt, ...rest } = parsed.data;

  try {
    await db.product.update({
      where: { id: productId },
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt + "T12:00:00") : null,
      },
    });
  } catch {
    return { error: { code: "DB_ERROR" as const } };
  }

  revalidatePath(`/studio/products/${productId}`);
  revalidatePath("/studio/products");
  revalidatePath(`/artisan/${session.user.id}`);

  return { success: true as const };
}

//Soft-delete del producto: establece deletedAt en la fecha actual.
//Bloquea la eliminación si hay pedidos activos en curso.
export async function deleteProduct(productId: string) {
  const session = await requireArtisanSession();

  const product = await loadProduct(productId);
  if (!product) return { error: { code: "NOT_FOUND" as const } };
  if (product.artisanId !== session.user.id) return { error: { code: "FORBIDDEN" as const } };
  if (product.orders.length > 0) return { error: { code: "HAS_ACTIVE_ORDERS" as const } };

  try {
    await db.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });
  } catch {
    return { error: { code: "DB_ERROR" as const } };
  }

  revalidatePath("/studio/products");
  revalidatePath(`/artisan/${session.user.id}`);

  return { success: true as const };
  // El componente cliente redirige a /studio/products tras recibir success.
}
