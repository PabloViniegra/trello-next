import { describe, expect, it } from 'vitest'
import {
  createBoardSchema,
  deleteBoardSchema,
  updateBoardPrivacySchema,
  updateBoardSchema,
} from '@/lib/board/schemas'

describe('Board Schemas', () => {
  describe('createBoardSchema', () => {
    it('validates correct board data', () => {
      const result = createBoardSchema.safeParse({
        title: 'My Board',
        description: 'A test board',
        backgroundColor: '#FF5733',
      })
      expect(result.success).toBe(true)
    })

    it('uses default background color', () => {
      const result = createBoardSchema.safeParse({
        title: 'My Board',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.backgroundColor).toBeDefined()
      }
    })

    it('rejects empty title', () => {
      const result = createBoardSchema.safeParse({
        title: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El título es obligatorio')
      }
    })

    it('rejects title shorter than 2 characters', () => {
      const result = createBoardSchema.safeParse({
        title: 'A',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El título debe tener al menos 2 caracteres',
        )
      }
    })

    it('rejects title longer than 255 characters', () => {
      const result = createBoardSchema.safeParse({
        title: 'A'.repeat(256),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El título no puede exceder 255 caracteres',
        )
      }
    })

    it('rejects description longer than 1000 characters', () => {
      const result = createBoardSchema.safeParse({
        title: 'My Board',
        description: 'A'.repeat(1001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La descripción no puede exceder 1000 caracteres',
        )
      }
    })

    it('rejects invalid hex color', () => {
      const result = createBoardSchema.safeParse({
        title: 'My Board',
        backgroundColor: 'not-a-color',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Color inválido')
      }
    })

    it('rejects hex color with wrong format', () => {
      const result = createBoardSchema.safeParse({
        title: 'My Board',
        backgroundColor: '#FFF', // 3-digit hex not allowed
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid 6-digit hex colors', () => {
      const colors = ['#000000', '#FFFFFF', '#ff5733', '#ABC123']
      for (const color of colors) {
        const result = createBoardSchema.safeParse({
          title: 'My Board',
          backgroundColor: color,
        })
        expect(result.success).toBe(true)
      }
    })

    it('accepts null description', () => {
      const result = createBoardSchema.safeParse({
        title: 'My Board',
        description: null,
      })
      expect(result.success).toBe(true)
    })

    it('trims title and description', () => {
      const result = createBoardSchema.safeParse({
        title: '  My Board  ',
        description: '  A description  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('My Board')
        expect(result.data.description).toBe('A description')
      }
    })
  })

  describe('updateBoardSchema', () => {
    it('validates correct update data', () => {
      const result = updateBoardSchema.safeParse({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID for boardId', () => {
      const result = updateBoardSchema.safeParse({
        boardId: 'not-a-uuid',
        title: 'Updated Title',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('ID de tablero inválido')
      }
    })

    it('allows optional fields', () => {
      const result = updateBoardSchema.safeParse({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('deleteBoardSchema', () => {
    it('validates correct delete data', () => {
      const result = deleteBoardSchema.safeParse({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID', () => {
      const result = deleteBoardSchema.safeParse({
        boardId: 'invalid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('ID de tablero inválido')
      }
    })
  })

  describe('updateBoardPrivacySchema', () => {
    it('validates public privacy setting', () => {
      const result = updateBoardPrivacySchema.safeParse({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        isPrivate: 'public',
      })
      expect(result.success).toBe(true)
    })

    it('validates private privacy setting', () => {
      const result = updateBoardPrivacySchema.safeParse({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        isPrivate: 'private',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid privacy value', () => {
      const result = updateBoardPrivacySchema.safeParse({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        isPrivate: 'invalid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Valor de privacidad inválido',
        )
      }
    })
  })
})
