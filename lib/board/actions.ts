'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/db'
import { board } from '@/db/schema'
import { logActivity } from '@/lib/activity/logger'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import {
  createBoardSchema,
  deleteBoardSchema,
  updateBoardPrivacySchema,
  updateBoardSchema,
} from './schemas'
import type {
  TBoardResult,
  TCreateBoardInput,
  TDeleteBoardInput,
  TDeleteBoardResult,
  TUpdateBoardInput,
  TUpdateBoardPrivacyInput,
} from './types'

export async function createBoard(
  data: TCreateBoardInput,
): Promise<TBoardResult> {
  // 1. Verificar autenticación
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para crear un tablero',
    }
  }

  // 2. Validar datos de entrada
  const validated = createBoardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Generar ID único
    const boardId = crypto.randomUUID()

    // 4. Insertar en base de datos
    const [newBoard] = await db
      .insert(board)
      .values({
        id: boardId,
        title: validated.data.title,
        description: validated.data.description ?? null,
        backgroundColor: validated.data.backgroundColor,
        ownerId: user.id,
      })
      .returning()

    if (!newBoard) {
      return {
        success: false,
        error: 'Error al crear el tablero',
      }
    }

    // 5. Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.BOARD_CREATED,
      entityType: ENTITY_TYPES.BOARD,
      entityId: newBoard.id,
      boardId: newBoard.id,
      metadata: {
        boardTitle: newBoard.title,
      },
      newValues: {
        title: newBoard.title,
        description: newBoard.description,
        backgroundColor: newBoard.backgroundColor,
      },
    })

    // 6. Revalidar cache de la página de tableros
    revalidateTag('boards-list', { expire: 0 }) // Invalida cache tag de la lista de tableros
    revalidatePath('/boards')
    revalidatePath('/')
    revalidateTag('activity', { expire: 0 })

    return {
      success: true,
      data: newBoard,
    }
  } catch (error) {
    logError(error, 'createBoard')

    return {
      success: false,
      error: 'Error al crear el tablero. Por favor, intenta de nuevo.',
    }
  }
}

export async function deleteBoard(
  data: TDeleteBoardInput,
): Promise<TDeleteBoardResult> {
  // 1. Verificar autenticación
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para eliminar un tablero',
    }
  }

  // 2. Validar datos de entrada
  const validated = deleteBoardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verificar que el tablero existe y pertenece al usuario
    const [existingBoard] = await db
      .select({ id: board.id, ownerId: board.ownerId })
      .from(board)
      .where(eq(board.id, validated.data.boardId))
      .limit(1)

    if (!existingBoard) {
      return {
        success: false,
        error: 'El tablero no existe',
      }
    }

    if (existingBoard.ownerId !== user.id) {
      return {
        success: false,
        error: 'No tienes permiso para eliminar este tablero',
      }
    }

    // 4. Obtener datos del tablero antes de eliminar
    const [boardToDelete] = await db
      .select()
      .from(board)
      .where(eq(board.id, validated.data.boardId))
      .limit(1)

    // 5. Eliminar el tablero (cascade eliminará las relaciones)
    await db.delete(board).where(eq(board.id, validated.data.boardId))

    // 6. Log activity
    if (boardToDelete) {
      await logActivity({
        userId: user.id,
        actionType: ACTIVITY_TYPES.BOARD_DELETED,
        entityType: ENTITY_TYPES.BOARD,
        entityId: validated.data.boardId,
        boardId: validated.data.boardId,
        metadata: {
          boardTitle: boardToDelete.title,
        },
        previousValues: {
          title: boardToDelete.title,
          description: boardToDelete.description,
          backgroundColor: boardToDelete.backgroundColor,
        },
      })
    }

    // 7. Revalidar cache de la página de tableros
    revalidateTag('boards-list', { expire: 0 }) // Invalida cache tag de la lista de tableros
    revalidateTag(`board:${validated.data.boardId}`, { expire: 0 }) // Invalida cache tag del tablero específico
    revalidateTag(`board:${validated.data.boardId}:lists`, { expire: 0 }) // Invalida cache tag de las listas del tablero
    revalidatePath('/boards')
    revalidatePath('/')
    revalidateTag('activity', { expire: 0 })

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'deleteBoard')

    return {
      success: false,
      error: 'Error al eliminar el tablero. Por favor, intenta de nuevo.',
    }
  }
}

