//Página de configuración de Next.js, que incluye la integración del plugin de internacionalización y la configuración para permitir imágenes remotas desde Cloudinary y el uso de React PDF renderer en el servidor.
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import "./src/env.js";
import createNextIntlPlugin from "next-intl/plugin";

//Integración de plugin de internacionalización, con configuración para cargar los mensajes de traducción desde el archivo request.ts.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

//Configuración de Next.js para incluir React PDF renderer como paquete externo en el servidor y permitir imágenes remotas desde Cloudinary
/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

//Exporación de la configuración del plugin de internacionalización junto con la configuración personalizada.
export default withNextIntl(config);
