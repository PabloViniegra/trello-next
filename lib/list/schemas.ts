import { z } from 'zod'

export const createListSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  boardId: z.string().min(1, 'Board ID is required'),
})

export const updateListSchema = z.object({
  id: z.string().min(1, 'List ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  position: z.number().int().min(0).optional(),
})

export const deleteListSchema = z.object({
  id: z.string().min(1, 'List ID is required'),
})

export type TCreateListInput = z.infer<typeof createListSchema>
export type TUpdateListInput = z.infer<typeof updateListSchema>
export type TDeleteListInput = z.infer<typeof deleteListSchema>
