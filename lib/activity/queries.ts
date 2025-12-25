/**
 * Activity Queries
 * Database queries for activity logging
 */

'use server'

import { and, desc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { user } from '@/auth-schema'
import { db } from '@/db'
import { activityLog } from '@/db/schema'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import type { TActivityLogWithUser, TEntityType } from './types'

// =============================================================================
// ACTIVITY QUERIES
// =============================================================================

/**
 * Get activity logs for a specific board
 * Requires user to have access to the board
 */
export async function getActivityByBoard(
  boardId: string,
  userId: string,
  limit = 50,
  offset = 0,
): Promise<TActivityLogWithUser[]> {
  // Authorization check - verify user has access to board
  const hasAccess = await hasUserBoardAccess(boardId, userId)
  if (!hasAccess) {
    throw new Error('No tienes acceso a este tablero')
  }

  const results = await db
    .select({
      id: activityLog.id,
      userId: activityLog.userId,
      actionType: activityLog.actionType,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      boardId: activityLog.boardId,
      metadata: activityLog.metadata,
      previousValues: activityLog.previousValues,
      newValues: activityLog.newValues,
      createdAt: activityLog.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(activityLog)
    .leftJoin(user, eq(activityLog.userId, user.id))
    .where(eq(activityLog.boardId, boardId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset)

  // JSONB columns are automatically parsed by Drizzle
  return results as TActivityLogWithUser[]
}

/**
 * Get activity logs for a specific user
 */
export const getActivityByUser = unstable_cache(
  async (
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<TActivityLogWithUser[]> => {
    const activities = await db
      .select({
        id: activityLog.id,
        userId: activityLog.userId,
        actionType: activityLog.actionType,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        boardId: activityLog.boardId,
        metadata: activityLog.metadata,
        previousValues: activityLog.previousValues,
        newValues: activityLog.newValues,
        createdAt: activityLog.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset)

    // JSONB columns are automatically parsed by Drizzle
    return activities as TActivityLogWithUser[]
  },
  ['activity-by-user'],
  {
    tags: ['activity'],
    revalidate: 30,
  },
)

/**
 * Get activity logs for a specific entity
 */
export const getActivityByEntity = unstable_cache(
  async (
    entityType: TEntityType,
    entityId: string,
    limit = 50,
    offset = 0,
  ): Promise<TActivityLogWithUser[]> => {
    const activities = await db
      .select({
        id: activityLog.id,
        userId: activityLog.userId,
        actionType: activityLog.actionType,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        boardId: activityLog.boardId,
        metadata: activityLog.metadata,
        previousValues: activityLog.previousValues,
        newValues: activityLog.newValues,
        createdAt: activityLog.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .where(
        and(
          eq(activityLog.entityType, entityType),
          eq(activityLog.entityId, entityId),
        ),
      )
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset)

    // JSONB columns are automatically parsed by Drizzle
    return activities as TActivityLogWithUser[]
  },
  ['activity-by-entity'],
  {
    tags: ['activity'],
    revalidate: 30,
  },
)

/**
 * Get recent activity (no cache, for real-time updates)
 * Requires user to have access to the board
 */
export async function getRecentActivity(
  boardId: string,
  userId: string,
  limit = 10,
): Promise<TActivityLogWithUser[]> {
  // Authorization check - verify user has access to board
  const hasAccess = await hasUserBoardAccess(boardId, userId)
  if (!hasAccess) {
    throw new Error('No tienes acceso a este tablero')
  }

  const activities = await db
    .select({
      id: activityLog.id,
      userId: activityLog.userId,
      actionType: activityLog.actionType,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      boardId: activityLog.boardId,
      metadata: activityLog.metadata,
      previousValues: activityLog.previousValues,
      newValues: activityLog.newValues,
      createdAt: activityLog.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(activityLog)
    .leftJoin(user, eq(activityLog.userId, user.id))
    .where(eq(activityLog.boardId, boardId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)

  // JSONB columns are automatically parsed by Drizzle
  return activities as TActivityLogWithUser[]
}
