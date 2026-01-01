import { count, eq } from 'drizzle-orm'

import { user } from '@/auth-schema'
import { db } from '@/db'
import { cardAttachment } from '@/db/schema'

import type { TCardAttachment, TCardAttachmentWithUploader } from './types'

export async function getAttachmentsByCardId(
  cardId: string,
): Promise<TCardAttachmentWithUploader[]> {
  const attachments = await db
    .select({
      id: cardAttachment.id,
      cardId: cardAttachment.cardId,
      fileName: cardAttachment.fileName,
      fileUrl: cardAttachment.fileUrl,
      downloadUrl: cardAttachment.downloadUrl,
      contentType: cardAttachment.contentType,
      fileSize: cardAttachment.fileSize,
      uploadedBy: cardAttachment.uploadedBy,
      createdAt: cardAttachment.createdAt,
      uploader: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(cardAttachment)
    .leftJoin(user, eq(cardAttachment.uploadedBy, user.id))
    .where(eq(cardAttachment.cardId, cardId))
    .orderBy(cardAttachment.createdAt)

  return attachments
}

export async function getAttachmentCountByCardId(
  cardId: string,
): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(cardAttachment)
    .where(eq(cardAttachment.cardId, cardId))

  return result?.count ?? 0
}

export async function getAttachmentById(
  attachmentId: string,
): Promise<TCardAttachment | undefined> {
  const [attachment] = await db
    .select()
    .from(cardAttachment)
    .where(eq(cardAttachment.id, attachmentId))
    .limit(1)

  return attachment
}
