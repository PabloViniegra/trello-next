/**
 * Activity Logger
 * Helper functions for logging activity and triggering notifications
 */

'use server'

import { lt } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { db } from '@/db'
import { activityLog } from '@/db/schema'
import type { TLogActivityInput } from './types'

// =============================================================================
// ACTIVITY LOGGER
// =============================================================================

/**
 * Log an activity to the database
 * This is the main function to record all user actions in the system
 */
export async function logActivity(input: TLogActivityInput): Promise<void> {
  try {
    // Insert activity log - Drizzle handles JSON serialization
    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId: input.userId,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: input.entityId,
      boardId: input.boardId,
      metadata: JSON.stringify(input.metadata || {}),
      previousValues: JSON.stringify(input.previousValues || {}),
      newValues: JSON.stringify(input.newValues || {}),
    })

    // Revalidate activity cache
    revalidateTag('activity')

    // TODO: Trigger notifications if needed (Phase 4)
    // await triggerNotifications(input)
  } catch (error) {
    // Log error but don't fail the operation
    console.error('Error logging activity:', error)
  }
}

/**
 * Batch log multiple activities
 * Useful when a single action triggers multiple log entries
 */
export async function logActivities(
  inputs: TLogActivityInput[],
): Promise<void> {
  try {
    const values = inputs.map((input) => ({
      id: crypto.randomUUID(),
      userId: input.userId,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: input.entityId,
      boardId: input.boardId,
      metadata: JSON.stringify(input.metadata || {}),
      previousValues: JSON.stringify(input.previousValues || {}),
      newValues: JSON.stringify(input.newValues || {}),
    }))

    await db.insert(activityLog).values(values)

    // Revalidate activity cache
    revalidateTag('activity')
  } catch (error) {
    console.error('Error batch logging activities:', error)
  }
}

/**
 * Clear old activity logs (older than specified days)
 * Should be run via a cron job or scheduled task
 */
export async function clearOldActivity(daysToKeep = 180): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await db
      .delete(activityLog)
      .where(lt(activityLog.createdAt, cutoffDate))

    revalidateTag('activity')

    return result.rowCount || 0
  } catch (error) {
    console.error('Error clearing old activity:', error)
    return 0
  }
}
