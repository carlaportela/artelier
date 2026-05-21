import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { cloudinary } from "~/lib/cloudinary";
import { env } from "~/env";

const ALLOWED_TYPES = ["avatar", "banner", "process", "product"] as const;
type UploadType = (typeof ALLOWED_TYPES)[number];

function folderForType(type: UploadType): string {
  return `artelier/${type}s`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para subir imágenes" } },
      { status: 401 },
    );
  }

  if (!env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Servicio de imágenes no configurado" } },
      { status: 503 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const typeParam = formData.get("type") as string | null;

  if (!file) {
    return NextResponse.json(
      { error: { code: "MISSING_FILE", message: "No se proporcionó ningún archivo" } },
      { status: 400 },
    );
  }

  if (!file.type) {
    return NextResponse.json(
      { error: { code: "INVALID_FILE", message: "El archivo no tiene un tipo MIME válido" } },
      { status: 400 },
    );
  }

  const uploadType: UploadType =
    typeParam && (ALLOWED_TYPES as readonly string[]).includes(typeParam)
      ? (typeParam as UploadType)
      : "product";

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  let result;
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: folderForType(uploadType),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: "Error al subir la imagen" } },
      { status: 502 },
    );
  }

  return NextResponse.json({
    data: { url: result.secure_url, publicId: result.public_id },
  });
}
