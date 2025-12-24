/**
 * useActivityStream Hook
 * Manages Server-Sent Events (SSE) connection for real-time activity updates
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { TActivityLogWithUser } from '@/lib/activity/types'

type TActivityStreamState = {
  activities: TActivityLogWithUser[]
  isConnected: boolean
  lastUpdate: number
}

type TSSEMessage = {
  type: 'connected' | 'activity' | 'heartbeat'
  boardId?: string
  activities?: TActivityLogWithUser[]
  timestamp?: number
}

export function useActivityStream(
  boardId: string,
  initialActivities: TActivityLogWithUser[] = [],
) {
  const [state, setState] = useState<TActivityStreamState>({
    activities: initialActivities,
    isConnected: false,
    lastUpdate: Date.now(),
  })

  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource(`/boards/${boardId}/activity/stream`)
    eventSourceRef.current = eventSource

    // Handle connection event
    eventSource.addEventListener('connection', (e: MessageEvent) => {
      const data: TSSEMessage = JSON.parse(e.data)
      if (data.type === 'connected') {
        setState((prev) => ({ ...prev, isConnected: true }))
      }
    })

    // Handle activity updates
    eventSource.addEventListener('activity', (e: MessageEvent) => {
      const data: TSSEMessage = JSON.parse(e.data)
      if (data.type === 'activity' && data.activities) {
        setState((prev) => ({
          ...prev,
          activities: data.activities || prev.activities,
          lastUpdate: Date.now(),
        }))
      }
    })

    // Handle heartbeat (keeps connection alive)
    eventSource.addEventListener('heartbeat', (e: MessageEvent) => {
      const data: TSSEMessage = JSON.parse(e.data)
      if (data.type === 'heartbeat') {
        // Just keep connection alive, no state update needed
      }
    })

    // Handle errors
    eventSource.onerror = () => {
      setState((prev) => ({ ...prev, isConnected: false }))
      // EventSource will automatically reconnect
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      setState((prev) => ({ ...prev, isConnected: false }))
    }
  }, [boardId])

  return state
}
