import { z } from 'zod'

export const assignCardMemberSchema = z.object({
  cardId: z.string().min(1, 'El ID de la tarjeta es requerido'),
  userId: z.string().min(1, 'El ID del usuario es requerido'),
})

export const unassignCardMemberSchema = z.object({
  cardId: z.string().min(1, 'El ID de la tarjeta es requerido'),
  userId: z.string().min(1, 'El ID del usuario es requerido'),
})
