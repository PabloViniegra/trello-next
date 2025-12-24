/**
 * Server Actions for Activity Management
 * Handles activity-related operations with proper authentication
 */

'use server'

import { getActivityByBoard } from '@/lib/activity/queries'
import type { TActivityLogWithUser } from '@/lib/activity/types'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logger } from '@/lib/utils/logger'

/**
 * Get recent activities for a board (server action)
 */
export async function getBoardActivitiesAction(
  boardId: string,
  limit = 20,
  offset = 0,
): Promise<{
  success: boolean
  activities?: TActivityLogWithUser[]
  error?: string
}> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    // Get activities (includes authorization check)
    const activities = await getActivityByBoard(boardId, user.id, limit, offset)

    return { success: true, activities }
  } catch (error) {
    // Handle authorization errors with user-friendly message
    if (error instanceof Error && error.message.includes('acceso')) {
      return { success: false, error: error.message }
    }
    logger.error('Failed to get board activities', error, { boardId })
    return { success: false, error: 'Error al cargar las actividades' }
  }
}
