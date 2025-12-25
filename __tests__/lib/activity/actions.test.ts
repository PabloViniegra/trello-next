/**
 * Activity Actions Tests
 * Tests for server actions related to activity
 */

import { describe, expect, it, vi } from 'vitest'
import { getBoardActivitiesAction } from '@/lib/activity/actions'

// Mock dependencies
vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/activity/queries', () => ({
  getActivityByBoard: vi.fn(),
}))

describe('Activity Actions', () => {
  describe('getBoardActivitiesAction', () => {
    it('should return error if user is not authenticated', async () => {
      const { getCurrentUser } = await import('@/lib/auth/get-user')
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

      const result = await getBoardActivitiesAction('board-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Usuario no autenticado')
    })

    it('should return activities for authenticated user', async () => {
      const { getCurrentUser } = await import('@/lib/auth/get-user')
      const { getActivityByBoard } = await import('@/lib/activity/queries')

      vi.mocked(getCurrentUser).mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      } as never)

      vi.mocked(getActivityByBoard).mockResolvedValueOnce([
        {
          id: 'act-1',
          userId: 'user-123',
          actionType: 'board.created',
          entityType: 'board',
          entityId: 'board-123',
          boardId: 'board-123',
          metadata: {},
          previousValues: {},
          newValues: {},
          createdAt: new Date(),
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            image: null,
          },
        },
      ] as never)

      const result = await getBoardActivitiesAction('board-123', 20)

      expect(result.success).toBe(true)
      expect(result.activities).toHaveLength(1)
    })

    it('should handle authorization errors', async () => {
      const { getCurrentUser } = await import('@/lib/auth/get-user')
      const { getActivityByBoard } = await import('@/lib/activity/queries')

      vi.mocked(getCurrentUser).mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      } as never)

      vi.mocked(getActivityByBoard).mockRejectedValueOnce(
        new Error('No tienes acceso a este tablero'),
      )

      const result = await getBoardActivitiesAction('board-456')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes acceso a este tablero')
    })

    it('should handle general errors', async () => {
      const { getCurrentUser } = await import('@/lib/auth/get-user')
      const { getActivityByBoard } = await import('@/lib/activity/queries')

      vi.mocked(getCurrentUser).mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      } as never)

      vi.mocked(getActivityByBoard).mockRejectedValueOnce(
        new Error('Database error'),
      )

      const result = await getBoardActivitiesAction('board-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Error al cargar las actividades')
    })
  })
})
