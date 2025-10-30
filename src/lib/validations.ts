import { z } from "zod";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: minimum 8 characters, at least one letter and one number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Sign up validation schema
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Correo electrónico inválido")
      .regex(emailRegex, "Formato de correo electrónico inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        passwordRegex,
        "La contraseña debe tener al menos 8 caracteres, una letra y un número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    phone: z
      .string()
      .optional()
      .refine(
        val => !val || val.length >= 10,
        "El teléfono debe tener al menos 10 dígitos"
      ),
    department: z
      .string()
      .max(100, "El departamento no puede exceder 100 caracteres")
      .optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Sign in validation schema
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido")
    .regex(emailRegex, "Formato de correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Password reset request schema
 */
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido")
    .regex(emailRegex, "Formato de correo electrónico inválido"),
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

/**
 * Password reset (with new password) schema
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        passwordRegex,
        "La contraseña debe tener al menos 8 caracteres, una letra y un número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema (for logged in users)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        passwordRegex,
        "La contraseña debe tener al menos 8 caracteres, una letra y un número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional(),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 10,
      "El teléfono debe tener al menos 10 dígitos"
    ),
  department: z
    .string()
    .max(100, "El departamento no puede exceder 100 caracteres")
    .optional(),
  biography: z
    .string()
    .max(1000, "La biografía no puede exceder 1000 caracteres")
    .optional(),
  pfpUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Create user schema (for admins)
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido")
    .regex(emailRegex, "Formato de correo electrónico inválido"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 10,
      "El teléfono debe tener al menos 10 dígitos"
    ),
  department: z
    .string()
    .max(100, "El departamento no puede exceder 100 caracteres")
    .optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
  forcePasswordChange: z.boolean().default(false),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Update user schema (for admins)
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional(),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 10,
      "El teléfono debe tener al menos 10 dígitos"
    ),
  department: z
    .string()
    .max(100, "El departamento no puede exceder 100 caracteres")
    .optional(),
  biography: z
    .string()
    .max(500, "La biografía no puede exceder 500 caracteres")
    .optional(),
  pfpUrl: z.string().url("URL de imagen inválida").optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  forcePasswordChange: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
