import { describe, expect, it } from 'vitest'
import {
  assignLabelToCardSchema,
  createLabelSchema,
  deleteLabelSchema,
  updateLabelSchema,
} from '@/lib/label/schemas'

describe('Label Schemas', () => {
  describe('createLabelSchema', () => {
    it('validates correct label data', () => {
      const result = createLabelSchema.safeParse({
        boardId: 'board-123',
        name: 'Bug',
        color: '#FF0000',
      })
      expect(result.success).toBe(true)
    })

    it('transforms color to uppercase', () => {
      const result = createLabelSchema.safeParse({
        boardId: 'board-123',
        name: 'Bug',
        color: '#ff0000',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.color).toBe('#FF0000')
      }
    })

    it('allows optional name', () => {
      const result = createLabelSchema.safeParse({
        boardId: 'board-123',
        color: '#FF0000',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty boardId', () => {
      const result = createLabelSchema.safeParse({
        boardId: '',
        color: '#FF0000',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID del tablero es obligatorio',
        )
      }
    })

    it('rejects name longer than 100 characters', () => {
      const result = createLabelSchema.safeParse({
        boardId: 'board-123',
        name: 'A'.repeat(101),
        color: '#FF0000',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El nombre debe tener menos de 100 caracteres',
        )
      }
    })

    it('rejects invalid hex color', () => {
      const result = createLabelSchema.safeParse({
        boardId: 'board-123',
        color: 'not-a-color',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Formato de color hex inválido (#RRGGBB)',
        )
      }
    })

    it('rejects 3-digit hex color', () => {
      const result = createLabelSchema.safeParse({
        boardId: 'board-123',
        color: '#FFF',
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid hex colors', () => {
      const colors = ['#000000', '#FFFFFF', '#AbCdEf', '#123456']
      for (const color of colors) {
        const result = createLabelSchema.safeParse({
          boardId: 'board-123',
          color,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('updateLabelSchema', () => {
    it('validates correct update data', () => {
      const result = updateLabelSchema.safeParse({
        id: 'label-123',
        name: 'Updated Label',
        color: '#00FF00',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = updateLabelSchema.safeParse({
        id: '',
        name: 'Updated Label',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de la etiqueta es obligatorio',
        )
      }
    })

    it('allows optional name and color', () => {
      const result = updateLabelSchema.safeParse({
        id: 'label-123',
      })
      expect(result.success).toBe(true)
    })

    it('transforms color to uppercase', () => {
      const result = updateLabelSchema.safeParse({
        id: 'label-123',
        color: '#abcdef',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.color).toBe('#ABCDEF')
      }
    })
  })

  describe('deleteLabelSchema', () => {
    it('validates correct delete data', () => {
      const result = deleteLabelSchema.safeParse({
        id: 'label-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = deleteLabelSchema.safeParse({
        id: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de la etiqueta es obligatorio',
        )
      }
    })
  })

  describe('assignLabelToCardSchema', () => {
    it('validates correct assign data', () => {
      const result = assignLabelToCardSchema.safeParse({
        cardId: 'card-123',
        labelId: 'label-456',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty cardId', () => {
      const result = assignLabelToCardSchema.safeParse({
        cardId: '',
        labelId: 'label-456',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de la tarjeta es obligatorio',
        )
      }
    })

    it('rejects empty labelId', () => {
      const result = assignLabelToCardSchema.safeParse({
        cardId: 'card-123',
        labelId: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El ID de la etiqueta es obligatorio',
        )
      }
    })
  })
})
