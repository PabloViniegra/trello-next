/**
 * Server-Sent Events (SSE) endpoint for real-time activity updates
 * Provides streaming updates to connected clients
 */

import { type NextRequest, NextResponse } from 'next/server'
import { getRecentActivity } from '@/lib/activity/queries'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/utils/logger'

// Constants for SSE
const SSE_HEARTBEAT_INTERVAL = 30000 // 30 seconds
const SSE_ACTIVITY_CHECK_INTERVAL = 5000 // 5 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json(
        {
          error: 'Debes iniciar sesión para ver actualizaciones en tiempo real',
        },
        { status: 401 },
      )
    }

    const { id: boardId } = await params

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Helper to send SSE message
        const sendEvent = (data: unknown, event = 'message') => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Send initial connection message
        sendEvent({ type: 'connected', boardId }, 'connection')

        let lastActivityId: string | null = null

        // Check for new activities periodically
        const activityInterval = setInterval(async () => {
          try {
            const activities = await getRecentActivity(
              boardId,
              session.user.id,
              10,
            )

            if (activities.length > 0) {
              const latestActivity = activities[0]

              // Only send if it's a new activity
              if (latestActivity.id !== lastActivityId) {
                lastActivityId = latestActivity.id
                sendEvent(
                  {
                    type: 'activity',
                    activities: activities.slice(0, 5), // Send only latest 5
                  },
                  'activity',
                )
              }
            }
          } catch (error) {
            logger.error('Error checking for new activities', error, {
              boardId,
              userId: session.user.id,
            })
          }
        }, SSE_ACTIVITY_CHECK_INTERVAL)

        // Send heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          sendEvent({ type: 'heartbeat', timestamp: Date.now() }, 'heartbeat')
        }, SSE_HEARTBEAT_INTERVAL)

        // Cleanup on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(activityInterval)
          clearInterval(heartbeatInterval)
          controller.close()
        })
      },
    })

    // Return SSE response with proper headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    })
  } catch (error) {
    const { id: boardId } = await params
    logger.error('Failed to establish SSE connection', error, { boardId })

    return NextResponse.json(
      { error: 'Error al establecer conexión en tiempo real' },
      { status: 500 },
    )
  }
}
