'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { board, card, cardLabel, label } from '@/db/schema'
import { logActivity } from '@/lib/activity/logger'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { logError } from '@/lib/errors'
import type {
  TAssignLabelInput,
  TCreateLabelInput,
  TDeleteLabelInput,
  TUpdateLabelInput,
} from './schemas'
import {
  assignLabelToCardSchema,
  createLabelSchema,
  deleteLabelSchema,
  updateLabelSchema,
} from './schemas'
import type {
  TAssignLabelResult,
  TDeleteLabelResult,
  TLabelActionResult,
} from './types'

/**
 * Create a new label for a board
 */
export async function createLabel(
  data: TCreateLabelInput,
): Promise<TLabelActionResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para crear una etiqueta',
    }
  }

  // 2. Validate input data
  const validated = createLabelSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verify board exists and user is owner
    const boardRecord = await db.query.board.findFirst({
      where: eq(board.id, validated.data.boardId),
    })

    if (!boardRecord) {
      return {
        success: false,
        error: 'Tablero no encontrado',
      }
    }

    if (boardRecord.ownerId !== user.id) {
      return {
        success: false,
        error: 'Solo el propietario del tablero puede crear etiquetas',
      }
    }

    // 4. Generate unique ID and create label
    const labelId = crypto.randomUUID()

    const [newLabel] = await db
      .insert(label)
      .values({
        id: labelId,
        boardId: validated.data.boardId,
        name: validated.data.name ?? null,
        color: validated.data.color,
      })
      .returning({
        id: label.id,
        name: label.name,
        color: label.color,
      })

    // 5. Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.LABEL_CREATED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: newLabel.id,
      boardId: validated.data.boardId,
      metadata: {
        labelName: newLabel.name || 'Sin nombre',
      },
      newValues: {
        name: newLabel.name,
        color: newLabel.color,
      },
    })

    // 6. Revalidate board page
    revalidatePath(`/boards/${validated.data.boardId}`)

    return {
      success: true,
      data: newLabel,
    }
  } catch (error) {
    logError(error, 'Error creating label')
    return {
      success: false,
      error: 'Error al crear la etiqueta',
    }
  }
}

/**
 * Update an existing label
 */
export async function updateLabel(
  data: TUpdateLabelInput,
): Promise<TLabelActionResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para actualizar una etiqueta',
    }
  }

  // 2. Validate input data
  const validated = updateLabelSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Get label and verify board ownership
    const labelRecord = await db.query.label.findFirst({
      where: eq(label.id, validated.data.id),
      with: {
        board: true,
      },
    })

    if (!labelRecord) {
      return {
        success: false,
        error: 'Etiqueta no encontrada',
      }
    }

    if (labelRecord.board.ownerId !== user.id) {
      return {
        success: false,
        error: 'Solo el propietario del tablero puede editar etiquetas',
      }
    }

    // 4. Build update object
    const updateData: Record<string, unknown> = {}

    if (validated.data.name !== undefined) {
      updateData.name = validated.data.name || null
    }
    if (validated.data.color !== undefined) {
      updateData.color = validated.data.color
    }

    // 5. Update label
    const [updatedLabel] = await db
      .update(label)
      .set(updateData)
      .where(eq(label.id, validated.data.id))
      .returning({
        id: label.id,
        name: label.name,
        color: label.color,
      })

    // 6. Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.LABEL_UPDATED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: validated.data.id,
      boardId: labelRecord.boardId,
      metadata: {
        labelName: updatedLabel.name || 'Sin nombre',
        nameChanged: validated.data.name !== undefined,
        colorChanged: validated.data.color !== undefined,
      },
      previousValues: {
        name: labelRecord.name,
        color: labelRecord.color,
      },
      newValues: {
        name: updatedLabel.name,
        color: updatedLabel.color,
      },
    })

    // 7. Revalidate board page
    revalidatePath(`/boards/${labelRecord.boardId}`)

    return {
      success: true,
      data: updatedLabel,
    }
  } catch (error) {
    logError(error, 'Error updating label')
    return {
      success: false,
      error: 'Error al actualizar la etiqueta',
    }
  }
}

/**
 * Delete a label and all its card assignments
 */
