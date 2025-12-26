'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { user } from '@/auth-schema'
import { db } from '@/db'
import { card, cardMember } from '@/db/schema'
import { logActivity } from '@/lib/activity/logger'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { logError } from '@/lib/errors'
import {
  canUserAssignCardMembers,
  getBoardIdFromCard,
  isUserAssignedToCard,
} from './queries'
import { assignCardMemberSchema, unassignCardMemberSchema } from './schemas'
import type {
  TAssignCardMemberInput,
  TCardMemberResult,
  TCardMembersListResult,
  TUnassignCardMemberInput,
  TUnassignCardMemberResult,
} from './types'

/**
 * Asigna un miembro a una tarjeta.
 * Solo los colaboradores o propietarios del tablero pueden asignar miembros.
 */
export async function assignCardMember(
  data: TAssignCardMemberInput,
): Promise<TCardMemberResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión para asignar miembros',
    }
  }

  // 2. Validar datos de entrada
  const validated = assignCardMemberSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verificar que la tarjeta existe
    const [existingCard] = await db
      .select({ id: card.id, title: card.title, listId: card.listId })
      .from(card)
      .where(eq(card.id, validated.data.cardId))
      .limit(1)

    if (!existingCard) {
      return {
        success: false,
        error: 'La tarjeta no existe',
      }
    }

    // 4. Verificar que el usuario actual puede asignar miembros
    const canAssign = await canUserAssignCardMembers(
      validated.data.cardId,
      currentUser.id,
    )

    if (!canAssign) {
      return {
        success: false,
        error: 'No tienes permisos para asignar miembros a esta tarjeta',
      }
    }

    // 5. Verificar que el usuario a asignar existe
    const [userToAssign] = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, validated.data.userId))
      .limit(1)

    if (!userToAssign) {
      return {
        success: false,
        error: 'El usuario no existe',
      }
    }

    // 6. Verificar que el usuario es miembro del tablero
    const boardId = await getBoardIdFromCard(validated.data.cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'No se pudo obtener el tablero de la tarjeta',
      }
    }

    const hasAccess = await hasUserBoardAccess(boardId, validated.data.userId)
    if (!hasAccess) {
      return {
        success: false,
        error: 'Solo los miembros del tablero pueden ser asignados a tarjetas',
      }
    }

    // 7. Verificar que el usuario no está ya asignado
    const isAssigned = await isUserAssignedToCard(
      validated.data.cardId,
      validated.data.userId,
    )

    if (isAssigned) {
      return {
        success: false,
        error: 'Este usuario ya está asignado a la tarjeta',
      }
    }

    // 8. Generar ID único
    const memberId = crypto.randomUUID()

    // 9. Insertar en base de datos
    const [newMember] = await db
      .insert(cardMember)
      .values({
        id: memberId,
        cardId: validated.data.cardId,
        userId: validated.data.userId,
      })
      .returning()

    if (!newMember) {
      return {
        success: false,
        error: 'Error al asignar el miembro',
      }
    }

    // 10. Obtener datos completos del usuario
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
        error: 'Error al obtener datos del miembro',
      }
    }

    // 11. Log activity
    await logActivity({
      userId: currentUser.id,
      actionType: ACTIVITY_TYPES.CARD_MEMBER_ADDED,
      entityType: ENTITY_TYPES.CARD,
      entityId: validated.data.cardId,
      boardId,
      metadata: {
        cardTitle: existingCard.title,
        memberId: validated.data.userId,
        memberName: memberUser.name || memberUser.email,
        memberEmail: memberUser.email,
      },
      newValues: {
        userId: validated.data.userId,
      },
    })

    // 12. Revalidar cache
    revalidatePath(`/boards/${boardId}`)
    revalidateTag(`board:${boardId}:lists`, { expire: 0 })

    return {
      success: true,
      data: {
        id: newMember.id,
        cardId: newMember.cardId,
        userId: newMember.userId,
        createdAt: newMember.createdAt,
        user: memberUser,
      },
    }
  } catch (error) {
    logError(error, 'assignCardMember')

    return {
      success: false,
      error: 'Error al asignar el miembro. Por favor, intenta de nuevo.',
    }
  }
}

