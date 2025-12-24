/**
 * Activity Queries Tests
 * Tests for activity database queries
 */

import { describe, expect, it, vi } from 'vitest'
import { getActivityByBoard, getRecentActivity } from '@/lib/activity/queries'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    }),
  },
}))

vi.mock('@/lib/board-member/queries', () => ({
  hasUserBoardAccess: vi.fn().mockResolvedValue(true),
}))

describe('Activity Queries', () => {
  describe('getActivityByBoard', () => {
    it('should return activities for a board when user has access', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue([
                    {
                      id: 'act-1',
                      userId: 'user-1',
                      actionType: ACTIVITY_TYPES.BOARD_CREATED,
                      entityType: ENTITY_TYPES.BOARD,
                      entityId: 'board-1',
                      boardId: 'board-1',
                      metadata: { title: 'Test Board' },
                      previousValues: {},
                      newValues: {},
                      createdAt: new Date(),
                      user: {
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        image: null,
                      },
                    },
                  ]),
                }),
              }),
            }),
          }),
        }),
      } as never)

      const activities = await getActivityByBoard('board-1', 'user-1')

      expect(activities).toHaveLength(1)
      expect(activities[0].actionType).toBe(ACTIVITY_TYPES.BOARD_CREATED)
      expect(activities[0].boardId).toBe('board-1')
    })

    it('should throw error when user does not have access', async () => {
      const { hasUserBoardAccess } = await import('@/lib/board-member/queries')
      vi.mocked(hasUserBoardAccess).mockResolvedValueOnce(false)

      await expect(getActivityByBoard('board-1', 'user-2')).rejects.toThrow(
        'No tienes acceso a este tablero',
      )
    })

    it('should support pagination with limit and offset', async () => {
      const activities = await getActivityByBoard('board-1', 'user-1', 10, 5)

      expect(activities).toBeDefined()
    })
  })

  describe('getActivityByUser', () => {
    it('should return activities for a specific user', async () => {
      const { getActivityByUser } = await import('@/lib/activity/queries')
      const activities = await getActivityByUser('user-1', 50, 0)

      expect(activities).toBeDefined()
      expect(Array.isArray(activities)).toBe(true)
    })
  })

  describe('getActivityByEntity', () => {
    it('should return activities for a specific entity', async () => {
      const { getActivityByEntity } = await import('@/lib/activity/queries')
      const activities = await getActivityByEntity(
        ENTITY_TYPES.BOARD,
        'board-1',
        50,
        0,
      )

      expect(activities).toBeDefined()
      expect(Array.isArray(activities)).toBe(true)
    })
  })

  describe('getRecentActivity', () => {
    it('should return recent activities when user has access', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: 'act-1',
                    userId: 'user-1',
                    actionType: ACTIVITY_TYPES.BOARD_CREATED,
                    entityType: ENTITY_TYPES.BOARD,
                    entityId: 'board-1',
                    boardId: 'board-1',
                    metadata: { title: 'Test Board' },
                    previousValues: {},
                    newValues: {},
                    createdAt: new Date(),
                    user: {
                      id: 'user-1',
                      name: 'Test User',
                      email: 'test@example.com',
                      image: null,
                    },
                  },
                ]),
              }),
            }),
          }),
        }),
      } as never)

      const activities = await getRecentActivity('board-1', 'user-1', 10)

      expect(activities).toHaveLength(1)
      expect(activities[0].actionType).toBe(ACTIVITY_TYPES.BOARD_CREATED)
    })

    it('should throw error when user does not have access', async () => {
      const { hasUserBoardAccess } = await import('@/lib/board-member/queries')
      vi.mocked(hasUserBoardAccess).mockResolvedValueOnce(false)

      await expect(getRecentActivity('board-1', 'user-2')).rejects.toThrow(
        'No tienes acceso a este tablero',
      )
    })

    it('should respect limit parameter', async () => {
      const { db } = await import('@/db')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as never)

      const activities = await getRecentActivity('board-1', 'user-1', 5)

      expect(activities).toBeDefined()
      expect(Array.isArray(activities)).toBe(true)
    })
  })
})
