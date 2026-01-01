'use server'

import { and, count, eq, sql } from 'drizzle-orm'
import { session, user } from '@/auth-schema'
import { db } from '@/db'
import {
  board,
  boardMember,
  card,
  cardLabel,
  cardMember,
  comment,
  label,
  list,
} from '@/db/schema'
import type { TUserAnalytics, TUserDetails, TUserStats } from './types'

/**
 * Get user statistics including boards, cards, and collaboration data
 */
export async function getUserStats(userId: string): Promise<TUserStats> {
  try {
    // Get boards owned by user
    const ownedBoards = await db
      .select({ count: count() })
      .from(board)
      .where(eq(board.ownerId, userId))

    // Get boards where user is a member (collaborator)
    const collaboratingBoards = await db
      .select({ count: count() })
      .from(boardMember)
      .where(eq(boardMember.userId, userId))

    // Get cards assigned to user
    const assignedCards = await db
      .select({ count: count() })
      .from(cardMember)
      .where(eq(cardMember.userId, userId))

    return {
      totalBoardsOwned: ownedBoards[0]?.count ?? 0,
      totalBoardsCollaborating: collaboratingBoards[0]?.count ?? 0,
      totalCardsAssigned: assignedCards[0]?.count ?? 0,
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      totalBoardsOwned: 0,
      totalBoardsCollaborating: 0,
      totalCardsAssigned: 0,
    }
  }
}

/**
 * Get detailed user information including account creation date
 */
export async function getUserDetails(
  userId: string,
): Promise<TUserDetails | null> {
  try {
    const userDetails = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!userDetails[0]) {
      return null
    }

    return {
      id: userDetails[0].id,
      name: userDetails[0].name,
      email: userDetails[0].email,
      emailVerified: userDetails[0].emailVerified,
      image: userDetails[0].image || undefined,
      createdAt: userDetails[0].createdAt,
      updatedAt: userDetails[0].updatedAt,
    }
  } catch (error) {
    console.error('Error getting user details:', error)
    return null
  }
}

/**
 * Get user's active sessions count
 */
export async function getUserActiveSessions(userId: string): Promise<number> {
  try {
    const now = new Date()
    const activeSessions = await db
      .select({ count: count() })
      .from(session)
      .where(
        and(eq(session.userId, userId), sql`${session.expiresAt} > ${now}`),
      )

    return activeSessions[0]?.count ?? 0
  } catch (error) {
    console.error('Error getting active sessions:', error)
    return 0
  }
}

/**
 * Get user analytics data for visualizations
 */
export async function getUserAnalytics(
  userId: string,
): Promise<TUserAnalytics> {
  try {
    // Get board activity data
    const boardActivityQuery = db
      .select({
        boardName: board.title,
        boardId: board.id,
        totalCards: sql<number>`count(distinct ${card.id})`.as('total_cards'),
        completedCards:
          sql<number>`count(distinct case when ${card.dueDate} is not null and ${card.dueDate} < now() then ${card.id} end)`.as(
            'completed_cards',
          ),
        activeMembers: sql<number>`count(distinct ${boardMember.userId})`.as(
          'active_members',
        ),
      })
      .from(board)
      .leftJoin(list, eq(list.boardId, board.id))
      .leftJoin(card, eq(card.listId, list.id))
      .leftJoin(boardMember, eq(boardMember.boardId, board.id))
      .where(
        sql`${board.ownerId} = ${userId} or ${board.id} in (
          select ${boardMember.boardId} from ${boardMember} where ${boardMember.userId} = ${userId}
        )`,
      )
      .groupBy(board.id, board.title)
      .limit(5)

    // Get label usage data
    const labelUsageQuery = db
      .select({
        labelName: sql<string>`coalesce(${label.name}, 'Sin nombre')`.as(
          'label_name',
        ),
        color: label.color,
        count: sql<number>`count(${cardLabel.id})`.as('count'),
      })
      .from(cardLabel)
      .innerJoin(label, eq(label.id, cardLabel.labelId))
      .innerJoin(card, eq(card.id, cardLabel.cardId))
      .innerJoin(cardMember, eq(cardMember.cardId, card.id))
      .where(eq(cardMember.userId, userId))
      .groupBy(label.id, label.name, label.color)
      .orderBy(sql`count desc`)
      .limit(8)

    // Get activity timeline for last 8 weeks
    const activityTimelineQuery = db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${card.createdAt}), 'DD/MM')`.as(
          'week',
        ),
        cards: sql<number>`count(distinct ${card.id})`.as('cards'),
        comments: sql<number>`count(distinct ${comment.id})`.as('comments'),
        boards: sql<number>`count(distinct ${board.id})`.as('boards'),
      })
      .from(card)
      .leftJoin(cardMember, eq(cardMember.cardId, card.id))
      .leftJoin(comment, eq(comment.cardId, card.id))
      .leftJoin(list, eq(list.id, card.listId))
      .leftJoin(board, eq(board.id, list.boardId))
      .where(
        sql`${cardMember.userId} = ${userId} and ${card.createdAt} > now() - interval '8 weeks'`,
      )
      .groupBy(sql`date_trunc('week', ${card.createdAt})`)
      .orderBy(sql`date_trunc('week', ${card.createdAt})`)

    // Get card status over time (last 30 days)
    const cardStatusQuery = db
      .select({
        date: sql<string>`to_char(${card.createdAt}, 'DD/MM')`.as('date'),
        total: sql<number>`count(${card.id})`.as('total'),
        completed:
          sql<number>`count(case when ${card.dueDate} is not null and ${card.dueDate} < now() then 1 end)`.as(
            'completed',
          ),
        pending:
          sql<number>`count(case when ${card.dueDate} is null or ${card.dueDate} >= now() then 1 end)`.as(
            'pending',
          ),
      })
      .from(card)
      .innerJoin(cardMember, eq(cardMember.cardId, card.id))
      .where(
        sql`${cardMember.userId} = ${userId} and ${card.createdAt} > now() - interval '30 days'`,
      )
      .groupBy(sql`to_char(${card.createdAt}, 'DD/MM')`)
      .orderBy(sql`to_char(${card.createdAt}, 'DD/MM')`)

    const [boardActivity, labelUsage, activityTimeline, cardStatus] =
      await Promise.all([
        boardActivityQuery,
        labelUsageQuery,
        activityTimelineQuery,
        cardStatusQuery,
      ])

    return {
      boardActivity: boardActivity.map((row) => ({
        boardName: row.boardName,
        totalCards: Number(row.totalCards),
        completedCards: Number(row.completedCards),
        activeMembers: Number(row.activeMembers),
      })),
      labelUsage: labelUsage.map((row) => ({
        labelName: row.labelName,
        color: row.color,
        count: Number(row.count),
      })),
      activityTimeline: activityTimeline.map((row) => ({
        week: row.week,
        cards: Number(row.cards),
        comments: Number(row.comments),
        boards: Number(row.boards),
      })),
      cardStatusOverTime: cardStatus.map((row) => ({
        date: row.date,
        total: Number(row.total),
        completed: Number(row.completed),
        pending: Number(row.pending),
      })),
    }
  } catch (error) {
    console.error('Error getting user analytics:', error)
    return {
      boardActivity: [],
      labelUsage: [],
      activityTimeline: [],
      cardStatusOverTime: [],
    }
  }
}
