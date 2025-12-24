/**
 * Activity Cleanup Tests
 * Tests for cleanup utility functions
 */

import { describe, expect, it, vi } from 'vitest'
import {
  cleanupOldActivityLogs,
  cleanupOldNotifications,
  runFullCleanup,
} from '@/lib/activity/cleanup'

// Mock dependencies
vi.mock('@/lib/activity/logger', () => ({
  clearOldActivity: vi.fn().mockResolvedValue(10),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Activity Cleanup', () => {
  describe('cleanupOldActivityLogs', () => {
    it('should clean up old activity logs successfully', async () => {
      await expect(cleanupOldActivityLogs()).resolves.toBeUndefined()
    })

    it('should handle errors during cleanup', async () => {
      const { clearOldActivity } = await import('@/lib/activity/logger')
      vi.mocked(clearOldActivity).mockRejectedValueOnce(
        new Error('Cleanup failed'),
      )

      await expect(cleanupOldActivityLogs()).rejects.toThrow('Cleanup failed')
    })
  })

  describe('cleanupOldNotifications', () => {
    it('should resolve successfully (not yet implemented)', async () => {
      await expect(cleanupOldNotifications()).resolves.toBeUndefined()
    })
  })

  describe('runFullCleanup', () => {
    it('should run all cleanup operations successfully', async () => {
      await expect(runFullCleanup()).resolves.toBeUndefined()
    })

    it('should handle errors during full cleanup', async () => {
      const { clearOldActivity } = await import('@/lib/activity/logger')
      vi.mocked(clearOldActivity).mockRejectedValueOnce(
        new Error('Full cleanup failed'),
      )

      await expect(runFullCleanup()).rejects.toThrow('Full cleanup failed')
    })
  })
})
