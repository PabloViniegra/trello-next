'use server'

import { db } from '@/db'
import { user, session } from '@/auth-schema'
import { board, cardMember, boardMember } from '@/db/schema'
import { eq, count, and, sql } from 'drizzle-orm'
import type { TUserStats, TUserDetails } from './types'

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
export async function getUserDetails(userId: string): Promise<TUserDetails | null> {
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
        and(
          eq(session.userId, userId),
          sql`${session.expiresAt} > ${now}`
        )
      )

    return activeSessions[0]?.count ?? 0
  } catch (error) {
    console.error('Error getting active sessions:', error)
    return 0
  }
}
