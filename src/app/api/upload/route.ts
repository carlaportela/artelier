import { NextResponse } from "next/server";

import { cloudinary } from "~/lib/cloudinary";
import { env } from "~/env";

export async function POST(req: Request) {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Servicio de imágenes no configurado" } },
      { status: 503 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  let result;
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: "artelier",
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
