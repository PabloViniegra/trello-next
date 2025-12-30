/**
 * Server-Sent Events (SSE) endpoint for real-time board data updates
 * Streams list and card changes to connected clients
 *
 * Polling strategy:
 * - Checks for changes every 3 seconds
 * - Sends heartbeat every 15 seconds to keep connection alive (reduced for production)
 * - Compares timestamps to detect changes
 *
 * Security:
 * - Validates user authentication
 * - Verifies board access permissions
 * - Only sends data for boards the user has access to
 *
 * Production compatibility:
 * - Forces Node.js runtime (not Edge)
 * - Includes all necessary headers for CDN/proxy compatibility
 * - Shorter heartbeat to prevent connection timeout
 */

import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { getListsWithCardsAndLabelsByBoardId } from '@/lib/list/queries'
import { logger } from '@/lib/utils/logger'

// Force Node.js runtime for SSE support (Edge doesn't support streaming well)
export const runtime = 'nodejs'

// Disable static generation and caching for this route
export const dynamic = 'force-dynamic'

// SSE Configuration - optimized for production
const SSE_HEARTBEAT_INTERVAL = 15000 // 15 seconds - more frequent for production
const SSE_BOARD_CHECK_INTERVAL = 3000 // 3 seconds - check for board changes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authenticate user
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

    // 2. Verify board access
    const hasAccess = await hasUserBoardAccess(boardId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este tablero' },
        { status: 403 },
      )
    }

    // 3. Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Helper to send SSE event
        const sendEvent = (data: unknown, event = 'message') => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Send initial connection confirmation
        sendEvent(
          {
            type: 'connected',
            boardId,
            timestamp: Date.now(),
          },
          'connection',
        )

        // Track last update timestamp to detect changes
        let lastChecksum: string | null = null

        // Check for board changes periodically
        const boardCheckInterval = setInterval(async () => {
          try {
            // Fetch current board state
            const lists = await getListsWithCardsAndLabelsByBoardId(boardId)

            // Create checksum from lists data to detect changes
            // Include all relevant fields to detect any change
            const currentChecksum = JSON.stringify({
              listCount: lists.length,
              lists: lists.map((list) => ({
                id: list.id,
                title: list.title,
                position: list.position,
                boardId: list.boardId,
                createdAt: list.createdAt,
                cardCount: list.cards.length,
                cards: list.cards.map((card) => ({
                  id: card.id,
                  title: card.title,
                  position: card.position,
                  listId: card.listId,
                  description: card.description,
                  dueDate: card.dueDate,
                  createdAt: card.createdAt,
                })),
              })),
            })

            // Send update only if data changed
            if (currentChecksum !== lastChecksum) {
              lastChecksum = currentChecksum

              sendEvent(
                {
                  type: 'board_update',
                  boardId,
                  lists,
                  timestamp: Date.now(),
                },
                'board_update',
              )

              logger.info('Board update sent via SSE', {
                boardId,
                listCount: lists.length,
                userId: session.user.id,
              })
            }
          } catch (error) {
            logger.error('Error checking for board updates', error, {
              boardId,
              userId: session.user.id,
            })

            // Send error event to client
            sendEvent(
              {
                type: 'error',
                message: 'Error al verificar actualizaciones',
                timestamp: Date.now(),
              },
              'error',
            )
          }
        }, SSE_BOARD_CHECK_INTERVAL)

        // Send heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          sendEvent(
            {
              type: 'heartbeat',
              timestamp: Date.now(),
            },
            'heartbeat',
          )
        }, SSE_HEARTBEAT_INTERVAL)

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(boardCheckInterval)
          clearInterval(heartbeatInterval)
          controller.close()

          logger.info('SSE connection closed', {
            boardId,
            userId: session.user.id,
          })
        })
      },
    })

    // 4. Return SSE response with comprehensive headers for production
    return new Response(stream, {
      headers: {
        // Core SSE headers
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, no-transform, must-revalidate',
        Connection: 'keep-alive',

        // Prevent buffering (critical for SSE in production)
        'X-Accel-Buffering': 'no', // Nginx
        'X-Content-Type-Options': 'nosniff',

        // Vercel/Cloudflare specific
        'Transfer-Encoding': 'chunked',

        // CORS headers if needed
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })
  } catch (error) {
    const { id: boardId } = await params

    logger.error('Failed to establish SSE connection for board', error, {
      boardId,
    })

    return NextResponse.json(
      { error: 'Error al establecer conexión en tiempo real' },
      { status: 500 },
    )
  }
}
