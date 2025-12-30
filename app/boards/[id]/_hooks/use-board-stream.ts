/**
 * useBoardStream Hook
 * Manages Server-Sent Events (SSE) connection for real-time board updates
 *
 * @param boardId - The board ID to stream updates for
 * @param initialLists - Initial lists data from server
 * @returns Current lists, connection status, and last update timestamp
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { TListWithCardsAndLabels } from '@/lib/list/types'

type TBoardStreamState = {
  lists: TListWithCardsAndLabels[]
  isConnected: boolean
  lastUpdate: number
  mode: 'sse' | 'polling' | 'disconnected'
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
  const [lists, setLists] = useState<TListWithCardsAndLabels[]>(initialLists)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [mode, setMode] = useState<'sse' | 'polling' | 'disconnected'>(
    'disconnected',
  )

  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    console.log('[BoardStream] Setting up SSE for board:', boardId)

    const eventSource = new EventSource(`/boards/${boardId}/stream`)
    eventSourceRef.current = eventSource

    // Connection established
    eventSource.addEventListener('connection', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)
        if (data.type === 'connected') {
          console.log('[BoardStream] SSE connected successfully')
          setIsConnected(true)
          setMode('sse')
        }
      } catch (err) {
        console.error('[BoardStream] Error parsing connection:', err)
      }
    })

    // Board updates
    eventSource.addEventListener('board_update', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)
        console.log(
          '[BoardStream] Received update via SSE:',
          data.lists?.length,
          'lists',
        )

        if (data.type === 'board_update' && data.lists) {
          console.log('[BoardStream] Updating lists state with new data')
          setLists(data.lists)
          setLastUpdate(Date.now())
        }
      } catch (err) {
        console.error('[BoardStream] Error parsing board_update:', err)
      }
    })

    // Heartbeat
    eventSource.addEventListener('heartbeat', () => {
      // Connection alive
    })

    // Errors
    eventSource.onerror = () => {
      console.warn('[BoardStream] SSE connection error')
      setIsConnected(false)
      setMode('disconnected')
    }

    // Cleanup
    return () => {
      console.log('[BoardStream] Closing SSE connection')
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [boardId])

  return {
    lists,
    isConnected,
    lastUpdate,
    mode,
  }
}
