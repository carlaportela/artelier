import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Introduce un email válido").transform((v) => v.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
  role: z.enum(["ARTISAN", "BUYER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Introduce tu contraseña actual"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Introduce tu contraseña para confirmar"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
