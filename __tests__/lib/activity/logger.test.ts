/**
 * Activity Logger Tests
 * Tests for activity logging functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearOldActivity,
  logActivities,
  logActivity,
} from '@/lib/activity/logger'
import type { TLogActivityInput } from '@/lib/activity/types'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue({ rowCount: 5 }),
    }),
  },
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

describe('Activity Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('logActivity', () => {
    it('should log a board creation activity', async () => {
      const input: TLogActivityInput = {
        userId: 'user-123',
        actionType: ACTIVITY_TYPES.BOARD_CREATED,
        entityType: ENTITY_TYPES.BOARD,
        entityId: 'board-123',
        boardId: 'board-123',
        metadata: { boardTitle: 'My Test Board' },
      }

      await expect(logActivity(input)).resolves.toBeUndefined()
    })

    it('should log a card moved activity with metadata', async () => {
      const input: TLogActivityInput = {
        userId: 'user-456',
        actionType: ACTIVITY_TYPES.CARD_MOVED,
        entityType: ENTITY_TYPES.CARD,
        entityId: 'card-789',
        boardId: 'board-123',
        metadata: {
          cardTitle: 'Test Card',
          fromList: 'To Do',
          toList: 'In Progress',
        },
        previousValues: { listId: 'list-1' },
        newValues: { listId: 'list-2' },
      }

      await expect(logActivity(input)).resolves.toBeUndefined()
    })

    it('should handle errors gracefully without throwing', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockRejectedValue(new Error('Database error')),
      } as never)

      const input: TLogActivityInput = {
        userId: 'user-123',
        actionType: ACTIVITY_TYPES.LIST_CREATED,
        entityType: ENTITY_TYPES.LIST,
        entityId: 'list-123',
        boardId: 'board-123',
      }

      // Should not throw
      await expect(logActivity(input)).resolves.toBeUndefined()
    })
  })

  describe('logActivities', () => {
    it('should batch log multiple activities', async () => {
      const inputs: TLogActivityInput[] = [
        {
          userId: 'user-123',
          actionType: ACTIVITY_TYPES.LABEL_CREATED,
          entityType: ENTITY_TYPES.LABEL,
          entityId: 'label-1',
          boardId: 'board-123',
          metadata: { labelName: 'Bug' },
        },
        {
          userId: 'user-123',
          actionType: ACTIVITY_TYPES.LABEL_CREATED,
          entityType: ENTITY_TYPES.LABEL,
          entityId: 'label-2',
          boardId: 'board-123',
          metadata: { labelName: 'Feature' },
        },
      ]

      await expect(logActivities(inputs)).resolves.toBeUndefined()
    })

    it('should handle batch logging errors gracefully', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockRejectedValue(new Error('Batch insert failed')),
      } as never)

      const inputs: TLogActivityInput[] = [
        {
          userId: 'user-123',
          actionType: ACTIVITY_TYPES.CARD_CREATED,
          entityType: ENTITY_TYPES.CARD,
          entityId: 'card-1',
          boardId: 'board-123',
        },
      ]

      // Should not throw
      await expect(logActivities(inputs)).resolves.toBeUndefined()
    })
  })

  describe('clearOldActivity', () => {
    it('should delete old activity logs and return count', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.delete).mockReturnValueOnce({
        where: vi.fn().mockResolvedValue({ rowCount: 5 }),
      } as never)

      const deletedCount = await clearOldActivity(180)
      expect(deletedCount).toBe(5)
    })

    it('should use custom days to keep', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.delete).mockReturnValueOnce({
        where: vi.fn().mockResolvedValue({ rowCount: 3 }),
      } as never)

      const deletedCount = await clearOldActivity(30)
      expect(deletedCount).toBe(3)
    })

    it('should return 0 on error', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.delete).mockReturnValueOnce({
        where: vi.fn().mockRejectedValue(new Error('Delete failed')),
      } as never)

      const deletedCount = await clearOldActivity(180)
      expect(deletedCount).toBe(0)
    })
  })
})
