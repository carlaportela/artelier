//Configuración del cliente de Cloudinary.

import { v2 as cloudinary } from "cloudinary"; //Importa el cliente del paquete npm.

import { env } from "~/env"; //Importa las variables de entorno validadas de .env.

//Si no existen las credenciales de Cloudinary lanza un aviso a la consola sin romper la ejecución de la aplicación.
if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  console.warn(
    "[Artelier] Cloudinary no configurado: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY " +
      "y/o CLOUDINARY_API_SECRET ausentes. Las subidas de imágenes no funcionarán.",
  );
}

//Configura el cliente con las credenciales
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

//Exporta el cliente ya configurado.
export { cloudinary };
