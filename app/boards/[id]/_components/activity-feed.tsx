'use client'

import { useState, useEffect, useCallback } from 'react'
import { ActivityItem } from './activity-item'
import type { TActivityLogWithUser } from '@/lib/activity/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type TActivityFeedProps = {
  boardId: string
  initialActivities?: TActivityLogWithUser[]
  className?: string
}

export function ActivityFeed({
  boardId,
  initialActivities = [],
  className,
}: TActivityFeedProps) {
  const [activities, setActivities] =
    useState<TActivityLogWithUser[]>(initialActivities)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Refresh recent activities (for polling)
  const refreshActivities = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/boards/${boardId}/activity?offset=0&limit=20`,
      )
      if (!response.ok) throw new Error('Failed to refresh activities')

      const data = await response.json()
      const newActivities: TActivityLogWithUser[] = data.activities || []

      // Always update with latest activities (polling approach)
      setActivities(newActivities)
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error refreshing activities:', error)
    }
  }, [boardId])

  const loadMoreActivities = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/boards/${boardId}/activity?offset=${offset}&limit=20`,
      )
      if (!response.ok) throw new Error('Failed to load activities')

      const data = await response.json()
      const newActivities: TActivityLogWithUser[] = data.activities || []

      setActivities((prev) => [...prev, ...newActivities])
      setOffset((prev) => prev + 20)
      setHasMore(newActivities.length === 20)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshActivities()
    }, 15000) // 15 seconds

    return () => clearInterval(interval)
  }, [refreshActivities])

  const displayedActivities = isExpanded ? activities : activities.slice(0, 5)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-foreground'>
            Actividad Reciente
          </h3>
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
            Auto-refresco
          </div>
        </div>
        {activities.length > 5 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-6 px-2 text-xs'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='mr-1 h-3 w-3' />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className='mr-1 h-3 w-3' />
                Ver más ({activities.length - 5})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Activities List */}
      <div className='space-y-2'>
        {displayedActivities.length === 0 ? (
          <div className='rounded-lg border border-border bg-card p-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              No hay actividad reciente en este tablero.
            </p>
          </div>
        ) : (
          <>
            {displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}

            {/* Load More Button */}
            {isExpanded && hasMore && (
              <div className='flex justify-center pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={loadMoreActivities}
                  disabled={isLoading}
                  className='h-8'
                >
                  {isLoading ? (
                    <>
                      <div className='mr-2 h-3 w-3 animate-spin rounded-full border border-border border-t-foreground' />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && displayedActivities.length === 0 && (
        <div className='space-y-2'>
          {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div
              key={key}
              className='flex gap-3 rounded-lg border border-border bg-card p-3'
            >
              <Skeleton className='h-8 w-8 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-48' />
                <Skeleton className='h-3 w-24' />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
