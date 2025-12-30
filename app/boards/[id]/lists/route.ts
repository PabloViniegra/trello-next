/**
 * REST endpoint for fetching board lists
 * Used as polling fallback when SSE is not available (production environments)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { getListsWithCardsAndLabelsByBoardId } from '@/lib/list/queries'
import { logger } from '@/lib/utils/logger'

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para ver las listas' },
        { status: 401 },
      )
    }

    const { id: boardId } = await params

    // 2. Verify board access
    const hasAccess = await hasUserBoardAccess(boardId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este tablero' },
        { status: 403 },
      )
    }

    // 3. Fetch lists with cards
    const lists = await getListsWithCardsAndLabelsByBoardId(boardId)

    // 4. Return with cache-busting headers
    return NextResponse.json(
      { lists, timestamp: Date.now() },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    )
  } catch (error) {
    const { id: boardId } = await params

    logger.error('Failed to fetch board lists', error, { boardId })

    return NextResponse.json(
      { error: 'Error al obtener las listas del tablero' },
      { status: 500 },
    )
  }
}
