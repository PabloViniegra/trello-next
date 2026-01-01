import type { cardAttachment } from '@/db/schema'

export type TCardAttachment = typeof cardAttachment.$inferSelect
export type TCardAttachmentInsert = typeof cardAttachment.$inferInsert

export type TCardAttachmentWithUploader = TCardAttachment & {
  uploader: {
    id: string
    name: string | null
    image: string | null
  } | null
}

export type TUploadAttachmentResult = {
  success: boolean
  data?: TCardAttachment
  error?: string
}

export type TDeleteAttachmentResult = {
  success: boolean
  error?: string
}
