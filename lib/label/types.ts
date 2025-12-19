import type { label } from '@/db/schema'

export type TLabel = typeof label.$inferSelect
export type TLabelInsert = typeof label.$inferInsert

export type TLabelWithCardCount = TLabel & {
  cardCount: number
}

/**
 * Result type for label creation and update actions
 */
export type TLabelActionResult = {
  success: boolean
  data?: { id: string; name: string | null; color: string }
  error?: string
}

/**
 * Result type for label deletion action
 */
export type TDeleteLabelResult = {
  success: boolean
  error?: string
}

/**
 * Result type for label assignment/removal actions
 */
export type TAssignLabelResult = {
  success: boolean
  error?: string
}
