import { z } from 'zod'

export const createCardSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título debe tener menos de 255 caracteres'),
  description: z.string().optional(),
  listId: z.string().min(1, 'El ID de lista es obligatorio'),
  dueDate: z.date().optional(),
})

export const updateCardSchema = z.object({
  id: z.string().min(1, 'El ID de tarjeta es obligatorio'),
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título debe tener menos de 255 caracteres')
    .optional(),
  description: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
  dueDate: z.date().nullable().optional(),
  listId: z.string().min(1, 'El ID de lista es obligatorio').optional(),
})

export const deleteCardSchema = z.object({
  id: z.string().min(1, 'El ID de tarjeta es obligatorio'),
})

export type TCreateCardInput = z.infer<typeof createCardSchema>
export type TUpdateCardInput = z.infer<typeof updateCardSchema>
export type TDeleteCardInput = z.infer<typeof deleteCardSchema>

export const moveCardSchema = z.object({
  cardId: z.string().min(1, 'El ID de tarjeta es obligatorio'),
  targetListId: z.string().min(1, 'El ID de lista de destino es obligatorio'),
  position: z
    .number()
    .int()
    .min(0, 'La posición debe ser un número no negativo'),
})

export type TMoveCardInput = z.infer<typeof moveCardSchema>

export const generateCardWithAISchema = z.object({
  prompt: z
    .string()
    .min(1, 'El prompt es obligatorio')
    .max(500, 'El prompt debe tener menos de 500 caracteres'),
  listId: z.string().min(1, 'El ID de lista es obligatorio'),
})

export type TGenerateCardWithAIInput = z.infer<typeof generateCardWithAISchema>
