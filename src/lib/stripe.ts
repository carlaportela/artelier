//Cliente de Stripe para gestionar pagos a terceros.

import Stripe from "stripe"; //Importa el cliente instalado con npm de Stripe.
import { env } from "~/env"; //Importa el módulo src/env.js que valida las variables de entorno.

//Función para exportar el cliente de Stripe. Exporta null si no existen las credenciales de Stripe o una nueva instancia de Stripe con las credenciales.
export const stripe: Stripe | null = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" })
  : null;
