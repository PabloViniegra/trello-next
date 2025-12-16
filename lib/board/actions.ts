'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { board } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import { createBoardSchema, deleteBoardSchema } from './schemas'
import type {
  TBoardResult,
  TCreateBoardInput,
  TDeleteBoardInput,
  TDeleteBoardResult,
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

    // 5. Revalidar cache de la página de tableros
    revalidatePath('/boards')
    revalidatePath('/')

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

    // 4. Eliminar el tablero (cascade eliminará las relaciones)
    await db.delete(board).where(eq(board.id, validated.data.boardId))

    // 5. Revalidar cache de la página de tableros
    revalidatePath('/boards')
    revalidatePath('/')

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
