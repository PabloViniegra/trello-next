/**
 * useBoardStream Hook
 * Manages Server-Sent Events (SSE) connection for real-time board updates
 *
 * Automatically syncs lists and cards across all connected clients.
 * When any user creates/updates/deletes a card or list, all other users
 * see the changes within 3 seconds without manual refresh.
 *
 * Features:
 * - Auto-reconnection on disconnect
 * - Connection status tracking
 * - Last update timestamp
 * - Graceful error handling
 *
 * @param boardId - The board ID to stream updates for
 * @param initialLists - Initial lists data from server
 * @returns Current lists, connection status, and last update timestamp
 *
 * @example
 * ```tsx
 * const { lists, isConnected, lastUpdate } = useBoardStream(boardId, initialLists)
 *
 * return (
 *   <div>
 *     <ConnectionIndicator isConnected={isConnected} />
 *     {lists.map(list => <List key={list.id} {...list} />)}
 *   </div>
 * )
 * ```
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { TListWithCardsAndLabels } from '@/lib/list/types'
import { logger } from '@/lib/utils/logger'

type TBoardStreamState = {
  /** Current board lists with cards and labels */
  lists: TListWithCardsAndLabels[]
  /** Whether SSE connection is active */
  isConnected: boolean
  /** Timestamp of last update received (ms since epoch) */
  lastUpdate: number
}

type TSSEMessage = {
  type: 'connected' | 'board_update' | 'heartbeat' | 'error'
  boardId?: string
  lists?: TListWithCardsAndLabels[]
  timestamp?: number
  message?: string
}

export function useBoardStream(
  boardId: string,
  initialLists: TListWithCardsAndLabels[] = [],
): TBoardStreamState {
  const [state, setState] = useState<TBoardStreamState>({
    lists: initialLists,
    isConnected: false,
    lastUpdate: Date.now(),
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource(`/boards/${boardId}/stream`)
    eventSourceRef.current = eventSource

    logger.info('SSE connection initiated', { boardId })

    // Handle connection established
    eventSource.addEventListener('connection', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)

        if (data.type === 'connected') {
          setState((prev) => ({
            ...prev,
            isConnected: true,
          }))

          logger.info('SSE connection established', { boardId })
        }
      } catch (error) {
        logger.error('Error parsing connection message', error, { boardId })
      }
    })

    // Handle board updates (lists/cards changed)
    eventSource.addEventListener('board_update', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)

        if (data.type === 'board_update' && data.lists) {
          setState((prev) => ({
            ...prev,
            lists: data.lists || prev.lists,
            lastUpdate: Date.now(),
          }))

          logger.info('Board update received', {
            boardId,
            listCount: data.lists.length,
            timestamp: data.timestamp,
          })
        }
      } catch (error) {
        logger.error('Error parsing board update', error, { boardId })
      }
    })

    // Handle heartbeat (keeps connection alive)
    eventSource.addEventListener('heartbeat', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)

        if (data.type === 'heartbeat') {
          // Connection is still alive, no state update needed
          logger.debug('SSE heartbeat received', { boardId })
        }
      } catch (error) {
        logger.error('Error parsing heartbeat', error, { boardId })
      }
    })

    // Handle errors from server
    eventSource.addEventListener('error', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)

        if (data.type === 'error') {
          logger.warn('SSE server error', {
            boardId,
            message: data.message,
          })
        }
      } catch {
        // Ignore parsing errors on error events
      }
    })

    // Handle connection errors (network issues, server down, etc.)
    eventSource.onerror = () => {
      logger.warn('SSE connection error', { boardId })

      setState((prev) => ({
        ...prev,
        isConnected: false,
      }))

      // EventSource will automatically try to reconnect
      // We update the UI to show disconnected state
    }

    // Cleanup on unmount or boardId change
    return () => {
      logger.info('Closing SSE connection', { boardId })

      eventSource.close()

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      setState((prev) => ({
        ...prev,
        isConnected: false,
      }))
    }
  }, [boardId])

  return state
}
