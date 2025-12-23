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
import type { TActivityLogWithUser, TEntityType } from './types'

// =============================================================================
// ACTIVITY QUERIES
// =============================================================================

/**
 * Get activity logs for a specific board
 */
export const getActivityByBoard = unstable_cache(
  async (
    boardId: string,
    limit = 50,
    offset = 0,
  ): Promise<TActivityLogWithUser[]> => {
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

    return results.map((activity) => ({
      ...activity,
      metadata: JSON.parse(activity.metadata),
      previousValues: JSON.parse(activity.previousValues),
      newValues: JSON.parse(activity.newValues),
    })) as TActivityLogWithUser[]
  },
  ['activity-by-board'],
  {
    tags: ['activity'],
    revalidate: 30, // 30 seconds
  },
)

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

    // Parse JSON fields
    return activities.map((activity) => ({
      ...activity,
      metadata: JSON.parse(activity.metadata || '{}') as Record<
        string,
        unknown
      >,
      previousValues: JSON.parse(activity.previousValues || '{}') as Record<
        string,
        unknown
      >,
      newValues: JSON.parse(activity.newValues || '{}') as Record<
        string,
        unknown
      >,
    }))
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

    // Parse JSON fields
    return activities.map((activity) => ({
      ...activity,
      metadata: JSON.parse(activity.metadata || '{}') as Record<
        string,
        unknown
      >,
      previousValues: JSON.parse(activity.previousValues || '{}') as Record<
        string,
        unknown
      >,
      newValues: JSON.parse(activity.newValues || '{}') as Record<
        string,
        unknown
      >,
    }))
  },
  ['activity-by-entity'],
  {
    tags: ['activity'],
    revalidate: 30,
  },
)

/**
 * Get recent activity (no cache, for real-time updates)
 */
export async function getRecentActivity(
  boardId: string,
  limit = 10,
): Promise<TActivityLogWithUser[]> {
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

  // Parse JSON fields
  return activities.map((activity) => ({
    ...activity,
    metadata: JSON.parse(activity.metadata || '{}') as Record<string, unknown>,
    previousValues: JSON.parse(activity.previousValues || '{}') as Record<
      string,
      unknown
    >,
    newValues: JSON.parse(activity.newValues || '{}') as Record<
      string,
      unknown
    >,
  }))
}
