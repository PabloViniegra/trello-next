/**
 * Comment Validation Schemas
 * Zod schemas for comment operations
 */

import { z } from 'zod'

// =============================================================================
// COMMENT SCHEMAS
// =============================================================================

export const createCommentSchema = z.object({
  cardId: z.string().min(1, 'El ID de la tarjeta es requerido'),
  content: z
    .string()
    .min(1, 'El contenido del comentario es requerido')
    .max(2000, 'El comentario no puede exceder 2000 caracteres'),
})

export const updateCommentSchema = z.object({
  id: z.string().min(1, 'El ID del comentario es requerido'),
  content: z
    .string()
    .min(1, 'El contenido del comentario es requerido')
    .max(2000, 'El comentario no puede exceder 2000 caracteres'),
})

export const deleteCommentSchema = z.object({
  id: z.string().min(1, 'El ID del comentario es requerido'),
})

export const getCommentsSchema = z.object({
  cardId: z.string().min(1, 'El ID de la tarjeta es requerido'),
})

// =============================================================================
// INPUT TYPES
// =============================================================================

export type TCreateCommentInput = z.infer<typeof createCommentSchema>
export type TUpdateCommentInput = z.infer<typeof updateCommentSchema>
export type TDeleteCommentInput = z.infer<typeof deleteCommentSchema>
export type TGetCommentsInput = z.infer<typeof getCommentsSchema>
