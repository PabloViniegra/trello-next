'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { user } from '@/auth-schema'
import { db } from '@/db'
import { board, boardMember } from '@/db/schema'
import { logActivity } from '@/lib/activity/logger'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import { addBoardMemberSchema, removeBoardMemberSchema } from './schemas'
import type {
  TAddBoardMemberInput,
  TBoardMemberResult,
  TRemoveBoardMemberInput,
  TRemoveBoardMemberResult,
  TUsersListResult,
} from './types'

/**
 * Añade un colaborador a un tablero.
 * Solo el propietario del tablero puede añadir miembros.
 */
export async function addBoardMember(
  data: TAddBoardMemberInput,
): Promise<TBoardMemberResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión para añadir colaboradores',
    }
  }

  // 2. Validar datos de entrada
  const validated = addBoardMemberSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verificar que el tablero existe y el usuario actual es el propietario
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

    if (existingBoard.ownerId !== currentUser.id) {
      return {
        success: false,
        error: 'Solo el propietario puede añadir colaboradores',
      }
    }

    // 4. Verificar que el usuario a añadir existe
    const [userToAdd] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, validated.data.userId))
      .limit(1)

    if (!userToAdd) {
      return {
        success: false,
        error: 'El usuario no existe',
      }
    }

    // 5. Verificar que el usuario no es el propietario
    if (validated.data.userId === existingBoard.ownerId) {
      return {
        success: false,
        error: 'El propietario ya tiene acceso al tablero',
      }
    }

    // 6. Verificar que el usuario no es ya un miembro
    const [existingMember] = await db
      .select({ id: boardMember.id })
      .from(boardMember)
      .where(
        and(
          eq(boardMember.boardId, validated.data.boardId),
          eq(boardMember.userId, validated.data.userId),
        ),
      )
      .limit(1)

    if (existingMember) {
      return {
        success: false,
        error: 'Este usuario ya es colaborador del tablero',
      }
    }

    // 7. Generar ID único
    const memberId = crypto.randomUUID()

    // 8. Insertar en base de datos
    const [newMember] = await db
      .insert(boardMember)
      .values({
        id: memberId,
        boardId: validated.data.boardId,
        userId: validated.data.userId,
        role: validated.data.role,
      })
      .returning()

    if (!newMember) {
      return {
        success: false,
        error: 'Error al añadir el colaborador',
      }
    }

    // 9. Obtener datos del usuario añadido
    const [memberUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, validated.data.userId))
      .limit(1)

    if (!memberUser) {
      return {
        success: false,
        error: 'Error al obtener datos del colaborador',
      }
    }

    // 10. Log activity
    await logActivity({
      userId: currentUser.id,
      actionType: ACTIVITY_TYPES.MEMBER_ADDED,
      entityType: ENTITY_TYPES.MEMBER,
      entityId: newMember.id,
      boardId: validated.data.boardId,
      metadata: {
        memberName: memberUser.name || memberUser.email,
        memberEmail: memberUser.email,
        role: validated.data.role,
      },
      newValues: {
        userId: validated.data.userId,
        role: validated.data.role,
      },
    })

    // 11. Revalidar cache
    revalidatePath(`/boards/${validated.data.boardId}`)

    return {
      success: true,
      data: {
        id: newMember.id,
        boardId: newMember.boardId,
        userId: newMember.userId,
        role: newMember.role as 'owner' | 'member',
        createdAt: newMember.createdAt,
        user: memberUser,
      },
    }
  } catch (error) {
    logError(error, 'addBoardMember')

    return {
      success: false,
      error: 'Error al añadir el colaborador. Por favor, intenta de nuevo.',
    }
  }
}

/**
 * Elimina un colaborador de un tablero.
 * Solo el propietario del tablero puede eliminar miembros.
 */
