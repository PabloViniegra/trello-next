import { describe, expect, it } from 'vitest'
import {
  createCardSchema,
  deleteCardSchema,
  moveCardSchema,
  updateCardSchema,
} from '@/lib/card/schemas'

describe('Card Schemas', () => {
  describe('createCardSchema', () => {
    it('validates correct card data', () => {
      const result = createCardSchema.safeParse({
        title: 'My Card',
        listId: 'list-123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional description', () => {
      const result = createCardSchema.safeParse({
        title: 'My Card',
        listId: 'list-123',
        description: 'A test card',
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional dueDate', () => {
      const result = createCardSchema.safeParse({
        title: 'My Card',
        listId: 'list-123',
        dueDate: new Date(),
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const result = createCardSchema.safeParse({
        title: '',
        listId: 'list-123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El título es obligatorio')
      }
    })

    it('rejects title longer than 255 characters', () => {
      const result = createCardSchema.safeParse({
        title: 'A'.repeat(256),
        listId: 'list-123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El título debe tener menos de 255 caracteres',
        )
      }
    })

    it('rejects empty listId', () => {
      const result = createCardSchema.safeParse({
        title: 'My Card',
        listId: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de lista es obligatorio',
        )
      }
    })
  })

  describe('updateCardSchema', () => {
    it('validates correct update data', () => {
      const result = updateCardSchema.safeParse({
        id: 'card-123',
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = updateCardSchema.safeParse({
        id: '',
        title: 'Updated Title',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de tarjeta es obligatorio',
        )
      }
    })

    it('allows optional title', () => {
      const result = updateCardSchema.safeParse({
        id: 'card-123',
      })
      expect(result.success).toBe(true)
    })

    it('allows null description', () => {
      const result = updateCardSchema.safeParse({
        id: 'card-123',
        description: null,
      })
      expect(result.success).toBe(true)
    })

    it('allows position update', () => {
      const result = updateCardSchema.safeParse({
        id: 'card-123',
        position: 5,
      })
      expect(result.success).toBe(true)
    })

    it('rejects negative position', () => {
      const result = updateCardSchema.safeParse({
        id: 'card-123',
        position: -1,
      })
      expect(result.success).toBe(false)
    })

    it('allows null dueDate', () => {
      const result = updateCardSchema.safeParse({
        id: 'card-123',
        dueDate: null,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('deleteCardSchema', () => {
    it('validates correct delete data', () => {
      const result = deleteCardSchema.safeParse({
        id: 'card-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = deleteCardSchema.safeParse({
        id: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de tarjeta es obligatorio',
        )
      }
    })
  })

  describe('moveCardSchema', () => {
    it('validates correct move data', () => {
      const result = moveCardSchema.safeParse({
        cardId: 'card-123',
        targetListId: 'list-456',
        position: 0,
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty cardId', () => {
      const result = moveCardSchema.safeParse({
        cardId: '',
        targetListId: 'list-456',
        position: 0,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de tarjeta es obligatorio',
        )
      }
    })

    it('rejects empty targetListId', () => {
      const result = moveCardSchema.safeParse({
        cardId: 'card-123',
        targetListId: '',
        position: 0,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de lista de destino es obligatorio',
        )
      }
    })

    it('rejects negative position', () => {
      const result = moveCardSchema.safeParse({
        cardId: 'card-123',
        targetListId: 'list-456',
        position: -1,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La posición debe ser un número no negativo',
        )
      }
    })

    it('rejects non-integer position', () => {
      const result = moveCardSchema.safeParse({
        cardId: 'card-123',
        targetListId: 'list-456',
        position: 1.5,
      })
      expect(result.success).toBe(false)
    })
  })
})
