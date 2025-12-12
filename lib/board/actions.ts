'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { board } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import { createBoardSchema } from './schemas'
import type { TBoardResult, TCreateBoardInput } from './types'

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