export async function removeBoardMember(
  data: TRemoveBoardMemberInput,
): Promise<TRemoveBoardMemberResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión para eliminar colaboradores',
    }
  }

  // 2. Validar datos de entrada
  const validated = removeBoardMemberSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verificar que el tablero existe y el usuario actual es el propietario
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

    if (existingBoard.ownerId !== currentUser.id) {
      return {
        success: false,
        error: 'Solo el propietario puede eliminar colaboradores',
      }
    }

    // 4. Verificar que el miembro existe y obtener sus datos
    const [existingMemberData] = await db
      .select({
        id: boardMember.id,
        userId: boardMember.userId,
        role: boardMember.role,
      })
      .from(boardMember)
      .where(
        and(
          eq(boardMember.boardId, validated.data.boardId),
          eq(boardMember.userId, validated.data.userId),
        ),
      )
      .limit(1)

    if (!existingMemberData) {
      return {
        success: false,
        error: 'Este usuario no es colaborador del tablero',
      }
    }

    // 5. Obtener datos del usuario para logging
    const [memberUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, validated.data.userId))
      .limit(1)

    // 6. Eliminar el miembro
    await db
      .delete(boardMember)
      .where(
        and(
          eq(boardMember.boardId, validated.data.boardId),
          eq(boardMember.userId, validated.data.userId),
        ),
      )

    // 7. Log activity
    if (memberUser) {
      await logActivity({
        userId: currentUser.id,
        actionType: ACTIVITY_TYPES.MEMBER_REMOVED,
        entityType: ENTITY_TYPES.MEMBER,
        entityId: existingMemberData.id,
        boardId: validated.data.boardId,
        metadata: {
          memberName: memberUser.name || memberUser.email,
          memberEmail: memberUser.email,
          role: existingMemberData.role,
        },
        previousValues: {
          userId: validated.data.userId,
          role: existingMemberData.role,
        },
      })
    }

    // 8. Revalidar cache
    revalidatePath(`/boards/${validated.data.boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'removeBoardMember')

    return {
      success: false,
      error: 'Error al eliminar el colaborador. Por favor, intenta de nuevo.',
    }
  }
}

/**
 * Obtiene la lista de usuarios activos que NO son colaboradores del tablero.
 * Esto incluye verificar que tampoco sean el propietario.
 */
export async function getAvailableUsers(
  boardId: string,
): Promise<TUsersListResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión',
    }
  }

  try {
    // 2. Verificar que el tablero existe y el usuario es el propietario
    const [existingBoard] = await db
      .select({ id: board.id, ownerId: board.ownerId })
      .from(board)
      .where(eq(board.id, boardId))
      .limit(1)

    if (!existingBoard) {
      return {
        success: false,
        error: 'El tablero no existe',
      }
    }

    if (existingBoard.ownerId !== currentUser.id) {
      return {
        success: false,
        error: 'Solo el propietario puede ver usuarios disponibles',
      }
    }

    // 3. Obtener IDs de usuarios que ya son miembros
    const existingMembers = await db
      .select({ userId: boardMember.userId })
      .from(boardMember)
      .where(eq(boardMember.boardId, boardId))

    const memberIds = existingMembers.map((m) => m.userId)

    // 4. Obtener usuarios que NO son miembros y NO son el propietario
    const conditions = [
      ne(user.id, existingBoard.ownerId), // No incluir propietario
    ]

    // Solo agregar condición de miembros si hay miembros existentes
    if (memberIds.length > 0) {
      conditions.push(...memberIds.map((id) => ne(user.id, id)))
    }

    const availableUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(and(...conditions))
      .orderBy(user.name)
      .limit(50) // Limitar a 50 usuarios para performance

    return {
      success: true,
      data: availableUsers,
    }
  } catch (error) {
    logError(error, 'getAvailableUsers')

    return {
      success: false,
      error: 'Error al obtener usuarios disponibles',
    }
  }
}

/**
 * Obtiene los miembros actuales de un tablero (incluyendo el propietario).
 */
export async function getBoardMembers(
  boardId: string,
): Promise<TUsersListResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión',
    }
  }

  try {
    // 2. Verificar que el tablero existe
    const [existingBoard] = await db
      .select({
        id: board.id,
        ownerId: board.ownerId,
      })
      .from(board)
      .where(eq(board.id, boardId))
      .limit(1)

    if (!existingBoard) {
      return {
        success: false,
        error: 'El tablero no existe',
      }
    }

    // 3. Verificar que el usuario tiene acceso (es propietario o miembro)
    const isOwner = existingBoard.ownerId === currentUser.id

    if (!isOwner) {
      const [isMember] = await db
        .select({ id: boardMember.id })
        .from(boardMember)
        .where(
          and(
            eq(boardMember.boardId, boardId),
            eq(boardMember.userId, currentUser.id),
          ),
        )
        .limit(1)

      if (!isMember) {
        return {
          success: false,
          error: 'No tienes acceso a este tablero',
        }
      }
    }

    // 4. Obtener propietario
    const [owner] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, existingBoard.ownerId))
      .limit(1)

    // 5. Obtener miembros
    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(boardMember)
      .innerJoin(user, eq(boardMember.userId, user.id))
      .where(eq(boardMember.boardId, boardId))
      .orderBy(user.name)

    // 6. Combinar propietario y miembros
    const allMembers = owner ? [owner, ...members] : members

    return {
      success: true,
      data: allMembers,
    }
  } catch (error) {
    logError(error, 'getBoardMembers')

    return {
      success: false,
      error: 'Error al obtener miembros del tablero',
    }
  }
}