export async function deleteLabel(
  data: TDeleteLabelInput,
): Promise<TDeleteLabelResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para eliminar una etiqueta',
    }
  }

  // 2. Validate input data
  const validated = deleteLabelSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Get label and verify board ownership
    const labelRecord = await db.query.label.findFirst({
      where: eq(label.id, validated.data.id),
      with: {
        board: true,
      },
    })

    if (!labelRecord) {
      return {
        success: false,
        error: 'Etiqueta no encontrada',
      }
    }

    if (labelRecord.board.ownerId !== user.id) {
      return {
        success: false,
        error: 'Solo el propietario del tablero puede eliminar etiquetas',
      }
    }

    // 4. Delete label (cascade will delete card_label entries)
    await db.delete(label).where(eq(label.id, validated.data.id))

    // 5. Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.LABEL_DELETED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: validated.data.id,
      boardId: labelRecord.boardId,
      metadata: {
        labelName: labelRecord.name || 'Sin nombre',
      },
      previousValues: {
        name: labelRecord.name,
        color: labelRecord.color,
      },
    })

    // 6. Revalidate board page
    revalidatePath(`/boards/${labelRecord.boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'Error deleting label')
    return {
      success: false,
      error: 'Error al eliminar la etiqueta',
    }
  }
}

/**
 * Assign a label to a card
 */
export async function assignLabelToCard(
  data: TAssignLabelInput,
): Promise<TAssignLabelResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para asignar una etiqueta',
    }
  }

  // 2. Validate input data
  const validated = assignLabelToCardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Get card and verify user has access
    const cardRecord = await db.query.card.findFirst({
      where: eq(card.id, validated.data.cardId),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    })

    if (!cardRecord) {
      return {
        success: false,
        error: 'Tarjeta no encontrada',
      }
    }

    const hasAccess = await hasUserBoardAccess(cardRecord.list.boardId, user.id)

    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes permiso para modificar esta tarjeta',
      }
    }

    // 4. Verify label belongs to the same board
    const labelRecord = await db.query.label.findFirst({
      where: eq(label.id, validated.data.labelId),
    })

    if (!labelRecord) {
      return {
        success: false,
        error: 'Etiqueta no encontrada',
      }
    }

    if (labelRecord.boardId !== cardRecord.list.boardId) {
      return {
        success: false,
        error: 'La etiqueta no pertenece a este tablero',
      }
    }

    // 5. Create assignment (let DB constraint handle duplicates)
    try {
      const cardLabelId = crypto.randomUUID()

      await db.insert(cardLabel).values({
        id: cardLabelId,
        cardId: validated.data.cardId,
        labelId: validated.data.labelId,
      })

      // 6. Log activity
      await logActivity({
        userId: user.id,
        actionType: ACTIVITY_TYPES.LABEL_ASSIGNED,
        entityType: ENTITY_TYPES.LABEL,
        entityId: validated.data.labelId,
        boardId: cardRecord.list.boardId,
        metadata: {
          labelName: labelRecord.name || 'Sin nombre',
          cardTitle: cardRecord.title,
        },
        newValues: {
          cardId: validated.data.cardId,
          labelId: validated.data.labelId,
        },
      })

      // 7. Revalidate board page
      revalidatePath(`/boards/${cardRecord.list.boardId}`)

      return {
        success: true,
      }
    } catch (insertError) {
      // Check if it's a unique constraint violation
      if (
        insertError instanceof Error &&
        insertError.message.includes('unique')
      ) {
        return {
          success: false,
          error: 'La etiqueta ya está asignada a esta tarjeta',
        }
      }
      throw insertError
    }
  } catch (error) {
    logError(error, 'Error assigning label to card')
    return {
      success: false,
      error: 'Error al asignar la etiqueta',
    }
  }
}

/**
 * Remove a label from a card
 */
export async function removeLabelFromCard(
  data: TAssignLabelInput,
): Promise<TAssignLabelResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para quitar una etiqueta',
    }
  }

  // 2. Validate input data
  const validated = assignLabelToCardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Get card and verify user has access
    const cardRecord = await db.query.card.findFirst({
      where: eq(card.id, validated.data.cardId),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    })

    if (!cardRecord) {
      return {
        success: false,
        error: 'Tarjeta no encontrada',
      }
    }

    const hasAccess = await hasUserBoardAccess(cardRecord.list.boardId, user.id)

    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes permiso para modificar esta tarjeta',
      }
    }

    // 4. Get label info for logging
    const labelRecord = await db.query.label.findFirst({
      where: eq(label.id, validated.data.labelId),
    })

    // 5. Delete assignment
    await db
      .delete(cardLabel)
      .where(
        and(
          eq(cardLabel.cardId, validated.data.cardId),
          eq(cardLabel.labelId, validated.data.labelId),
        ),
      )

    // 6. Log activity
    if (labelRecord) {
      await logActivity({
        userId: user.id,
        actionType: ACTIVITY_TYPES.LABEL_REMOVED,
        entityType: ENTITY_TYPES.LABEL,
        entityId: validated.data.labelId,
        boardId: cardRecord.list.boardId,
        metadata: {
          labelName: labelRecord.name || 'Sin nombre',
          cardTitle: cardRecord.title,
        },
        previousValues: {
          cardId: validated.data.cardId,
          labelId: validated.data.labelId,
        },
      })
    }

    // 7. Revalidate board page
    revalidatePath(`/boards/${cardRecord.list.boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'Error removing label from card')
    return {
      success: false,
      error: 'Error al quitar la etiqueta',
    }
  }
}
