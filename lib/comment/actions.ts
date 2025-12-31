/**
 * Comment Server Actions
 * All server-side comment operations with authorization
 */

'use server'

import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity/logger'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import {
  hasUserBoardAccess,
  isUserBoardOwner,
} from '@/lib/board-member/queries'
import { getBoardIdByCardId } from '@/lib/card/queries'
import { getCardMembers } from '@/lib/card-member/queries'
import { logError } from '@/lib/errors'
import { createNotification } from '@/lib/notification/service'
import { NOTIFICATION_TYPES } from '@/lib/notification/types'
import {
  createComment as createCommentQuery,
  deleteComment as deleteCommentQuery,
  getCommentById,
  getCommentsByCardId,
  updateComment as updateCommentQuery,
} from './queries'
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  type TCreateCommentInput,
  type TDeleteCommentInput,
  type TGetCommentsInput,
  type TUpdateCommentInput,
  updateCommentSchema,
} from './schemas'
import type { TCommentWithUser } from './types'

// =============================================================================
// RETURN TYPES
// =============================================================================

type TActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extract mentions from comment content
 * Looks for @username or @email patterns
 */
function extractMentions(content: string): string[] {
  // Match @word or @email patterns
  const mentionRegex = /@(\w+(?:\.\w+)*@?\w*\.?\w+)/g
  const matches = content.matchAll(mentionRegex)
  const mentions = new Set<string>()

  for (const match of matches) {
    if (match[1]) {
      mentions.add(match[1])
    }
  }

  return Array.from(mentions)
}

/**
 * Find user IDs from mentions
 */
async function findMentionedUserIds(
  mentions: string[],
  cardId: string,
): Promise<string[]> {
  if (mentions.length === 0) return []

  // Get all card members to match against
  const cardMembers = await getCardMembers(cardId)

  const mentionedUserIds = new Set<string>()

  for (const mention of mentions) {
    // Try to find by email or name
    const member = cardMembers.find(
      (m: { user: { email: string; name: string } }) =>
        m.user.email.toLowerCase() === mention.toLowerCase() ||
        m.user.name.toLowerCase() === mention.toLowerCase(),
    )

    if (member) {
      mentionedUserIds.add(member.userId)
    }
  }

  return Array.from(mentionedUserIds)
}

// =============================================================================
// READ ACTIONS
// =============================================================================

/**
 * Get all comments for a card
 */
export async function getComments(
  input: TGetCommentsInput,
): Promise<TActionResult<TCommentWithUser[]>> {
  try {
    // Validate input
    const validatedInput = getCommentsSchema.parse(input)

    // Auth check
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para ver los comentarios',
      }
    }

    // Get board ID from card
    const boardId = await getBoardIdByCardId(validatedInput.cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'Tarjeta no encontrada',
      }
    }

    // Check board access
    const hasAccess = await hasUserBoardAccess(boardId, user.id)
    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes permiso para ver estos comentarios',
      }
    }

    // Get comments
    const comments = await getCommentsByCardId(validatedInput.cardId)

    return {
      success: true,
      data: comments,
    }
  } catch (error) {
    logError(error, 'getComments')
    return {
      success: false,
      error: 'Error al obtener los comentarios',
    }
  }
}

// =============================================================================
// CREATE ACTIONS
// =============================================================================

/**
 * Create a new comment
 */
export async function createComment(
  input: TCreateCommentInput,
): Promise<TActionResult<TCommentWithUser>> {
  try {
    // Validate input
    const validatedInput = createCommentSchema.parse(input)

    // Auth check
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para comentar',
      }
    }

    // Get board ID from card
    const boardId = await getBoardIdByCardId(validatedInput.cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'Tarjeta no encontrada',
      }
    }

    // Check board access
    const hasAccess = await hasUserBoardAccess(boardId, user.id)
    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes permiso para comentar en esta tarjeta',
      }
    }

    // Create comment
    const commentId = nanoid()
    await createCommentQuery({
      id: commentId,
      cardId: validatedInput.cardId,
      userId: user.id,
      content: validatedInput.content,
    })

    // Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.COMMENT_CREATED,
      entityType: ENTITY_TYPES.COMMENT,
      entityId: commentId,
      boardId,
      metadata: {
        cardId: validatedInput.cardId,
      },
      newValues: {
        content: validatedInput.content,
      },
    })

    // Handle mentions
    const mentions = extractMentions(validatedInput.content)
    if (mentions.length > 0) {
      const mentionedUserIds = await findMentionedUserIds(
        mentions,
        validatedInput.cardId,
      )

      // Create notifications for mentioned users
      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== user.id) {
          // Don't notify yourself
          await createNotification({
            userId: mentionedUserId,
            title: 'Te mencionaron en un comentario',
            message: `${user.name} te mencionó en un comentario`,
            notificationType: NOTIFICATION_TYPES.COMMENT_MENTION,
            metadata: {
              cardId: validatedInput.cardId,
              commentId,
              boardId,
            },
            priority: 'normal',
          })
        }
      }
    }

    // Get the created comment with user data
    const commentWithUser = await getCommentById(commentId)
    if (!commentWithUser) {
      return {
        success: false,
        error: 'Error al crear el comentario',
      }
    }

    // Revalidate
    revalidatePath(`/boards/${boardId}`)

    return {
      success: true,
      data: commentWithUser,
    }
  } catch (error) {
    logError(error, 'createComment')
    return {
      success: false,
      error: 'Error al crear el comentario',
    }
  }
}

