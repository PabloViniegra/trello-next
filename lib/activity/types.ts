/**
 * Activity and Audit System Types
 * Defines all types related to activity logging and audit trail
 */

import type { InferSelectModel } from 'drizzle-orm'
import type { activityLog } from '@/db/schema'

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

export const ACTIVITY_TYPES = {
  // Board actions
  BOARD_CREATED: 'board.created',
  BOARD_UPDATED: 'board.updated',
  BOARD_DELETED: 'board.deleted',

  // List actions
  LIST_CREATED: 'list.created',
  LIST_UPDATED: 'list.updated',
  LIST_DELETED: 'list.deleted',
  LIST_REORDERED: 'list.reordered',

  // Card actions
  CARD_CREATED: 'card.created',
  CARD_UPDATED: 'card.updated',
  CARD_DELETED: 'card.deleted',
  CARD_MOVED: 'card.moved',
  CARD_REORDERED: 'card.reordered',
  CARD_MEMBER_ADDED: 'card.member.added',
  CARD_MEMBER_REMOVED: 'card.member.removed',

  // Card attachment actions
  ATTACHMENT_ADDED: 'card.attachment.added',
  ATTACHMENT_REMOVED: 'card.attachment.removed',

  // Comment actions
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',

  // Label actions
  LABEL_CREATED: 'label.created',
  LABEL_UPDATED: 'label.updated',
  LABEL_DELETED: 'label.deleted',
  LABEL_ASSIGNED: 'label.assigned',
  LABEL_REMOVED: 'label.removed',

  // Board member actions
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
} as const

export type TActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES]

export const ENTITY_TYPES = {
  BOARD: 'board',
  LIST: 'list',
  CARD: 'card',
  LABEL: 'label',
  MEMBER: 'member',
  COMMENT: 'comment',
} as const

export type TEntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES]

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type TActivityLog = InferSelectModel<typeof activityLog>

export type TActivityLogWithUser = Omit<
  TActivityLog,
  'metadata' | 'previousValues' | 'newValues'
> & {
  metadata: Record<string, unknown>
  previousValues: Record<string, unknown>
  newValues: Record<string, unknown>
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  } | null
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export type TLogActivityInput = {
  userId: string
  actionType: TActivityType
  entityType: TEntityType
  entityId: string
  boardId: string
  metadata?: Record<string, unknown>
  previousValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

// =============================================================================
// METADATA TYPES
// =============================================================================

export type TBoardMetadata = {
  boardTitle?: string
  titleChanged?: boolean
  descriptionChanged?: boolean
  backgroundChanged?: boolean
  privacyChanged?: boolean
}

export type TListMetadata = {
  listTitle?: string
  titleChanged?: boolean
  positionChanged?: boolean
  fromPosition?: number
  toPosition?: number
}

export type TCardMetadata = {
  cardTitle?: string
  titleChanged?: boolean
  descriptionChanged?: boolean
  dueDateChanged?: boolean
  fromList?: string
  toList?: string
  fromPosition?: number
  toPosition?: number
}

export type TLabelMetadata = {
  labelName?: string
  cardTitle?: string
  nameChanged?: boolean
  colorChanged?: boolean
}

export type TMemberMetadata = {
  memberName?: string
  memberEmail?: string
  role?: string
}

/**
 * Union type of all possible metadata types
 */
export type TActivityMetadata =
  | TBoardMetadata
  | TListMetadata
  | TCardMetadata
  | TLabelMetadata
  | TMemberMetadata
  | Record<string, unknown>
