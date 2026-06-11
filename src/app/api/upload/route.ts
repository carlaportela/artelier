//Página de la API para subir imágenes a Cloudinary. Se espera un formulario con un campo "file" que contenga la imagen a subir, y un campo "type" que indique el tipo de imagen (avatar, banner, process o product). Solo se permiten imágenes JPEG, PNG, WebP o GIF de hasta 20 MB. El endpoint devuelve la URL segura y el public ID de la imagen subida, o un error si algo sale mal.

import { NextResponse } from "next/server";

import { getServerSession } from "~/server/auth/session";
import { cloudinary } from "~/lib/cloudinary";
import { env } from "~/env";

const ALLOWED_TYPES = ["avatar", "banner", "process", "product", "message"] as const;
type UploadType = (typeof ALLOWED_TYPES)[number];

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const FOLDER_MAP: Record<UploadType, string> = {
  avatar:   "artelier/avatars",
  banner:   "artelier/banners",
  process:  "artelier/process",
  product:  "artelier/products",
  message:  "artelier/messages",
};

const TRANSFORMATION_MAP: Record<UploadType, object[]> = {
  avatar:  [{ width: 400,  height: 400, crop: "fill",  quality: "auto", fetch_format: "auto" }],
  banner:  [{ width: 1200, height: 300, crop: "fill",  quality: "auto", fetch_format: "auto" }],
  process: [{ width: 1200,              crop: "limit", quality: "auto", fetch_format: "auto" }],
  product: [{ width: 1200,              crop: "limit", quality: "auto", fetch_format: "auto" }],
  message: [{ width: 1200,              crop: "limit", quality: "auto", fetch_format: "auto" }],
};

export async function POST(req: Request) {
  const session = await getServerSession();
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

  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return NextResponse.json(
      { error: { code: "INVALID_FILE", message: "Solo se permiten imágenes JPEG, PNG, WebP o GIF" } },
      { status: 400 },
    );
  }

  if (!typeParam || !(ALLOWED_TYPES as readonly string[]).includes(typeParam)) {
    return NextResponse.json(
      { error: { code: "INVALID_TYPE", message: `Tipo de upload no válido: ${typeParam ?? "none"}` } },
      { status: 400 },
    );
  }
  const uploadType = typeParam as UploadType;

  const maxSize = uploadType === "message" ? 10 * 1024 * 1024 : 20 * 1024 * 1024;
  const maxLabel = uploadType === "message" ? "10 MB" : "20 MB";
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: `El archivo no puede superar ${maxLabel}` } },
      { status: 413 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  let result;
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: FOLDER_MAP[uploadType],
      transformation: TRANSFORMATION_MAP[uploadType],
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
