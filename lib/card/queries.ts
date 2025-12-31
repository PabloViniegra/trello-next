import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { card } from '@/db/schema'
import type { TCard } from './types'

export async function getCardsByListId(listId: string): Promise<TCard[]> {
  return db.query.card.findMany({
    where: eq(card.listId, listId),
    orderBy: [asc(card.position)],
  })
}

export async function getCardById(cardId: string): Promise<TCard | undefined> {
  return db.query.card.findFirst({
    where: eq(card.id, cardId),
  })
}

/**
 * Get the board ID for a card
 */
export async function getBoardIdByCardId(
  cardId: string,
): Promise<string | null> {
  const result = await db.query.card.findFirst({
    where: eq(card.id, cardId),
    columns: {
      id: true,
    },
    with: {
      list: {
        columns: {
          boardId: true,
        },
      },
    },
  })

  return result?.list?.boardId ?? null
}
