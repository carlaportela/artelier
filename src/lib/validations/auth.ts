import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  locality: z.string().min(2, "Introduce tu localidad"),
  role: z.enum(["ARTISAN", "BUYER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
