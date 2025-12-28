import { z } from 'zod'

export const createBoardSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .trim(),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .trim()
    .nullish()
    .transform((val) => val ?? null),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
})

export const updateBoardSchema = z.object({
  boardId: z.string().uuid('ID de tablero inválido'),
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .nullable(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')
    .optional(),
})

export const deleteBoardSchema = z.object({
  boardId: z.string().uuid('ID de tablero inválido'),
})

export const updateBoardPrivacySchema = z.object({
  boardId: z.string().uuid('ID de tablero inválido'),
  isPrivate: z.enum(['public', 'private'], {
    message: 'Valor de privacidad inválido',
  }),
})
