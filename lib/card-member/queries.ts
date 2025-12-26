import { and, eq } from 'drizzle-orm'
import { cache } from 'react'
import { user } from '@/auth-schema'
import { db } from '@/db'
import { card, cardMember, list } from '@/db/schema'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import type { TCardMember } from './types'

/**
 * Obtiene todos los miembros asignados a una tarjeta.
 * Función cacheada para optimizar consultas repetidas.
 * @returns Promise<TCardMember[]> - Lista de miembros asignados
 */
export const getCardMembers = cache(
  async (cardId: string): Promise<TCardMember[]> => {
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

    return members
  },
)

/**
 * Verifica si un usuario está asignado a una tarjeta.
 * @returns Promise<boolean> - true si el usuario está asignado
 */
export const isUserAssignedToCard = cache(
  async (cardId: string, userId: string): Promise<boolean> => {
    const [result] = await db
      .select({ id: cardMember.id })
      .from(cardMember)
      .where(and(eq(cardMember.cardId, cardId), eq(cardMember.userId, userId)))
      .limit(1)

    return !!result
  },
)

/**
 * Verifica si un usuario puede asignar miembros a una tarjeta.
 * El usuario debe ser propietario o miembro del tablero.
 * @returns Promise<boolean> - true si el usuario puede asignar
 */
export const canUserAssignCardMembers = cache(
  async (cardId: string, userId: string): Promise<boolean> => {
    // Get board ID from card
    const [cardData] = await db
      .select({ boardId: list.boardId })
      .from(card)
      .innerJoin(list, eq(card.listId, list.id))
      .where(eq(card.id, cardId))
      .limit(1)

    if (!cardData) return false

    return await hasUserBoardAccess(cardData.boardId, userId)
  },
)

/**
 * Obtiene el ID del tablero de una tarjeta.
 * @returns Promise<string | null> - ID del tablero o null
 */
export const getBoardIdFromCard = cache(
  async (cardId: string): Promise<string | null> => {
    const [cardData] = await db
      .select({ boardId: list.boardId })
      .from(card)
      .innerJoin(list, eq(card.listId, list.id))
      .where(eq(card.id, cardId))
      .limit(1)

    return cardData?.boardId || null
  },
)
