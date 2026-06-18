//Endpoint de la API de Cloudinary para subir imágenes. Se espera un formulario con un campo "file" que contenga la imagen a subir, y un campo "type" que indique el tipo de imagen (avatar, banner, process o product). Solo se permiten imágenes JPEG, PNG, WebP o GIF de hasta 20 MB. El endpoint devuelve la URL segura y el public ID de la imagen subida, o un error si algo sale mal.

import { NextResponse } from "next/server"; //Importa la librería para construir y enviar la respuesta de la API en formato JSON.
import { getServerSession } from "~/server/auth/session"; //Importa la librería para validar que el usuario esté autenticado.
import { cloudinary } from "~/lib/cloudinary"; //Importa el cliente de Cloudinary.
import { env } from "~/env"; //Importa env.js para validar las variables de entorno.

//Se establecen los tipos de imágenes que se van a subir.
const ALLOWED_TYPES = ["avatar", "banner", "process", "product", "message"] as const;
type UploadType = (typeof ALLOWED_TYPES)[number];

//Se establece los tipos MIME de las imágenes soportados
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

//Se establecen las rutas en las que se guardarán las imágenes de Cloudinary dependiendo del tipo de imágen subido.
const FOLDER_MAP: Record<UploadType, string> = {
  avatar:   "artelier/avatars",
  banner:   "artelier/banners",
  process:  "artelier/process",
  product:  "artelier/products",
  message:  "artelier/messages",
};

//Se establecen los tipos de conversión de imágenes, dependiendo del tipo de imagen, antes de subirlas a Cloudinary.
const TRANSFORMATION_MAP: Record<UploadType, object[]> = {
  avatar:  [{ width: 400,  height: 400, crop: "fill",  quality: "auto", fetch_format: "auto" }],
  banner:  [{ width: 1200, height: 300, crop: "fill",  quality: "auto", fetch_format: "auto" }],
  process: [{ width: 1200,              crop: "limit", quality: "auto", fetch_format: "auto" }],
  product: [{ width: 1200,              crop: "limit", quality: "auto", fetch_format: "auto" }],
  message: [{ width: 1200,              crop: "limit", quality: "auto", fetch_format: "auto" }],
};

//Función POST para subir las imágenes
export async function POST(req: Request) {

  //Se comprueba que el usuario esté autenticado, sino se devuelve el mensaje de error correspondiente.
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para subir imágenes" } },
      { status: 401 },
    );
  }

  //Se comprueba que existan las credenciales de Cloudinary.
  if (!env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Servicio de imágenes no configurado" } },
      { status: 503 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const typeParam = formData.get("type") as string | null;

  //Se comprueba que exista un archivo de imagen que subir, sino lanza el mensaje correspondiente.
  if (!file) {
    return NextResponse.json(
      { error: { code: "MISSING_FILE", message: "No se proporcionó ningún archivo" } },
      { status: 400 },
    );
  }

  //Se comprueba que el archivo a subir sea de alguno de los tipos MIME soportados, sino se lanza el correspondiente mensaje de error.
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return NextResponse.json(
      { error: { code: "INVALID_FILE", message: "Solo se permiten imágenes JPEG, PNG, WebP o GIF" } },
      { status: 400 },
    );
  }

  //Se comprueba que el tipo de imagen subido sea de los tipos soportados, sino se lanza el correspondiente mensaje de error.
  if (!typeParam || !(ALLOWED_TYPES as readonly string[]).includes(typeParam)) {
    return NextResponse.json(
      { error: { code: "INVALID_TYPE", message: `Tipo de upload no válido: ${typeParam ?? "none"}` } },
      { status: 400 },
    );
  }

  //Se establece el tipo de imagen a subir
  const uploadType = typeParam as UploadType;

  //Se establece el tamaño máximo de imágenes subidas en el servicio de mensajes de la aplicación (de tipo message). Si se rebasa, lanza el mensaje de error correspondiente.
  const maxSize = uploadType === "message" ? 10 * 1024 * 1024 : 20 * 1024 * 1024;
  const maxLabel = uploadType === "message" ? "10 MB" : "20 MB";
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: `El archivo no puede superar ${maxLabel}` } },
      { status: 413 },
    );
  }

  //Se transforma el archivo a base64 (Cloudinary no acepta el archivo binario directamente, sino como texto).
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  let result;

  //Se intenta subir la imagen a CLoudinary pasándo la ruta donde va a alojarse (que depende del tipo de imagen) y la transformación que se aplica antes de guardarla.
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

  //Si se logra subir la imagen, se devuelve los parámteros de url y id de la imagen para que pueda ser usada en la aplicación.
  return NextResponse.json({
    data: { url: result.secure_url, publicId: result.public_id },
  });
}
