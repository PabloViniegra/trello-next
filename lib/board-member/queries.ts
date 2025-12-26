import { and, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/db'
import { board, boardMember } from '@/db/schema'

/**
 * Verifica si un usuario es propietario de un tablero.
 * Función cacheada para optimizar consultas repetidas.
 * @returns Promise<boolean> - true si el usuario es propietario
 */
export const isUserBoardOwner = cache(
  async (boardId: string, userId: string): Promise<boolean> => {
    const [result] = await db
      .select({ ownerId: board.ownerId })
      .from(board)
      .where(eq(board.id, boardId))
      .limit(1)

    return result?.ownerId === userId
  },
)

/**
 * Verifica si un usuario es miembro de un tablero.
 * Función cacheada para optimizar consultas repetidas.
 * @returns Promise<boolean> - true si el usuario es miembro
 */
export const isUserBoardMember = cache(
  async (boardId: string, userId: string): Promise<boolean> => {
    const [result] = await db
      .select({ id: boardMember.id })
      .from(boardMember)
      .where(
        and(eq(boardMember.boardId, boardId), eq(boardMember.userId, userId)),
      )
      .limit(1)

    return !!result
  },
)

/**
 * Verifica si un usuario tiene acceso a un tablero (propietario o miembro).
 * NO verifica privacidad - usar hasUserBoardAccessWithPrivacy para eso.
 * @returns Promise<boolean> - true si el usuario tiene acceso
 */
export const hasUserBoardAccess = cache(
  async (boardId: string, userId: string): Promise<boolean> => {
    const isOwner = await isUserBoardOwner(boardId, userId)
    if (isOwner) return true

    return await isUserBoardMember(boardId, userId)
  },
)

/**
 * Verifica si un usuario tiene acceso a un tablero considerando privacidad.
 * - Tableros públicos: accesibles por cualquier usuario autenticado
 * - Tableros privados: solo propietario y miembros
 * Función cacheada para optimizar consultas repetidas.
 * @returns Promise<boolean> - true si el usuario tiene acceso
 */
export const hasUserBoardAccessWithPrivacy = cache(
  async (boardId: string, userId: string): Promise<boolean> => {
    // Obtener información del tablero
    const [boardData] = await db
      .select({
        isPrivate: board.isPrivate,
        ownerId: board.ownerId,
      })
      .from(board)
      .where(eq(board.id, boardId))
      .limit(1)

    if (!boardData) return false

    // Tableros públicos son accesibles por cualquier usuario autenticado
    if (boardData.isPrivate === 'public') return true

    // Tableros privados solo para propietario y miembros
    return await hasUserBoardAccess(boardId, userId)
  },
)
