import type { card } from '@/db/schema'
import type { TLabel } from '@/lib/label/types'

export type TCard = typeof card.$inferSelect
export type TCardInsert = typeof card.$inferInsert

export type TCardWithLabels = TCard & {
  labels: TLabel[]
}
