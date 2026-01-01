import type { card } from '@/db/schema'
import type { TCardAttachmentWithUploader } from '@/lib/card-attachment/types'
import type { TCardMember } from '@/lib/card-member/types'
import type { TLabel } from '@/lib/label/types'

export type TCard = typeof card.$inferSelect
export type TCardInsert = typeof card.$inferInsert

export type TCardWithLabels = TCard & {
  labels: TLabel[]
}

export type TCardWithMembers = TCard & {
  members: TCardMember[]
}

export type TCardWithDetails = TCard & {
  labels: TLabel[]
  members: TCardMember[]
  attachments: TCardAttachmentWithUploader[]
}
