/**
 * Comment Types
 * Defines all types related to card comments
 */

import type { InferSelectModel } from 'drizzle-orm'
import type { comment } from '@/db/schema'

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type TComment = InferSelectModel<typeof comment>

export type TCommentWithUser = TComment & {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

// =============================================================================
// MENTION TYPES
// =============================================================================

export type TMention = {
  userId: string
  userName: string
  userEmail: string
}

export type TCommentWithMentions = TCommentWithUser & {
  mentions: TMention[]
}
