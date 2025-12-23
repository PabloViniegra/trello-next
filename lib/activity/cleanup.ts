/**
 * Activity System Cleanup Utilities
 *
 * Handles cleanup of old activity logs to prevent database bloat.
 * Should be run periodically (e.g., via cron job).
 */

import { clearOldActivity } from './logger'

/**
 * Clean up old activity logs (older than 180 days by default)
 * This should be run periodically to prevent database bloat
 */
export async function cleanupOldActivityLogs(): Promise<void> {
  try {
    console.log('🧹 Starting cleanup of old activity logs...')

    const deletedCount = await clearOldActivity(180) // 180 days

    console.log(
      `✅ Cleanup completed. Deleted ${deletedCount} old activity logs.`,
    )

    return Promise.resolve()
  } catch (error) {
    console.error('❌ Error during activity cleanup:', error)
    throw error
  }
}

/**
 * Clean up old notification logs (older than 30 days)
 * Notifications are less critical than activity logs
 */
export async function cleanupOldNotifications(): Promise<void> {
  try {
    console.log('🧹 Starting cleanup of old notifications...')

    // TODO: Implement notification cleanup when notifications table is ready
    console.log('ℹ️ Notification cleanup not yet implemented')

    return Promise.resolve()
  } catch (error) {
    console.error('❌ Error during notification cleanup:', error)
    throw error
  }
}

/**
 * Run all cleanup operations
 */
export async function runFullCleanup(): Promise<void> {
  try {
    console.log('🧹 Starting full activity system cleanup...')

    await Promise.all([cleanupOldActivityLogs(), cleanupOldNotifications()])

    console.log('✅ Full cleanup completed successfully')
  } catch (error) {
    console.error('❌ Error during full cleanup:', error)
    throw error
  }
}

// Export for use in scripts or cron jobs
export default runFullCleanup