// =============================================================================
// UPDATE ACTIONS
// =============================================================================

/**
 * Update a comment
 */
export async function updateComment(
  input: TUpdateCommentInput,
): Promise<TActionResult<TCommentWithUser>> {
  try {
    // Validate input
    const validatedInput = updateCommentSchema.parse(input)

    // Auth check
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para editar comentarios',
      }
    }

    // Get existing comment
    const existingComment = await getCommentById(validatedInput.id)
    if (!existingComment) {
      return {
        success: false,
        error: 'Comentario no encontrado',
      }
    }

    // Get board ID from card
    const boardId = await getBoardIdByCardId(existingComment.cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'Tarjeta no encontrada',
      }
    }

    // Check permissions: only author or board owner can edit
    const isOwner = await isUserBoardOwner(boardId, user.id)
    const isAuthor = existingComment.userId === user.id

    if (!isAuthor && !isOwner) {
      return {
        success: false,
        error: 'No tienes permiso para editar este comentario',
      }
    }

    // Update comment
    await updateCommentQuery(validatedInput.id, validatedInput.content)

    // Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.COMMENT_UPDATED,
      entityType: ENTITY_TYPES.COMMENT,
      entityId: validatedInput.id,
      boardId,
      metadata: {
        cardId: existingComment.cardId,
      },
      previousValues: {
        content: existingComment.content,
      },
      newValues: {
        content: validatedInput.content,
      },
    })

    // Get updated comment
    const updatedComment = await getCommentById(validatedInput.id)
    if (!updatedComment) {
      return {
        success: false,
        error: 'Error al actualizar el comentario',
      }
    }

    // Revalidate
    revalidatePath(`/boards/${boardId}`)

    return {
      success: true,
      data: updatedComment,
    }
  } catch (error) {
    logError(error, 'updateComment')
    return {
      success: false,
      error: 'Error al actualizar el comentario',
    }
  }
}

// =============================================================================
// DELETE ACTIONS
// =============================================================================

/**
 * Delete a comment
 */
export async function deleteComment(
  input: TDeleteCommentInput,
): Promise<TActionResult> {
  try {
    // Validate input
    const validatedInput = deleteCommentSchema.parse(input)

    // Auth check
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para eliminar comentarios',
      }
    }

    // Get existing comment
    const existingComment = await getCommentById(validatedInput.id)
    if (!existingComment) {
      return {
        success: false,
        error: 'Comentario no encontrado',
      }
    }

    // Get board ID from card
    const boardId = await getBoardIdByCardId(existingComment.cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'Tarjeta no encontrada',
      }
    }

    // Check permissions: only author or board owner can delete
    const isOwner = await isUserBoardOwner(boardId, user.id)
    const isAuthor = existingComment.userId === user.id

    if (!isAuthor && !isOwner) {
      return {
        success: false,
        error: 'No tienes permiso para eliminar este comentario',
      }
    }

    // Delete comment
    await deleteCommentQuery(validatedInput.id)

    // Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.COMMENT_DELETED,
      entityType: ENTITY_TYPES.COMMENT,
      entityId: validatedInput.id,
      boardId,
      metadata: {
        cardId: existingComment.cardId,
      },
      previousValues: {
        content: existingComment.content,
      },
    })

    // Revalidate
    revalidatePath(`/boards/${boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'deleteComment')
    return {
      success: false,
      error: 'Error al eliminar el comentario',
    }
  }
}
