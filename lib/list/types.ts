import type { list } from '@/db/schema'
import type { TCard, TCardWithLabels } from '@/lib/card/types'

export type TList = typeof list.$inferSelect
export type TListInsert = typeof list.$inferInsert

export type TListWithCards = TList & {
  cards: TCard[]
}

export type TListWithCardsAndLabels = TList & {
  cards: TCardWithLabels[]
}
