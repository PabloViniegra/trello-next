/**
 * Activity Logger
 * Helper functions for logging activity and triggering notifications
 */

'use server'

import { lt } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { db } from '@/db'
import { activityLog } from '@/db/schema'
import { createNotificationFromActivity } from '@/lib/notification/service'
import { logger } from '@/lib/utils/logger'
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
    // Insert activity log - Drizzle handles JSONB serialization automatically
    const [activity] = await db
      .insert(activityLog)
      .values({
        id: crypto.randomUUID(),
        userId: input.userId,
        actionType: input.actionType,
        entityType: input.entityType,
        entityId: input.entityId,
        boardId: input.boardId,
        metadata: input.metadata || {},
        previousValues: input.previousValues || {},
        newValues: input.newValues || {},
      })
      .returning()

    // Revalidate activity cache
    revalidateTag('activity', { expire: 0 })

    // Trigger notifications based on activity
    logger.info('Triggering notifications for activity', {
      activityId: activity.id,
      actionType: input.actionType,
      metadata: input.metadata,
    })
    await createNotificationFromActivity(
      activity.id,
      input.actionType,
      input.entityType,
      input.metadata || {},
      input.boardId,
    )
  } catch (error) {
    // Log error but don't fail the operation - logging should never break main operations
    logger.error('Failed to log activity', error, {
      userId: input.userId,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: input.entityId,
    })
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
      metadata: input.metadata || {},
      previousValues: input.previousValues || {},
      newValues: input.newValues || {},
    }))

    const activities = await db.insert(activityLog).values(values).returning()

    // Revalidate activity cache
    revalidateTag('activity', { expire: 0 })

    // Trigger notifications for each activity
    await Promise.all(
      activities.map((activity, index) =>
        createNotificationFromActivity(
          activity.id,
          inputs[index].actionType,
          inputs[index].entityType,
          inputs[index].metadata || {},
          inputs[index].boardId,
        ),
      ),
    )
  } catch (error) {
    logger.error('Failed to batch log activities', error, {
      count: inputs.length,
    })
  }
}

/**
 * Clear old activity logs (older than specified days)
 * Should be run via a cron job or scheduled task
 */
export async function clearOldActivity(daysToKeep = 180): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  try {
    const result = await db
      .delete(activityLog)
      .where(lt(activityLog.createdAt, cutoffDate))

    revalidateTag('activity', { expire: 0 })

    return result.rowCount || 0
  } catch (error) {
    logger.error('Failed to clear old activity', error, {
      daysToKeep,
      cutoffDate: cutoffDate.toISOString(),
    })
    return 0
  }
}
