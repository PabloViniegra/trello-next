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

/**
 * Create a hash of the data to detect changes
 * Includes list, card, label, member, and all card property details
 */
function createDataHash(data: TListWithCardsAndLabels[]): string {
  return JSON.stringify(
    data.map((list) => ({
      id: list.id,
      title: list.title,
      position: list.position,
      cards: list.cards.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        position: c.position,
        listId: c.listId,
        dueDate: c.dueDate?.toISOString() || null,
        // Include labels to detect label changes
        labelIds: c.labels?.map((l) => l.id).sort() || [],
        // Include members to detect member changes
        memberIds: c.members?.map((m) => m.userId).sort() || [],
      })),
    })),
  )
}

export function useBoardStream(
  boardId: string,
  initialLists: TListWithCardsAndLabels[] = [],
): TBoardStreamState {
  const [lists, setLists] = useState<TListWithCardsAndLabels[]>(initialLists)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Use refs to avoid stale closures and unnecessary re-renders
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastHashRef = useRef<string>(createDataHash(initialLists))
  const boardIdRef = useRef(boardId)

  // Update boardId ref when it changes
  useEffect(() => {
    boardIdRef.current = boardId
  }, [boardId])

  // Fetch latest board data
  const fetchData = useCallback(async () => {
    const currentBoardId = boardIdRef.current

    try {
      // Add timestamp to bust any potential caching
      const response = await fetch(
        `/boards/${currentBoardId}/lists?_t=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.lists) {
        const newHash = createDataHash(data.lists)
        const changed = newHash !== lastHashRef.current

        // Only update state if data actually changed
        if (changed) {
          lastHashRef.current = newHash
          setLists(data.lists)
          setLastUpdate(Date.now())
        }

        setIsConnected(true)
      }
    } catch (error) {
      console.error('[BoardStream] Fetch error:', error)
      setIsConnected(false)
    }
  }, [])

  // Setup polling on mount - only depends on boardId
  useEffect(() => {
    // Reset hash with initial data when board changes
    lastHashRef.current = createDataHash(initialLists)
    setLists(initialLists)

    // Start polling after a short delay
    const initialTimeout = setTimeout(() => {
      fetchData()
    }, 1000)

    // Then poll at regular intervals
    pollingRef.current = setInterval(fetchData, POLLING_INTERVAL)

    // Cleanup on unmount or board change
    return () => {
      clearTimeout(initialTimeout)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [fetchData, initialLists])

  return {
    lists,
    isConnected,
    lastUpdate,
    mode: isConnected ? 'polling' : 'disconnected',
  }
}
