import { NextRequest, NextResponse } from 'next/server'
import { getActivityByBoard } from '@/lib/activity/queries'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const querySchema = z.object({
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
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

    const boardId = params.id
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      offset: searchParams.get('offset'),
      limit: searchParams.get('limit'),
    })

    // Get activities for this board
    const activities = await getActivityByBoard(
      boardId,
      query.limit,
      query.offset,
    )

    return NextResponse.json({
      activities,
      hasMore: activities.length === query.limit,
    })
  } catch (error) {
    console.error('Error fetching board activity:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
