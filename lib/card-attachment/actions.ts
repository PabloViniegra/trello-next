'use server'

import { del, put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'

import { db } from '@/db'
import { cardAttachment } from '@/db/schema'
import { logActivity } from '@/lib/activity/logger'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { getBoardIdByCardId } from '@/lib/card/queries'

import { ATTACHMENT_CONFIG, ATTACHMENT_ERRORS } from './constants'
import { getAttachmentById, getAttachmentCountByCardId } from './queries'
import { deleteAttachmentSchema, uploadAttachmentSchema } from './schemas'
import type { TDeleteAttachmentResult, TUploadAttachmentResult } from './types'

export async function uploadAttachment(
  formData: FormData,
): Promise<TUploadAttachmentResult> {
  try {
    // 1. Autenticación
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED }
    }

    // 2. Extraer y validar datos
    const cardId = formData.get('cardId') as string
    const file = formData.get('file') as File

    const validation = uploadAttachmentSchema.safeParse({ cardId, file })
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? 'Datos inválidos',
      }
    }

    // 3. Verificar acceso al tablero
    const boardId = await getBoardIdByCardId(cardId)
    if (!boardId) {
      return { success: false, error: 'Tarjeta no encontrada' }
    }

    const hasAccess = await hasUserBoardAccess(boardId, user.id)
    if (!hasAccess) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED }
    }

    // 4. Verificar límite de archivos
    const currentCount = await getAttachmentCountByCardId(cardId)
    if (currentCount >= ATTACHMENT_CONFIG.maxFilesPerCard) {
      return { success: false, error: ATTACHMENT_ERRORS.MAX_FILES_REACHED }
    }

    // 5. Subir a Vercel Blob
    const fileKey = `${crypto.randomUUID()}-${file.name}`

    let blob: { url: string; downloadUrl: string }
    try {
      blob = await put(`cards/${cardId}/${fileKey}`, file, {
        access: 'public',
        addRandomSuffix: false,
      })
    } catch (blobError) {
      console.error('Blob upload failed:', blobError)
      return {
        success: false,
        error: ATTACHMENT_ERRORS.UPLOAD_FAILED,
      }
    }

    // 6. Guardar metadata en DB (con rollback si falla)
    const attachmentId = crypto.randomUUID()
    let newAttachment: typeof cardAttachment.$inferSelect
    try {
      const [inserted] = await db
        .insert(cardAttachment)
        .values({
          id: attachmentId,
          cardId,
          fileName: file.name,
          fileUrl: blob.url,
          downloadUrl: blob.downloadUrl,
          contentType: file.type,
          fileSize: file.size,
          uploadedBy: user.id,
        })
        .returning()
      newAttachment = inserted
    } catch (dbError) {
      // Rollback: eliminar archivo subido si falla la BD
      try {
        await del(blob.url)
      } catch {
        // Ignorar error de limpieza
      }
      console.error('DB insert failed:', dbError)
      return { success: false, error: ATTACHMENT_ERRORS.UPLOAD_FAILED }
    }

    // 7. Registrar actividad
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.ATTACHMENT_ADDED,
      entityType: ENTITY_TYPES.CARD,
      entityId: cardId,
      boardId,
      metadata: { fileName: file.name },
    })

    // 8. Revalidar cache
    revalidateTag(`board:${boardId}:lists`, 'max')
    revalidatePath(`/boards/${boardId}`)

    return { success: true, data: newAttachment }
  } catch (error) {
    console.error('Error uploading attachment:', error)
    return { success: false, error: ATTACHMENT_ERRORS.UPLOAD_FAILED }
  }
}

export async function deleteAttachment(data: {
  attachmentId: string
}): Promise<TDeleteAttachmentResult> {
  try {
    // 1. Autenticación
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED }
    }

    // 2. Validar input
    const validation = deleteAttachmentSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: 'ID de adjunto inválido' }
    }

    // 3. Obtener el adjunto
    const attachment = await getAttachmentById(data.attachmentId)

    if (!attachment) {
      return { success: false, error: ATTACHMENT_ERRORS.NOT_FOUND }
    }

    // 4. Verificar acceso al tablero
    const boardId = await getBoardIdByCardId(attachment.cardId)
    if (!boardId) {
      return { success: false, error: 'Tarjeta no encontrada' }
    }

    const hasAccess = await hasUserBoardAccess(boardId, user.id)
    if (!hasAccess) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED }
    }

    // 5. Eliminar de DB primero (para evitar referencias huérfanas)
    await db
      .delete(cardAttachment)
      .where(eq(cardAttachment.id, data.attachmentId))

    // 6. Eliminar de Vercel Blob (tolerante a errores)
    try {
      await del(attachment.fileUrl)
    } catch (blobError) {
      // Log pero no fallar - el registro ya fue eliminado
      console.error('Failed to delete blob (orphaned file):', blobError)
    }

    // 7. Registrar actividad
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.ATTACHMENT_REMOVED,
      entityType: ENTITY_TYPES.CARD,
      entityId: attachment.cardId,
      boardId,
      metadata: { fileName: attachment.fileName },
    })

    // 8. Revalidar cache
    revalidateTag(`board:${boardId}:lists`, 'max')
    revalidatePath(`/boards/${boardId}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return { success: false, error: ATTACHMENT_ERRORS.DELETE_FAILED }
  }
}
