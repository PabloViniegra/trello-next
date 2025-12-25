'use client'

import { Activity, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { getBoardActivitiesAction } from '@/lib/activity/actions'
import type { TActivityLogWithUser } from '@/lib/activity/types'
import { cn } from '@/lib/utils'
import { useActivityStream } from '../_hooks/use-activity-stream'
import { ActivityItem } from './activity-item'

type TActivitySheetProps = {
  boardId: string
  initialActivities?: TActivityLogWithUser[]
}

export function ActivitySheet({
  boardId,
  initialActivities = [],
}: TActivitySheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use SSE for real-time updates
  const { activities, isConnected, lastUpdate } = useActivityStream(
    boardId,
    initialActivities,
  )

  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  // Manual refresh function
  const refreshActivities = useCallback(async () => {
    try {
      const result = await getBoardActivitiesAction(boardId, 20)

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh activities')
      }
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

      setOffset((prev) => prev + 20)
      setHasMore(newActivities.length === 20)
    } catch (error) {
      console.error('Error loading more activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50'
          title='Ver actividad del tablero'
        >
          <Activity className='h-6 w-6' />
          {activities.length > 0 && (
            <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
              {activities.length > 9 ? '9+' : activities.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side='right'
        className='w-full sm:w-[480px] p-0 flex flex-col'
      >
        {/* Header */}
        <SheetHeader className='px-6 py-4 border-b space-y-2'>
          <SheetTitle className='text-xl font-bold'>
            Actividad del Tablero
          </SheetTitle>

          {/* Connection Status */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
                )}
              />
              <span className='font-medium'>
                {isConnected ? 'En vivo' : 'Desconectado'}
              </span>
              {lastUpdate > 0 && (
                <span className='hidden sm:inline'>
                  • Actualizado {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>

            <Button
              variant='ghost'
              size='sm'
              onClick={refreshActivities}
              className='h-7 px-2'
              title='Refrescar actividades'
            >
              <RefreshCw className='h-3.5 w-3.5' />
            </Button>
          </div>

          <SheetDescription className='text-xs'>
            Historial completo de acciones realizadas en este tablero
          </SheetDescription>
        </SheetHeader>

        {/* Activities List - Scrollable */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {activities.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center py-12'>
              <Activity className='h-12 w-12 text-muted-foreground/30 mb-3' />
              <p className='text-sm font-medium text-muted-foreground'>
                No hay actividad reciente
              </p>
              <p className='text-xs text-muted-foreground/70 mt-1'>
                Las acciones realizadas en este tablero aparecerán aquí
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className='flex justify-center pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={loadMoreActivities}
                    disabled={isLoading}
                    className='h-9'
                  >
                    {isLoading ? (
                      <>
                        <div className='mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground' />
                        Cargando...
                      </>
                    ) : (
                      'Cargar más actividades'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && activities.length === 0 && (
            <div className='space-y-3'>
              {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map(
                (key) => (
                  <div
                    key={key}
                    className='flex gap-3 rounded-lg border border-border bg-card p-4'
                  >
                    <Skeleton className='h-10 w-10 rounded-full shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
