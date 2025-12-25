'use client'

import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getBoardActivitiesAction } from '@/lib/activity/actions'
import type { TActivityLogWithUser } from '@/lib/activity/types'
import { cn } from '@/lib/utils'
import { useActivityStream } from '../_hooks/use-activity-stream'
import { ActivityItem } from './activity-item'

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
  // Use SSE for real-time updates
  const { activities, isConnected, lastUpdate } = useActivityStream(
    boardId,
    initialActivities,
  )

  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  // Manual refresh function (for button click)
  const refreshActivities = useCallback(async () => {
    try {
      const result = await getBoardActivitiesAction(boardId, 20)

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh activities')
      }

      // SSE will handle updates automatically, this is just for manual refresh
    } catch (error) {
      console.error('Error refreshing activities:', error)
    }
  }, [boardId])

  const loadMoreActivities = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const result = await getBoardActivitiesAction(boardId, 20, offset)

      if (!result.success) {
        throw new Error(result.error || 'Failed to load more activities')
      }

      const newActivities: TActivityLogWithUser[] = result.activities || []

      // Note: SSE provides real-time updates, load more is for pagination only
      setOffset((prev) => prev + 20)
      setHasMore(newActivities.length === 20)
    } catch (error) {
      console.error('Error loading more activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // No need for polling - SSE handles real-time updates automatically

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
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
              )}
            />
            {isConnected ? 'En vivo' : 'Desconectado'}
            {lastUpdate > 0 && (
              <span className='ml-2'>
                • Actualizado {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={refreshActivities}
            className='h-6 px-2 text-xs'
            title='Refrescar actividades'
          >
            <RefreshCw className='h-3 w-3' />
          </Button>
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