export async function updateBoard(
  data: TUpdateBoardInput,
): Promise<TBoardResult> {
  // 1. Verificar autenticación
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para editar un tablero',
    }
  }

  // 2. Validar datos de entrada
  const validated = updateBoardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verificar que el tablero existe y pertenece al usuario
    const [existingBoard] = await db
      .select()
      .from(board)
      .where(eq(board.id, validated.data.boardId))
      .limit(1)

    if (!existingBoard) {
      return {
        success: false,
        error: 'El tablero no existe',
      }
    }

    if (existingBoard.ownerId !== user.id) {
      return {
        success: false,
        error: 'Solo el propietario puede editar este tablero',
      }
    }

    // 4. Preparar datos para actualizar (solo campos que vienen en el request)
    const updateData: Partial<{
      title: string
      description: string | null
      backgroundColor: string
    }> = {}

    if (validated.data.title !== undefined) {
      updateData.title = validated.data.title
    }

    if (validated.data.description !== undefined) {
      updateData.description = validated.data.description
    }

    if (validated.data.backgroundColor !== undefined) {
      updateData.backgroundColor = validated.data.backgroundColor
    }

    // 4.1. Verificar que hay campos para actualizar
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: 'No se proporcionaron campos para actualizar',
      }
    }

    // 5. Actualizar el tablero
    const [updatedBoard] = await db
      .update(board)
      .set(updateData)
      .where(eq(board.id, validated.data.boardId))
      .returning()

    if (!updatedBoard) {
      return {
        success: false,
        error: 'Error al actualizar el tablero',
      }
    }

    // 6. Log activity
    await logActivity({
      userId: user.id,
      actionType: ACTIVITY_TYPES.BOARD_UPDATED,
      entityType: ENTITY_TYPES.BOARD,
      entityId: validated.data.boardId,
      boardId: validated.data.boardId,
      metadata: {
        boardTitle: updatedBoard.title,
        titleChanged: validated.data.title !== undefined,
        descriptionChanged: validated.data.description !== undefined,
        backgroundChanged: validated.data.backgroundColor !== undefined,
      },
      previousValues: {
        title: existingBoard.title,
        description: existingBoard.description,
        backgroundColor: existingBoard.backgroundColor,
      },
      newValues: {
        title: updatedBoard.title,
        description: updatedBoard.description,
        backgroundColor: updatedBoard.backgroundColor,
      },
    })

    // 7. Revalidar cache
    revalidateTag('boards-list', { expire: 0 })
    revalidateTag(`board:${validated.data.boardId}`, { expire: 0 })
    revalidatePath('/boards')
    revalidatePath(`/boards/${validated.data.boardId}`)

    return {
      success: true,
      data: updatedBoard,
    }
  } catch (error) {
    logError(error, 'updateBoard')

    return {
      success: false,
      error: 'Error al actualizar el tablero. Por favor, intenta de nuevo.',
    }
  }
}

/**
 * Actualiza la privacidad de un tablero.
 * Solo el propietario del tablero puede cambiar su privacidad.
 *
 * @param data - Datos de entrada con boardId e isPrivate
 * @returns Resultado con el tablero actualizado o error
 *
 * @example
 * const result = await updateBoardPrivacy({
 *   boardId: 'uuid-here',
 *   isPrivate: 'private'
 * })
 */
export async function updateBoardPrivacy(
  data: TUpdateBoardPrivacyInput,
): Promise<TBoardResult> {
  // 1. Verificar autenticación
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para cambiar la privacidad del tablero',
    }
  }

  // 2. Validar datos de entrada
  const validated = updateBoardPrivacySchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Obtener estado anterior
    const [previousBoard] = await db
      .select()
      .from(board)
      .where(eq(board.id, validated.data.boardId))
      .limit(1)

    // 4. Actualizar solo si el usuario es el propietario (verificación atómica)
    const [updatedBoard] = await db
      .update(board)
      .set({ isPrivate: validated.data.isPrivate })
      .where(
        and(
          eq(board.id, validated.data.boardId),
          eq(board.ownerId, user.id), // Verificación atómica para evitar race conditions
        ),
      )
      .returning()

    if (!updatedBoard) {
      // Verificar si el tablero existe o si no tiene permisos
      const [existingBoard] = await db
        .select({ id: board.id })
        .from(board)
        .where(eq(board.id, validated.data.boardId))
        .limit(1)

      return {
        success: false,
        error: existingBoard
          ? 'Solo el propietario puede cambiar la privacidad del tablero'
          : 'El tablero no existe',
      }
    }

    // 5. Log activity
    if (previousBoard) {
      await logActivity({
        userId: user.id,
        actionType: ACTIVITY_TYPES.BOARD_UPDATED,
        entityType: ENTITY_TYPES.BOARD,
        entityId: validated.data.boardId,
        boardId: validated.data.boardId,
        metadata: {
          boardTitle: updatedBoard.title,
          privacyChanged: true,
        },
        previousValues: {
          isPrivate: previousBoard.isPrivate,
        },
        newValues: {
          isPrivate: updatedBoard.isPrivate,
        },
      })
    }

    // 6. Revalidar cache
    revalidateTag('boards-list', { expire: 0 })
    revalidateTag(`board:${validated.data.boardId}`, { expire: 0 })
    revalidatePath('/boards')
    revalidatePath(`/boards/${validated.data.boardId}`)

    return {
      success: true,
      data: updatedBoard,
    }
  } catch (error) {
    logError(error, 'updateBoardPrivacy')

    return {
      success: false,
      error:
        'Error al cambiar la privacidad del tablero. Por favor, intenta de nuevo.',
    }
  }
}
