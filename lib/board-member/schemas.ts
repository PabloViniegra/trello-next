import { z } from 'zod'

export const addBoardMemberSchema = z.object({
  boardId: z.string().uuid('El ID del tablero debe ser un UUID válido'),
  userId: z
    .string()
    .min(1, 'El ID del usuario es obligatorio')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El ID del usuario no es válido'),
  role: z.enum(['member']).default('member'),
})

export const removeBoardMemberSchema = z.object({
  boardId: z.string().uuid('El ID del tablero debe ser un UUID válido'),
  userId: z
    .string()
    .min(1, 'El ID del usuario es obligatorio')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El ID del usuario no es válido'),
})
