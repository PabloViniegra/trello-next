/**
 * Notification Types and Constants
 */

export const NOTIFICATION_TYPES = {
  CARD_ASSIGNED: 'card.assigned',
  CARD_DUE_SOON: 'card.due_soon',
  CARD_OVERDUE: 'card.overdue',
  MEMBER_ADDED: 'member.added',
  BOARD_SHARED: 'board.shared',
  CARD_MOVED: 'card.moved',
  LABEL_ASSIGNED: 'label.assigned',
} as const

export type TNotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type TNotificationPriority =
  (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES]

export const DIGEST_FREQUENCIES = {
  INSTANT: 'instant',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const

export type TDigestFrequency =
  (typeof DIGEST_FREQUENCIES)[keyof typeof DIGEST_FREQUENCIES]

/**
 * Notification from database
 */
export type TNotification = {
  id: string
  userId: string
  activityId: string | null
  title: string
  message: string
  notificationType: TNotificationType
  isRead: number // 0 = false, 1 = true (SQLite boolean)
  readAt: Date | null
  metadata: Record<string, unknown>
  priority: TNotificationPriority
  createdAt: Date
}

/**
 * Notification with user data joined
 */
export type TNotificationWithActivity = TNotification & {
  activity?: {
    id: string
    actionType: string
    entityType: string
    entityId: string
    boardId: string
    user?: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }
}

/**
 * User notification preferences
 */
export type TUserNotificationPreferences = {
  id: string
  userId: string
  emailNotifications: number // 0 = false, 1 = true
  pushNotifications: number
  notifyCardAssigned: number
  notifyCardDue: number
  notifyCardComments: number
  notifyBoardUpdates: number
  notifyMentions: number
  digestFrequency: TDigestFrequency
  createdAt: Date
  updatedAt: Date
}
