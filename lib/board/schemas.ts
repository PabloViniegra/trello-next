import { z } from 'zod'
import { DEFAULT_BOARD_COLOR } from './types'

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
    .optional()
    .nullable(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')
    .default(DEFAULT_BOARD_COLOR),
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
