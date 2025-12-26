import { z } from 'zod'

// UUID v4 regex validation to prevent SQL injection
const uuidSchema = z.string().uuid('El ID debe ser un UUID válido')

export const assignCardMemberSchema = z.object({
  cardId: uuidSchema,
  userId: uuidSchema,
})

export const unassignCardMemberSchema = z.object({
  cardId: uuidSchema,
  userId: uuidSchema,
})
