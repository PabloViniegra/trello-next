/**
 * useBoardStream Hook
 * Manages real-time board updates with SSE primary + polling fallback
 *
 * Automatically syncs lists and cards across all connected clients.
 * When any user creates/updates/deletes a card or list, all other users
 * see the changes within 3-5 seconds without manual refresh.
 *
 * Strategy:
 * 1. Try SSE connection first (best for real-time)
 * 2. If SSE fails or disconnects, fall back to polling
 * 3. Auto-retry SSE periodically even when in polling mode
 *
 * Production compatibility:
 * - Works with Vercel, Railway, Render, etc.
 * - Handles proxy/CDN connection drops gracefully
 * - Polling fallback ensures updates even if SSE is blocked
 *
 * @param boardId - The board ID to stream updates for
 * @param initialLists - Initial lists data from server
 * @returns Current lists, connection status, and last update timestamp
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TListWithCardsAndLabels } from '@/lib/list/types'

// Configuration
const SSE_RETRY_DELAY = 5000 // 5 seconds before retrying SSE
const POLLING_INTERVAL = 5000 // 5 seconds polling interval as fallback
const SSE_MAX_RETRIES = 3 // Max SSE retries before switching to polling only

type TBoardStreamState = {
  /** Current board lists with cards and labels */
  lists: TListWithCardsAndLabels[]
  /** Whether real-time connection is active (SSE or polling) */
  isConnected: boolean
  /** Timestamp of last update received (ms since epoch) */
  lastUpdate: number
  /** Current connection mode */
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
  const [state, setState] = useState<TBoardStreamState>({
    lists: initialLists,
    isConnected: false,
    lastUpdate: Date.now(),
    mode: 'disconnected',
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const sseRetryCountRef = useRef(0)
  const sseRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch board data via REST API (for polling fallback)
  const fetchBoardData = useCallback(async () => {
    try {
      const response = await fetch(`/boards/${boardId}/lists`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.lists) {
        setState((prev) => ({
          ...prev,
          lists: data.lists,
          lastUpdate: Date.now(),
          isConnected: true,
          mode: 'polling',
        }))
      }
    } catch (error) {
      console.warn('[BoardStream] Polling fetch failed:', error)
    }
  }, [boardId])

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return // Already polling

    console.log('[BoardStream] Starting polling fallback')

    // Immediate first fetch
    fetchBoardData()

    // Then poll every POLLING_INTERVAL
    pollingIntervalRef.current = setInterval(fetchBoardData, POLLING_INTERVAL)

    setState((prev) => ({
      ...prev,
      isConnected: true,
      mode: 'polling',
    }))
  }, [fetchBoardData])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Setup SSE connection
  const setupSSE = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log('[BoardStream] Attempting SSE connection...')

    const eventSource = new EventSource(`/boards/${boardId}/stream`)
    eventSourceRef.current = eventSource

    // Handle successful connection
    eventSource.addEventListener('connection', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)

        if (data.type === 'connected') {
          console.log('[BoardStream] SSE connected successfully')

          // SSE working - stop polling and reset retry counter
          stopPolling()
          sseRetryCountRef.current = 0

          setState((prev) => ({
            ...prev,
            isConnected: true,
            mode: 'sse',
          }))
        }
      } catch {
        // Ignore parse errors
      }
    })

    // Handle board updates
    eventSource.addEventListener('board_update', (e: MessageEvent) => {
      try {
        const data: TSSEMessage = JSON.parse(e.data)

        if (data.type === 'board_update' && data.lists) {
          console.log(
            '[BoardStream] Received update via SSE:',
            data.lists.length,
            'lists',
          )

          setState((prev) => ({
            ...prev,
            lists: data.lists || prev.lists,
            lastUpdate: Date.now(),
            isConnected: true,
            mode: 'sse',
          }))
        }
      } catch {
        // Ignore parse errors
      }
    })

    // Handle heartbeat
    eventSource.addEventListener('heartbeat', () => {
      // Connection alive, nothing to do
    })

    // Handle SSE errors/disconnection
    eventSource.onerror = () => {
      console.warn('[BoardStream] SSE connection error/closed')

      eventSource.close()
      eventSourceRef.current = null

      sseRetryCountRef.current++

      if (sseRetryCountRef.current >= SSE_MAX_RETRIES) {
        // Too many SSE failures, switch to polling permanently
        console.log(
          '[BoardStream] SSE failed too many times, switching to polling',
        )
        startPolling()
      } else {
        // Start polling while we retry SSE
        startPolling()

        // Schedule SSE retry
        sseRetryTimeoutRef.current = setTimeout(() => {
          console.log('[BoardStream] Retrying SSE connection...')
          setupSSE()
        }, SSE_RETRY_DELAY)
      }

      setState((prev) => ({
        ...prev,
        mode: prev.mode === 'sse' ? 'polling' : prev.mode,
      }))
    }
  }, [boardId, startPolling, stopPolling])

  // Main effect - setup connection
  useEffect(() => {
    // Try SSE first
    setupSSE()

    // Cleanup on unmount
    return () => {
      console.log('[BoardStream] Cleaning up connections')

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      stopPolling()

      if (sseRetryTimeoutRef.current) {
        clearTimeout(sseRetryTimeoutRef.current)
      }
    }
  }, [setupSSE, stopPolling])

  return state
}
