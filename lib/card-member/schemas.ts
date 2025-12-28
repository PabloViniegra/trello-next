import { z } from 'zod'

// Validate non-empty string IDs
// Note: better-auth generates text IDs (not UUIDs), but our card IDs are UUIDs
const userIdSchema = z
  .string()
  .min(1, 'El ID del usuario es obligatorio')
  .regex(/^[a-zA-Z0-9_-]+$/, 'El ID del usuario no es válido')

const uuidSchema = z.string().uuid('El ID debe ser un UUID válido')

export const assignCardMemberSchema = z.object({
  cardId: uuidSchema, // Card IDs are UUIDs
  userId: userIdSchema, // User IDs from better-auth are text, not UUIDs
})

export const unassignCardMemberSchema = z.object({
  cardId: uuidSchema, // Card IDs are UUIDs
  userId: userIdSchema, // User IDs from better-auth are text, not UUIDs
})
