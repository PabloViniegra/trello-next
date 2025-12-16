import type { card } from '@/db/schema'

export type TCard = typeof card.$inferSelect
export type TCardInsert = typeof card.$inferInsert
