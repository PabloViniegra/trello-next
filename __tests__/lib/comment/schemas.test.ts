import { describe, expect, it } from 'vitest'
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '@/lib/comment/schemas'

describe('Comment Schemas', () => {
  describe('createCommentSchema', () => {
    it('validates correct comment data', () => {
      const result = createCommentSchema.safeParse({
        cardId: 'card-123',
        content: 'This is a comment',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty cardId', () => {
      const result = createCommentSchema.safeParse({
        cardId: '',
        content: 'This is a comment',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de la tarjeta es requerido',
        )
      }
    })

    it('rejects empty content', () => {
      const result = createCommentSchema.safeParse({
        cardId: 'card-123',
        content: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El contenido del comentario es requerido',
        )
      }
    })

    it('rejects content longer than 2000 characters', () => {
      const result = createCommentSchema.safeParse({
        cardId: 'card-123',
        content: 'A'.repeat(2001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El comentario no puede exceder 2000 caracteres',
        )
      }
    })

    it('accepts content at max length', () => {
      const result = createCommentSchema.safeParse({
        cardId: 'card-123',
        content: 'A'.repeat(2000),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateCommentSchema', () => {
    it('validates correct update data', () => {
      const result = updateCommentSchema.safeParse({
        id: 'comment-123',
        content: 'Updated comment',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = updateCommentSchema.safeParse({
        id: '',
        content: 'Updated comment',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID del comentario es requerido',
        )
      }
    })

    it('rejects empty content', () => {
      const result = updateCommentSchema.safeParse({
        id: 'comment-123',
        content: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El contenido del comentario es requerido',
        )
      }
    })

    it('rejects content longer than 2000 characters', () => {
      const result = updateCommentSchema.safeParse({
        id: 'comment-123',
        content: 'A'.repeat(2001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El comentario no puede exceder 2000 caracteres',
        )
      }
    })
  })

  describe('deleteCommentSchema', () => {
    it('validates correct delete data', () => {
      const result = deleteCommentSchema.safeParse({
        id: 'comment-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = deleteCommentSchema.safeParse({
        id: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID del comentario es requerido',
        )
      }
    })
  })

  describe('getCommentsSchema', () => {
    it('validates correct query data', () => {
      const result = getCommentsSchema.safeParse({
        cardId: 'card-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty cardId', () => {
      const result = getCommentsSchema.safeParse({
        cardId: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de la tarjeta es requerido',
        )
      }
    })
  })
})
