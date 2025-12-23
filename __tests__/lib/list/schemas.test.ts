import { describe, expect, it } from 'vitest'
import {
  createListSchema,
  deleteListSchema,
  updateListSchema,
} from '@/lib/list/schemas'

describe('List Schemas', () => {
  describe('createListSchema', () => {
    it('validates correct list data', () => {
      const result = createListSchema.safeParse({
        title: 'My List',
        boardId: 'board-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const result = createListSchema.safeParse({
        title: '',
        boardId: 'board-123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('rejects title longer than 255 characters', () => {
      const result = createListSchema.safeParse({
        title: 'A'.repeat(256),
        boardId: 'board-123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Title must be less than 255 characters',
        )
      }
    })

    it('rejects empty boardId', () => {
      const result = createListSchema.safeParse({
        title: 'My List',
        boardId: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Board ID is required')
      }
    })
  })

  describe('updateListSchema', () => {
    it('validates correct update data', () => {
      const result = updateListSchema.safeParse({
        id: 'list-123',
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = updateListSchema.safeParse({
        id: '',
        title: 'Updated Title',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('List ID is required')
      }
    })

    it('allows optional title', () => {
      const result = updateListSchema.safeParse({
        id: 'list-123',
      })
      expect(result.success).toBe(true)
    })

    it('allows position update', () => {
      const result = updateListSchema.safeParse({
        id: 'list-123',
        position: 3,
      })
      expect(result.success).toBe(true)
    })

    it('rejects negative position', () => {
      const result = updateListSchema.safeParse({
        id: 'list-123',
        position: -1,
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer position', () => {
      const result = updateListSchema.safeParse({
        id: 'list-123',
        position: 1.5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('deleteListSchema', () => {
    it('validates correct delete data', () => {
      const result = deleteListSchema.safeParse({
        id: 'list-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = deleteListSchema.safeParse({
        id: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('List ID is required')
      }
    })
  })
})
