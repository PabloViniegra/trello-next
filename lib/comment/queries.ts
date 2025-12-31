/**
 * Comment Database Queries
 * Pure database operations for comments
 */

import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { comment } from '@/db/schema'
import type { TComment, TCommentWithUser } from './types'

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get all comments for a card
 */
export async function getCommentsByCardId(
  cardId: string,
): Promise<TCommentWithUser[]> {
  const comments = await db.query.comment.findMany({
    where: eq(comment.cardId, cardId),
    orderBy: [desc(comment.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return comments
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(
  id: string,
): Promise<TCommentWithUser | undefined> {
  const result = await db.query.comment.findFirst({
    where: eq(comment.id, id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return result
}

/**
 * Get comment count for a card
 */
export async function getCommentCountByCardId(cardId: string): Promise<number> {
  const comments = await db.query.comment.findMany({
    where: eq(comment.cardId, cardId),
    columns: {
      id: true,
    },
  })

  return comments.length
}

// =============================================================================
// CREATE OPERATIONS
// =============================================================================

/**
 * Create a new comment
 */
export async function createComment(data: {
  id: string
  cardId: string
  userId: string
  content: string
}): Promise<TComment> {
  const [newComment] = await db.insert(comment).values(data).returning()

  return newComment
}

// =============================================================================
// UPDATE OPERATIONS
// =============================================================================

/**
 * Update a comment's content
 */
export async function updateComment(
  id: string,
  content: string,
): Promise<TComment | undefined> {
  const [updatedComment] = await db
    .update(comment)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(comment.id, id))
    .returning()

  return updatedComment
}

// =============================================================================
// DELETE OPERATIONS
// =============================================================================

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
  await db.delete(comment).where(eq(comment.id, id))
}
