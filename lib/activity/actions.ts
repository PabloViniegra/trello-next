/**
 * Server Actions for Activity Management
 * Handles activity-related operations with proper authentication
 */

'use server'

import { getActivityByBoard } from '@/lib/activity/queries'
import { getCurrentUser } from '@/lib/auth/get-user'
import type { TActivityLogWithUser } from '@/lib/activity/types'

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

    // Get activities
    const activities = await getActivityByBoard(boardId, limit, offset)

    return { success: true, activities }
  } catch (error) {
    console.error('Error getting board activities:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
