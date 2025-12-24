import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getActivityByBoard } from '@/lib/activity/queries'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/utils/logger'

const querySchema = z.object({
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para ver la actividad' },
        { status: 401 },
      )
    }

    const { id: boardId } = await params
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      offset: searchParams.get('offset'),
      limit: searchParams.get('limit'),
    })

    // Get activities for this board (includes authorization check)
    const activities = await getActivityByBoard(
      boardId,
      session.user.id,
      query.limit,
      query.offset,
    )

    return NextResponse.json({
      activities,
      hasMore: activities.length === query.limit,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.issues },
        { status: 400 },
      )
    }

    // Handle authorization errors
    if (error instanceof Error && error.message.includes('acceso')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    const { id: boardId } = await params
    logger.error('Failed to fetch board activity', error, { boardId })

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
