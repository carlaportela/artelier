import { v2 as cloudinary } from "cloudinary";

import { env } from "~/env";

if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  console.warn(
    "[Artelier] Cloudinary no configurado: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY " +
      "y/o CLOUDINARY_API_SECRET ausentes. Las subidas de imágenes no funcionarán.",
  );
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
