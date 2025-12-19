import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { card, list } from '@/db/schema'
import type { TList, TListWithCards, TListWithCardsAndLabels } from './types'

async function _getListsByBoardId(boardId: string): Promise<TListWithCards[]> {
  const lists = await db.query.list.findMany({
    where: eq(list.boardId, boardId),
    orderBy: [asc(list.position)],
    with: {
      cards: {
        orderBy: [asc(card.position)],
      },
    },
  })

  return lists
}

async function _getListsWithCardsAndLabelsByBoardId(
  boardId: string,
): Promise<TListWithCardsAndLabels[]> {
  const lists = await db.query.list.findMany({
    where: eq(list.boardId, boardId),
    orderBy: [asc(list.position)],
    with: {
      cards: {
        orderBy: [asc(card.position)],
        with: {
          cardLabels: {
            with: {
              label: true,
            },
          },
        },
      },
    },
  })

  // Transform to flatten labels
  return lists.map((list) => ({
    ...list,
    cards: list.cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      dueDate: card.dueDate,
      listId: card.listId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      labels: card.cardLabels.map((cl) => cl.label),
    })),
  }))
}

export const getListsByBoardId = (boardId: string) =>
  unstable_cache(
    async () => _getListsByBoardId(boardId),
    [`lists-by-board-${boardId}`],
    {
      tags: [`board:${boardId}:lists`],
      revalidate: false, // Only revalidate on-demand via revalidateTag
    },
  )()

export const getListsWithCardsAndLabelsByBoardId = (boardId: string) =>
  unstable_cache(
    async () => _getListsWithCardsAndLabelsByBoardId(boardId),
    [`lists-cards-labels-by-board-${boardId}`],
    {
      tags: [`board:${boardId}:lists`],
      revalidate: false,
    },
  )()

export async function getListById(listId: string): Promise<TList | undefined> {
  return db.query.list.findFirst({
    where: eq(list.id, listId),
  })
}
