/**
 * Activity System Cleanup Utilities
 *
 * Handles cleanup of old activity logs to prevent database bloat.
 * Should be run periodically (e.g., via cron job).
 */

import { logger } from '@/lib/utils/logger'
import { clearOldActivity } from './logger'

/**
 * Clean up old activity logs (older than 180 days by default)
 * This should be run periodically to prevent database bloat
 */
export async function cleanupOldActivityLogs(): Promise<void> {
  try {
    logger.info('Starting cleanup of old activity logs')

    const deletedCount = await clearOldActivity(180) // 180 days

    logger.info('Cleanup completed successfully', { deletedCount })

    return Promise.resolve()
  } catch (error) {
    logger.error('Error during activity cleanup', error)
    throw error
  }
}

/**
 * Clean up old notification logs (older than 30 days)
 * Notifications are less critical than activity logs
 */
export async function cleanupOldNotifications(): Promise<void> {
  try {
    logger.info('Starting cleanup of old notifications')

    // TODO: Implement notification cleanup when notifications table is ready
    logger.info('Notification cleanup not yet implemented')

    return Promise.resolve()
  } catch (error) {
    logger.error('Error during notification cleanup', error)
    throw error
  }
}

/**
 * Run all cleanup operations
 */
export async function runFullCleanup(): Promise<void> {
  try {
    logger.info('Starting full activity system cleanup')

    await Promise.all([cleanupOldActivityLogs(), cleanupOldNotifications()])

    logger.info('Full cleanup completed successfully')
  } catch (error) {
    logger.error('Error during full cleanup', error)
    throw error
  }
}

// Export for use in scripts or cron jobs
export default runFullCleanup
