import { z } from 'zod'
import { AVATAR_UPLOAD_CONSTRAINTS } from './constants'

// =============================================================================
// UPDATE PROFILE SCHEMAS
// =============================================================================

/**
 * Schema for updating user name
 */
export const updateUserNameSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
})

/**
 * Schema for updating user password
 * Requires current password verification
 */
export const updateUserPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      ),
    confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  })

/**
 * Schema for uploading user avatar
 * Only images allowed, max 5MB
 */
export const uploadAvatarSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'El archivo no puede estar vacío')
    .refine(
      (file) => file.size <= AVATAR_UPLOAD_CONSTRAINTS.MAX_SIZE_BYTES,
      `El archivo no puede superar ${AVATAR_UPLOAD_CONSTRAINTS.MAX_SIZE_MB}MB`,
    )
    .refine(
      (file) => {
        return AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(
          file.type as (typeof AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES)[number],
        )
      },
      `Solo se permiten imágenes (${AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES_DISPLAY})`,
    ),
})

/**
 * Schema for deleting user avatar
 */
export const deleteAvatarSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
})

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type TUpdateUserNameInput = z.infer<typeof updateUserNameSchema>
export type TUpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>
export type TUploadAvatarInput = z.infer<typeof uploadAvatarSchema>
export type TDeleteAvatarInput = z.infer<typeof deleteAvatarSchema>
