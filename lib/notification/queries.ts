/**
 * Notification Database Queries
 */

import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import {
  activityLog,
  notification,
  userNotificationPreferences,
} from '@/db/schema'
import type {
  TNotification,
  TNotificationWithActivity,
  TUserNotificationPreferences,
} from './types'
import { logger } from '@/lib/utils/logger'

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<TNotificationWithActivity[]> {
  try {
    const notifications = await db
      .select({
        id: notification.id,
        userId: notification.userId,
        activityId: notification.activityId,
        title: notification.title,
        message: notification.message,
        notificationType: notification.notificationType,
        isRead: notification.isRead,
        readAt: notification.readAt,
        metadata: notification.metadata,
        priority: notification.priority,
        createdAt: notification.createdAt,
        activity: {
          id: activityLog.id,
          actionType: activityLog.actionType,
          entityType: activityLog.entityType,
          entityId: activityLog.entityId,
          boardId: activityLog.boardId,
        },
      })
      .from(notification)
      .leftJoin(activityLog, eq(notification.activityId, activityLog.id))
      .where(and(eq(notification.userId, userId), eq(notification.isRead, 0)))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset)

    return notifications as TNotificationWithActivity[]
  } catch (error) {
    logger.error('Error getting unread notifications', error, { userId })
    throw error
  }
}

/**
 * Get all notifications for a user (read and unread)
 */
export async function getAllNotifications(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<TNotificationWithActivity[]> {
  try {
    const notifications = await db
      .select({
        id: notification.id,
        userId: notification.userId,
        activityId: notification.activityId,
        title: notification.title,
        message: notification.message,
        notificationType: notification.notificationType,
        isRead: notification.isRead,
        readAt: notification.readAt,
        metadata: notification.metadata,
        priority: notification.priority,
        createdAt: notification.createdAt,
        activity: {
          id: activityLog.id,
          actionType: activityLog.actionType,
          entityType: activityLog.entityType,
          entityId: activityLog.entityId,
          boardId: activityLog.boardId,
        },
      })
      .from(notification)
      .leftJoin(activityLog, eq(notification.activityId, activityLog.id))
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset)

    return notifications as TNotificationWithActivity[]
  } catch (error) {
    logger.error('Error getting all notifications', error, { userId })
    throw error
  }
}

/**
 * Get unread notification count for a user
 */
export async function getNotificationCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(notification)
      .where(and(eq(notification.userId, userId), eq(notification.isRead, 0)))

    return result[0]?.count || 0
  } catch (error) {
    logger.error('Error getting notification count', error, { userId })
    return 0
  }
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(
  notificationId: string,
): Promise<TNotification | null> {
  try {
    const result = await db
      .select()
      .from(notification)
      .where(eq(notification.id, notificationId))
      .limit(1)

    return (result[0] as TNotification) || null
  } catch (error) {
    logger.error('Error getting notification by ID', error, { notificationId })
    throw error
  }
}

/**
 * Get user notification preferences
 * Creates default preferences if they don't exist
 */
export async function getUserPreferences(
  userId: string,
): Promise<TUserNotificationPreferences> {
  try {
    // Try to get existing preferences
    let preferences = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId))
      .limit(1)

    // If no preferences exist, create default ones
    if (!preferences[0]) {
      const newPreferences = await db
        .insert(userNotificationPreferences)
        .values({
          id: crypto.randomUUID(),
          userId,
          emailNotifications: 1,
          pushNotifications: 1,
          notifyCardAssigned: 1,
          notifyCardDue: 1,
          notifyCardComments: 1,
          notifyBoardUpdates: 1, // ✅ Changed from 0 to 1
          notifyMentions: 1,
          digestFrequency: 'instant',
        })
        .returning()

      preferences = newPreferences
    }

    return preferences[0] as TUserNotificationPreferences
  } catch (error) {
    logger.error('Error getting user preferences', error, { userId })
    throw error
  }
}

/**
 * Check if user should receive a notification based on preferences
 */
export async function shouldNotifyUser(
  userId: string,
  notificationType: string,
): Promise<boolean> {
  try {
    const preferences = await getUserPreferences(userId)

    // Check digest frequency
    if (preferences.digestFrequency !== 'instant') {
      // TODO: Implement digest logic
      return false
    }

    // Check specific notification type preferences
    switch (notificationType) {
      case 'card.assigned':
        return preferences.notifyCardAssigned === 1
      case 'card.due_soon':
      case 'card.overdue':
        return preferences.notifyCardDue === 1
      case 'member.added':
      case 'board.shared':
        return preferences.notifyBoardUpdates === 1
      default:
        return true
    }
  } catch (error) {
    logger.error('Error checking if should notify user', error, {
      userId,
      notificationType,
    })
    // Default to not sending notification on error
    return false
  }
}
