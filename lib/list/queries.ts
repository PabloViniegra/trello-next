import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { card, list } from '@/db/schema'
import type { TList, TListWithCards } from './types'

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

export const getListsByBoardId = (boardId: string) =>
  unstable_cache(
    async () => _getListsByBoardId(boardId),
    [`lists-by-board-${boardId}`],
    {
      tags: [`board:${boardId}:lists`],
      revalidate: false, // Only revalidate on-demand via revalidateTag
    },
  )()

export async function getListById(listId: string): Promise<TList | undefined> {
  return db.query.list.findFirst({
    where: eq(list.id, listId),
  })
}
