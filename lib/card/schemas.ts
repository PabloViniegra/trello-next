import { z } from 'zod'

export const createCardSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  listId: z.string().min(1, 'List ID is required'),
  dueDate: z.date().optional(),
})

export const updateCardSchema = z.object({
  id: z.string().min(1, 'Card ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  dueDate: z.date().nullable().optional(),
  listId: z.string().min(1, 'List ID is required').optional(),
})

export const deleteCardSchema = z.object({
  id: z.string().min(1, 'Card ID is required'),
})

export type TCreateCardInput = z.infer<typeof createCardSchema>
export type TUpdateCardInput = z.infer<typeof updateCardSchema>
export type TDeleteCardInput = z.infer<typeof deleteCardSchema>

export const moveCardSchema = z.object({
  cardId: z.string().min(1, 'Card ID is required'),
  targetListId: z.string().min(1, 'Target list ID is required'),
  position: z.number().int().min(0, 'Position must be a non-negative integer'),
})

export type TMoveCardInput = z.infer<typeof moveCardSchema>
