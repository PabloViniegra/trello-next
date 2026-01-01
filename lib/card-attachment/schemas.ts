import { z } from 'zod'

import { ATTACHMENT_CONFIG, ATTACHMENT_ERRORS } from './constants'

export const uploadAttachmentSchema = z.object({
  cardId: z.string().min(1, 'ID de tarjeta requerido'),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= ATTACHMENT_CONFIG.maxFileSize,
      ATTACHMENT_ERRORS.FILE_TOO_LARGE,
    )
    .refine(
      (file) =>
        ATTACHMENT_CONFIG.allowedMimeTypes.includes(
          file.type as (typeof ATTACHMENT_CONFIG.allowedMimeTypes)[number],
        ),
      ATTACHMENT_ERRORS.INVALID_FILE_TYPE,
    )
    .refine((file) => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
      return ATTACHMENT_CONFIG.allowedExtensions.includes(
        ext as (typeof ATTACHMENT_CONFIG.allowedExtensions)[number],
      )
    }, 'Extensión no válida'),
})

export const deleteAttachmentSchema = z.object({
  attachmentId: z.string().min(1, 'ID de adjunto requerido'),
})

export type TUploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>
export type TDeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>
