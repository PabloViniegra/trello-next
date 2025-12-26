/**
 * Notification Service
 * Handles creation and management of notifications
 */

import { db } from '@/db'
import { notification } from '@/db/schema'
import { logger } from '@/lib/utils/logger'
import { shouldNotifyUser } from './queries'
import type { TCreateNotificationInput } from './schemas'
import { createNotificationSchema } from './schemas'

/**
 * Create a new notification
 */
export async function createNotification(
  input: TCreateNotificationInput,
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // Validate input
    const validated = createNotificationSchema.parse(input)

    // Check if user should receive this notification
    const shouldNotify = await shouldNotifyUser(
      validated.userId,
      validated.notificationType,
    )

    if (!shouldNotify) {
      logger.debug('User preferences disabled this notification', {
        userId: validated.userId,
        notificationType: validated.notificationType,
      })
      return { success: true } // Don't treat as error
    }

    // Check for duplicate recent notifications (spam prevention)
    const isDuplicate = await checkDuplicateNotification(
      validated.userId,
      validated.notificationType,
      validated.metadata,
    )

    if (isDuplicate) {
      logger.debug('Duplicate notification prevented', {
        userId: validated.userId,
        notificationType: validated.notificationType,
      })
      return { success: true } // Don't treat as error
    }

    // Create notification
    const [newNotification] = await db
      .insert(notification)
      .values({
        id: crypto.randomUUID(),
        userId: validated.userId,
        activityId: validated.activityId || null,
        title: validated.title,
        message: validated.message,
        notificationType: validated.notificationType,
        metadata: validated.metadata,
        priority: validated.priority,
        isRead: 0,
        readAt: null,
      })
      .returning()

    logger.info('Notification created', {
      notificationId: newNotification.id,
      userId: validated.userId,
      type: validated.notificationType,
    })

    return { success: true, notificationId: newNotification.id }
  } catch (error) {
    logger.error('Error creating notification', error, { input })
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al crear notificación',
    }
  }
}

/**
 * Check if a similar notification was recently created (spam prevention)
 */
async function checkDuplicateNotification(
  userId: string,
  notificationType: string,
  metadata: Record<string, unknown>,
  windowMinutes = 5,
): Promise<boolean> {
  try {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000)

    // This is a simplified check - in production, you might want to check metadata too
    const recent = await db.query.notification.findFirst({
      where: (n, { and, eq, gte }) =>
        and(
          eq(n.userId, userId),
          eq(n.notificationType, notificationType),
          gte(n.createdAt, cutoffTime),
        ),
    })

    return !!recent
  } catch (error) {
    logger.error('Error checking duplicate notification', error, {
      userId,
      notificationType,
    })
    return false
  }
}

/**
 * Create notification from activity
 * Determines who should be notified based on activity type
 */
export async function createNotificationFromActivity(
  activityId: string,
  actionType: string,
  entityType: string,
  metadata: Record<string, unknown>,
  boardId: string,
): Promise<void> {
  try {
    // Determine notification recipients based on action type
    const recipients = await determineNotificationRecipients(
      actionType,
      entityType,
      metadata,
      boardId,
    )

    if (recipients.length === 0) {
      return
    }

    // Create notification for each recipient
    const notifications = recipients.map((recipient) =>
      createNotification({
        userId: recipient.userId,
        activityId,
        title: recipient.title,
        message: recipient.message,
        notificationType: recipient.notificationType,
        metadata: recipient.metadata || {},
        priority: recipient.priority || 'normal',
      }),
    )

    await Promise.all(notifications)

    logger.info('Notifications created from activity', {
      activityId,
      actionType,
      recipientCount: recipients.length,
    })
  } catch (error) {
    logger.error('Error creating notifications from activity', error, {
      activityId,
      actionType,
    })
  }
}

/**
 * Determine who should receive notifications for an activity
 */
async function determineNotificationRecipients(
  actionType: string,
  _entityType: string,
  _metadata: Record<string, unknown>,
  boardId: string,
): Promise<
  Array<{
    userId: string
    title: string
    message: string
    notificationType:
      | 'card.assigned'
      | 'card.due_soon'
      | 'card.overdue'
      | 'member.added'
      | 'board.shared'
      | 'card.moved'
      | 'label.assigned'
    metadata?: Record<string, unknown>
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  }>
> {
  const recipients: Array<{
    userId: string
    title: string
    message: string
    notificationType:
      | 'card.assigned'
      | 'card.due_soon'
      | 'card.overdue'
      | 'member.added'
      | 'board.shared'
      | 'card.moved'
      | 'label.assigned'
    metadata?: Record<string, unknown>
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  }> = []

  const metadata = _metadata

  // Card assigned - notify the assigned user
  if (
    actionType === 'card.updated' &&
    metadata.assignedUserId &&
    typeof metadata.assignedUserId === 'string'
  ) {
    recipients.push({
      userId: metadata.assignedUserId,
      title: 'Te asignaron una tarjeta',
      message: `Te han asignado la tarjeta "${metadata.cardTitle || 'Sin título'}"`,
      notificationType: 'card.assigned',
      metadata: {
        cardId: metadata.cardId,
        cardTitle: metadata.cardTitle,
        boardId,
      },
      priority: 'high',
    })
  }

  // Member added to board - notify the new member
  if (actionType === 'member.added' && typeof metadata.memberId === 'string') {
    recipients.push({
      userId: metadata.memberId,
      title: 'Te agregaron a un tablero',
      message: `Te han agregado al tablero "${metadata.boardTitle || 'Sin título'}"`,
      notificationType: 'member.added',
      metadata: {
        boardId,
        boardTitle: metadata.boardTitle,
      },
      priority: 'normal',
    })
  }

  // TODO: Add more notification rules:
  // - Card due soon
  // - Card overdue
  // - Card moved (if user is watching)
  // - Label assigned (if user is watching)
  // - Mentions in comments (future)

  return recipients
}
