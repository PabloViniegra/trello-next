import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { cardLabel, label } from '@/db/schema'
import type { TLabel, TLabelWithCardCount } from './types'

/**
 * Get all labels for a specific board
 */
export async function getLabelsByBoardId(boardId: string): Promise<TLabel[]> {
  return db.query.label.findMany({
    where: eq(label.boardId, boardId),
    orderBy: (label, { asc }) => [asc(label.createdAt)],
  })
}

/**
 * Get a specific label by ID
 */
export async function getLabelById(labelId: string): Promise<TLabel | null> {
  const result = await db.query.label.findFirst({
    where: eq(label.id, labelId),
  })

  return result || null
}

/**
 * Get all labels for a board with card count
 */
export async function getLabelsWithCardCount(
  boardId: string,
): Promise<TLabelWithCardCount[]> {
  const labels = await db
    .select({
      id: label.id,
      name: label.name,
      color: label.color,
      boardId: label.boardId,
      createdAt: label.createdAt,
      cardCount: sql<number>`COUNT(${cardLabel.id})::int`,
    })
    .from(label)
    .leftJoin(cardLabel, eq(label.id, cardLabel.labelId))
    .where(eq(label.boardId, boardId))
    .groupBy(label.id)
    .orderBy(label.createdAt)

  return labels
}

/**
 * Get all labels assigned to a specific card
 */
export async function getLabelsByCardId(cardId: string): Promise<TLabel[]> {
  const result = await db
    .select({
      id: label.id,
      name: label.name,
      color: label.color,
      boardId: label.boardId,
      createdAt: label.createdAt,
    })
    .from(label)
    .innerJoin(cardLabel, eq(label.id, cardLabel.labelId))
    .where(eq(cardLabel.cardId, cardId))
    .orderBy(label.createdAt)

  return result
}
