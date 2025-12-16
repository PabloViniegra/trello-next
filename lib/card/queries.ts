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
