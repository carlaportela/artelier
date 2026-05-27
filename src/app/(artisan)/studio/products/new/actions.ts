//Este archivo contiene la lógica del servidor para crear un nuevo producto desde la página del artesano (studio)

"use server"; //Este archivo se ejecita en el servidor.

import { revalidatePath } from "next/cache"; //Función de Next.js para revalidar la caché de una ruta específica después de crear un producto nuevo.
import { z } from "zod"; //Zos es un biblioteca de validación de esquemas para Typescript, que se utiliza para definir y validar la estructura de datos del producto que se va a crear.

import { getServerSession } from "~/server/auth/session"; //Función personalizada para obtener la sesión del usuario en el servidor, verificar si el usuario está autenticado y tiene rol de artesano para permitir la creación de productos.
import { db } from "~/server/db";

//Definición del esquema de validación de Zod para los datos del producto que se va a crear. Si los datos no cumplen este esquema, se devuelve error de validación con detalles de los campos que fallaron.
const createProductSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().trim().max(280, "La descripción no puede superar 280 caracteres"),
  priceInCents: z.number().int().min(1, "El precio debe ser mayor que 0"),
  type: z.enum(["UNIQUE", "PERISHABLE", "STANDARD"]),
  imageUrls: z.array(z.string().url()).min(1, "Añade al menos una imagen").max(7, "Máximo 7 imágenes"),
  category: z.string().trim().min(1, "Selecciona una categoría"),
  expiresAt: z.string().optional(),
});

//Función asíncrona que maneja la creación de un nuevo producto. Verifica previamente la autenticación y autorización del usuario, valida los datos de entrada, crea el producto en la base de datos y revalida las rutas relevantes para mostrar el nuevo productos en el catálogo del artesano.
export async function createProduct(data: unknown) {

  //Verificar sesión y rol de usuario con getServerSession.
  const session = await getServerSession();
  if (!session?.user) return { error: { code: "UNAUTHORIZED" as const } };
  if (session.user.role !== "ARTISAN") return { error: { code: "FORBIDDEN" as const } };

  //Validar los datos de entrada con el esquema de Zod definido anteriormente.
  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR" as const,
        fields: parsed.error.flatten().fieldErrors,
      },
    };
  }

  //Extraer los campos validados del producto a crear.
  const { name, description, priceInCents, type, imageUrls, category, expiresAt } = parsed.data;

  //Contar cuantos producto activos tiene el artesano para determinar si este es su primer producto, lo cual puede ser útil para mostrar mensajes de bienvenida o tutoriales específicos para nuevos vendedores.
  const existingCount = await db.product.count({
    where: { artisanId: session.user.id, status: "ACTIVE", deletedAt: null },
  });

  //Determinar si este es el primer producto que crea el artesano.
  const isFirstProduct = existingCount === 0;

  //Obtener localidad del artesano en la base de datos para asociarla al producto, lo cual puede ser útil para mostrar productos locales o filtrar productos por localidad en el catálogo.
  const artisan = await db.user.findUnique({
    where: { id: session.user.id },
    select: { locality: true },
  });

  //Crear el nuevo producto en la base de datos con los datos proporcionados y la información del artesano (id y localidad).
  await db.product.create({
    data: {
      artisanId: session.user.id,
      name,
      description,
      priceInCents,
      type,
      imageUrls,
      category,
      locality: artisan?.locality ?? "", //Se asocia la localidad del artesano al producto, o se deja vacío si no existe.
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  //Revalidar las rutas relevantes para que el nuevo producto aparezca en el catálogo del artesano y en la página principal de productos. Esto es necesario porque Next.js puede estar sirviendo versiones en caché de estas páginas, y sin revalidar, el nuevo producto no se mostraría hasta que la caché expirara.
  revalidatePath(`/artisan/${session.user.id}`);
  revalidatePath("/studio/products");

  //Devolver objeto indicando la creación exitosa del producto y si es el primer producto del artesano.
  return { success: true as const, isFirstProduct };
}
