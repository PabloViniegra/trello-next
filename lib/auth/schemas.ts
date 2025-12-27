import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .trim(),
    email: z
      .string()
      .min(1, 'El email es obligatorio')
      .email('Email inválido')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim(),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token inválido'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
