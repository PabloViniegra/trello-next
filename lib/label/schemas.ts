import { z } from 'zod'

export const createLabelSchema = z.object({
  boardId: z.string().min(1, 'El ID del tablero es obligatorio'),
  name: z
    .string()
    .max(100, 'El nombre debe tener menos de 100 caracteres')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Formato de color hex inválido (#RRGGBB)')
    .transform((val) => val.toUpperCase()),
})

export const updateLabelSchema = z.object({
  id: z.string().min(1, 'El ID de la etiqueta es obligatorio'),
  name: z
    .string()
    .max(100, 'El nombre debe tener menos de 100 caracteres')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Formato de color hex inválido (#RRGGBB)')
    .transform((val) => val.toUpperCase())
    .optional(),
})

export const deleteLabelSchema = z.object({
  id: z.string().min(1, 'El ID de la etiqueta es obligatorio'),
})

export const assignLabelToCardSchema = z.object({
  cardId: z.string().min(1, 'El ID de la tarjeta es obligatorio'),
  labelId: z.string().min(1, 'El ID de la etiqueta es obligatorio'),
})

export type TCreateLabelInput = z.infer<typeof createLabelSchema>
export type TUpdateLabelInput = z.infer<typeof updateLabelSchema>
export type TDeleteLabelInput = z.infer<typeof deleteLabelSchema>
export type TAssignLabelInput = z.infer<typeof assignLabelToCardSchema>
