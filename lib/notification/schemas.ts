/**
 * Notification Zod Schemas
 */

import { z } from 'zod'
import {
  DIGEST_FREQUENCIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
} from './types'

/**
 * Notification type validation
 */
export const notificationTypeSchema = z.enum([
  NOTIFICATION_TYPES.CARD_ASSIGNED,
  NOTIFICATION_TYPES.CARD_DUE_SOON,
  NOTIFICATION_TYPES.CARD_OVERDUE,
  NOTIFICATION_TYPES.MEMBER_ADDED,
  NOTIFICATION_TYPES.BOARD_SHARED,
  NOTIFICATION_TYPES.CARD_MOVED,
  NOTIFICATION_TYPES.LABEL_ASSIGNED,
  NOTIFICATION_TYPES.COMMENT_CREATED,
  NOTIFICATION_TYPES.COMMENT_MENTION,
])

/**
 * Priority validation
 */
export const notificationPrioritySchema = z.enum([
  NOTIFICATION_PRIORITIES.LOW,
  NOTIFICATION_PRIORITIES.NORMAL,
  NOTIFICATION_PRIORITIES.HIGH,
  NOTIFICATION_PRIORITIES.URGENT,
])

/**
 * Digest frequency validation
 */
export const digestFrequencySchema = z.enum([
  DIGEST_FREQUENCIES.INSTANT,
  DIGEST_FREQUENCIES.HOURLY,
  DIGEST_FREQUENCIES.DAILY,
  DIGEST_FREQUENCIES.WEEKLY,
])

/**
 * Create notification input
 */
export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID es requerido'),
  activityId: z.string().optional(),
  title: z.string().min(1, 'Título es requerido').max(255),
  message: z.string().min(1, 'Mensaje es requerido'),
  notificationType: notificationTypeSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  priority: notificationPrioritySchema.default(NOTIFICATION_PRIORITIES.NORMAL),
})

export type TCreateNotificationInput = z.infer<typeof createNotificationSchema>

/**
 * Mark notification as read input
 */
export const markAsReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID es requerido'),
})

export type TMarkAsReadInput = z.infer<typeof markAsReadSchema>

/**
 * Mark all as read input
 */
export const markAllAsReadSchema = z.object({
  userId: z.string().min(1, 'User ID es requerido'),
})

export type TMarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>

/**
 * Delete notification input
 */
export const deleteNotificationSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID es requerido'),
})

export type TDeleteNotificationInput = z.infer<typeof deleteNotificationSchema>

/**
 * Update user preferences input
 */
export const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  notifyCardAssigned: z.boolean().optional(),
  notifyCardDue: z.boolean().optional(),
  notifyCardComments: z.boolean().optional(),
  notifyBoardUpdates: z.boolean().optional(),
  notifyMentions: z.boolean().optional(),
  digestFrequency: digestFrequencySchema.optional(),
})

export type TUpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