/**
 * Desasigna un miembro de una tarjeta.
 * Solo los colaboradores o propietarios del tablero pueden desasignar.
 */
export async function unassignCardMember(
  data: TUnassignCardMemberInput,
): Promise<TUnassignCardMemberResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión para desasignar miembros',
    }
  }

  // 2. Validar datos de entrada
  const validated = unassignCardMemberSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  try {
    // 3. Verificar que la tarjeta existe
    const [existingCard] = await db
      .select({ id: card.id, title: card.title })
      .from(card)
      .where(eq(card.id, validated.data.cardId))
      .limit(1)

    if (!existingCard) {
      return {
        success: false,
        error: 'La tarjeta no existe',
      }
    }

    // 4. Verificar que el usuario actual puede desasignar miembros
    const canAssign = await canUserAssignCardMembers(
      validated.data.cardId,
      currentUser.id,
    )

    if (!canAssign) {
      return {
        success: false,
        error: 'No tienes permisos para desasignar miembros de esta tarjeta',
      }
    }

    // 5. Verificar que el miembro está asignado
    const isAssigned = await isUserAssignedToCard(
      validated.data.cardId,
      validated.data.userId,
    )

    if (!isAssigned) {
      return {
        success: false,
        error: 'Este usuario no está asignado a la tarjeta',
      }
    }

    // 6. Obtener datos del usuario para logging
    const [memberUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, validated.data.userId))
      .limit(1)

    // 7. Obtener board ID
    const boardId = await getBoardIdFromCard(validated.data.cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'No se pudo obtener el tablero de la tarjeta',
      }
    }

    // 8. Eliminar la asignación
    await db
      .delete(cardMember)
      .where(
        and(
          eq(cardMember.cardId, validated.data.cardId),
          eq(cardMember.userId, validated.data.userId),
        ),
      )

    // 9. Log activity
    if (memberUser) {
      await logActivity({
        userId: currentUser.id,
        actionType: ACTIVITY_TYPES.CARD_MEMBER_REMOVED,
        entityType: ENTITY_TYPES.CARD,
        entityId: validated.data.cardId,
        boardId,
        metadata: {
          cardTitle: existingCard.title,
          memberName: memberUser.name || memberUser.email,
          memberEmail: memberUser.email,
        },
        previousValues: {
          userId: validated.data.userId,
        },
      })
    }

    // 10. Revalidar cache
    revalidatePath(`/boards/${boardId}`)
    revalidateTag(`board:${boardId}:lists`, { expire: 0 })

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'unassignCardMember')

    return {
      success: false,
      error: 'Error al desasignar el miembro. Por favor, intenta de nuevo.',
    }
  }
}

/**
 * Obtiene los miembros asignados a una tarjeta.
 */
export async function getCardMembersAction(
  cardId: string,
): Promise<TCardMembersListResult> {
  // 1. Verificar autenticación
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'Debes iniciar sesión',
    }
  }

  try {
    // 2. Verificar que la tarjeta existe
    const [existingCard] = await db
      .select({ id: card.id })
      .from(card)
      .where(eq(card.id, cardId))
      .limit(1)

    if (!existingCard) {
      return {
        success: false,
        error: 'La tarjeta no existe',
      }
    }

    // 3. Verificar que el usuario tiene acceso al tablero
    const boardId = await getBoardIdFromCard(cardId)
    if (!boardId) {
      return {
        success: false,
        error: 'No se pudo obtener el tablero de la tarjeta',
      }
    }

    const hasAccess = await hasUserBoardAccess(boardId, currentUser.id)
    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes acceso a este tablero',
      }
    }

    // 4. Obtener miembros
    const members = await db
      .select({
        id: cardMember.id,
        cardId: cardMember.cardId,
        userId: cardMember.userId,
        createdAt: cardMember.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(cardMember)
      .innerJoin(user, eq(cardMember.userId, user.id))
      .where(eq(cardMember.cardId, cardId))
      .orderBy(cardMember.createdAt)

    return {
      success: true,
      data: members,
    }
  } catch (error) {
    logError(error, 'getCardMembersAction')

    return {
      success: false,
      error: 'Error al obtener miembros de la tarjeta',
    }
  }
}
