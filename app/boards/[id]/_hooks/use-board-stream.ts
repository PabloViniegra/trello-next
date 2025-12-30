/**
 * useBoardStream Hook
 * Real-time board synchronization using polling
 *
 * Why polling instead of SSE?
 * - Vercel has a 30-second timeout for serverless functions
 * - SSE connections get closed after this timeout
 * - Polling every 3 seconds is reliable and provides near-real-time updates
 *
 * @param boardId - The board ID to sync
 * @param initialLists - Initial lists data from server
 * @returns Current lists, connection status, and last update timestamp
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TListWithCardsAndLabels } from '@/lib/list/types'

// Poll every 3 seconds for near-real-time experience
const POLLING_INTERVAL = 3000

type TBoardStreamState = {
  lists: TListWithCardsAndLabels[]
  isConnected: boolean
  lastUpdate: number
  mode: 'sse' | 'polling' | 'disconnected'
}

export function useBoardStream(
  boardId: string,
  initialLists: TListWithCardsAndLabels[] = [],
): TBoardStreamState {
  const [lists, setLists] = useState<TListWithCardsAndLabels[]>(initialLists)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataRef = useRef<string>('')

  // Create a hash of the data to detect changes
  const hashData = useCallback((data: TListWithCardsAndLabels[]): string => {
    return JSON.stringify(
      data.map((list) => ({
        id: list.id,
        title: list.title,
        position: list.position,
        cardIds: list.cards.map((c) => c.id).join(','),
      })),
    )
  }, [])

  // Fetch latest board data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/boards/${boardId}/lists`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.lists) {
        const newHash = hashData(data.lists)

        // Only update state if data actually changed
        if (newHash !== lastDataRef.current) {
          console.log('[BoardStream] Data changed:', data.lists.length, 'lists')
          lastDataRef.current = newHash
          setLists(data.lists)
          setLastUpdate(Date.now())
        }

        setIsConnected(true)
      }
    } catch (error) {
      console.error('[BoardStream] Fetch error:', error)
      setIsConnected(false)
    }
  }, [boardId, hashData])

  // Setup polling on mount
  useEffect(() => {
    console.log('[BoardStream] Starting polling for board:', boardId)

    // Initialize hash with initial data
    lastDataRef.current = hashData(initialLists)

    // First fetch immediately
    fetchData()

    // Then poll at interval
    pollingRef.current = setInterval(fetchData, POLLING_INTERVAL)

    // Cleanup on unmount
    return () => {
      console.log('[BoardStream] Stopping polling')
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [boardId, fetchData, hashData, initialLists])

  return {
    lists,
    isConnected,
    lastUpdate,
    mode: isConnected ? 'polling' : 'disconnected',
  }
}
