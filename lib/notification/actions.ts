/**
 * Notification Server Actions
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/db'
import { notification, userNotificationPreferences } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logger } from '@/lib/utils/logger'
import {
  getAllNotifications,
  getNotificationCount,
  getUserPreferences,
} from './queries'
import type {
  TDeleteNotificationInput,
  TMarkAllAsReadInput,
  TMarkAsReadInput,
  TUpdatePreferencesInput,
} from './schemas'
import {
  deleteNotificationSchema,
  markAllAsReadSchema,
  markAsReadSchema,
  updatePreferencesSchema,
} from './schemas'

/**
 * Get user's notifications
 */
export async function getNotificationsAction(limit = 50, offset = 0) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const notifications = await getAllNotifications(user.id, limit, offset)
    const count = await getNotificationCount(user.id)

    return {
      success: true,
      notifications,
      unreadCount: count,
    }
  } catch (error) {
    logger.error('Error getting notifications', error)
    return {
      success: false,
      error: 'Error al obtener notificaciones',
    }
  }
}

/**
 * Mark notification as read
 */
export async function markAsReadAction(input: TMarkAsReadInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const validated = markAsReadSchema.parse(input)

    // Verify notification belongs to user
    const existingNotification = await db.query.notification.findFirst({
      where: (n, { eq }) => eq(n.id, validated.notificationId),
    })

    if (!existingNotification) {
      return { success: false, error: 'Notificación no encontrada' }
    }

    if (existingNotification.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para esta acción' }
    }

    // Mark as read
    await db
      .update(notification)
      .set({
        isRead: 1,
        readAt: new Date(),
      })
      .where(eq(notification.id, validated.notificationId))

    revalidateTag('notifications', { expire: 0 })
    revalidatePath('/notifications', 'page')

    return { success: true }
  } catch (error) {
    logger.error('Error marking notification as read', error, { input })
    return {
      success: false,
      error: 'Error al marcar notificación como leída',
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsReadAction(input?: TMarkAllAsReadInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const validated = markAllAsReadSchema.parse({
      userId: input?.userId || user.id,
    })

    // Verify user is marking their own notifications
    if (validated.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para esta acción' }
    }

    // Mark all as read
    await db
      .update(notification)
      .set({
        isRead: 1,
        readAt: new Date(),
      })
      .where(eq(notification.userId, validated.userId))

    revalidateTag('notifications', { expire: 0 })
    revalidatePath('/notifications', 'page')

    logger.info('All notifications marked as read', { userId: user.id })

    return { success: true }
  } catch (error) {
    logger.error('Error marking all notifications as read', error, { input })
    return {
      success: false,
      error: 'Error al marcar todas las notificaciones como leídas',
    }
  }
}

/**
 * Delete notification
 */
export async function deleteNotificationAction(
  input: TDeleteNotificationInput,
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const validated = deleteNotificationSchema.parse(input)

    // Verify notification belongs to user
    const existingNotification = await db.query.notification.findFirst({
      where: (n, { eq }) => eq(n.id, validated.notificationId),
    })

    if (!existingNotification) {
      return { success: false, error: 'Notificación no encontrada' }
    }

    if (existingNotification.userId !== user.id) {
      return { success: false, error: 'No tienes permiso para esta acción' }
    }

    // Delete notification
    await db
      .delete(notification)
      .where(eq(notification.id, validated.notificationId))

    revalidateTag('notifications', { expire: 0 })
    revalidatePath('/notifications', 'page')

    logger.info('Notification deleted', {
      notificationId: validated.notificationId,
    })

    return { success: true }
  } catch (error) {
    logger.error('Error deleting notification', error, { input })
    return {
      success: false,
      error: 'Error al eliminar notificación',
    }
  }
}

/**
 * Get user notification preferences
 */
export async function getPreferencesAction() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const preferences = await getUserPreferences(user.id)

    return {
      success: true,
      preferences,
    }
  } catch (error) {
    logger.error('Error getting notification preferences', error)
    return {
      success: false,
      error: 'Error al obtener preferencias',
    }
  }
}

/**
 * Update user notification preferences
 */
export async function updatePreferencesAction(input: TUpdatePreferencesInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const validated = updatePreferencesSchema.parse(input)

    // Get existing preferences (creates if not exists)
    const existing = await getUserPreferences(user.id)

    // Convert boolean inputs to integers (0 or 1)
    const updateData: Record<string, number | string> = {}

    if (validated.emailNotifications !== undefined) {
      updateData.emailNotifications = validated.emailNotifications ? 1 : 0
    }
    if (validated.pushNotifications !== undefined) {
      updateData.pushNotifications = validated.pushNotifications ? 1 : 0
    }
    if (validated.notifyCardAssigned !== undefined) {
      updateData.notifyCardAssigned = validated.notifyCardAssigned ? 1 : 0
    }
    if (validated.notifyCardDue !== undefined) {
      updateData.notifyCardDue = validated.notifyCardDue ? 1 : 0
    }
    if (validated.notifyCardComments !== undefined) {
      updateData.notifyCardComments = validated.notifyCardComments ? 1 : 0
    }
    if (validated.notifyBoardUpdates !== undefined) {
      updateData.notifyBoardUpdates = validated.notifyBoardUpdates ? 1 : 0
    }
    if (validated.notifyMentions !== undefined) {
      updateData.notifyMentions = validated.notifyMentions ? 1 : 0
    }
    if (validated.digestFrequency !== undefined) {
      updateData.digestFrequency = validated.digestFrequency
    }

    // Update preferences
    await db
      .update(userNotificationPreferences)
      .set(updateData)
      .where(eq(userNotificationPreferences.id, existing.id))

    revalidateTag('notification-preferences', { expire: 0 })
    revalidatePath('/settings/notifications', 'page')

    logger.info('Notification preferences updated', { userId: user.id })

    return { success: true }
  } catch (error) {
    logger.error('Error updating notification preferences', error, { input })
    return {
      success: false,
      error: 'Error al actualizar preferencias',
    }
  }
}
