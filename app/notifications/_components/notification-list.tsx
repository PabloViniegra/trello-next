'use client'

/**
 * NotificationList Component
 * Displays paginated list of notifications with filters
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  deleteNotificationAction,
  markAllAsReadAction,
  markAsReadAction,
} from '@/lib/notification/actions'
import { formatNotificationTime } from '@/lib/notification/formatters'
import {
  getNotificationColor,
  getNotificationIcon,
} from '@/lib/notification/icons'
import type { TNotificationWithActivity } from '@/lib/notification/types'
import { cn } from '@/lib/utils'

interface NotificationListProps {
  notifications: TNotificationWithActivity[]
  currentFilter: 'all' | 'unread' | 'read'
  currentPage: number
  hasMore: boolean
}

export function NotificationList({
  notifications: initialNotifications,
  currentFilter,
  currentPage,
  hasMore,
}: NotificationListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter((n) => n.isRead === 0).length

  // Change filter
  const setFilter = (filter: 'all' | 'unread' | 'read') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filter)
    params.delete('page') // Reset to page 1
    router.push(`/notifications?${params.toString()}`)
  }

  // Change page
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/notifications?${params.toString()}`)
  }

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    const result = await markAsReadAction({ notificationId: id })
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n)),
      )
      router.refresh()
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    const result = await markAllAsReadAction()
    if (result.success) {
      toast.success('Todas las notificaciones marcadas como leídas')
      router.refresh()
    } else {
      toast.error(result.error || 'Error al marcar como leídas')
    }
    setIsLoading(false)
  }

  // Delete notification
  const handleDelete = async (id: string) => {
    const result = await deleteNotificationAction({ notificationId: id })
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success('Notificación eliminada')
      router.refresh()
    } else {
      toast.error(result.error || 'Error al eliminar')
    }
  }

  // Navigate to entity
  const handleNavigate = (notification: TNotificationWithActivity) => {
    if (notification.metadata?.boardId) {
      const boardId = notification.metadata.boardId as string
      const cardId = notification.metadata.cardId as string | undefined

      const url = cardId
        ? `/boards/${boardId}?card=${cardId}`
        : `/boards/${boardId}`

      router.push(url)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Filter Tabs */}
      <div className='flex items-center justify-between'>
        <div className='inline-flex rounded-lg border p-1'>
          <Button
            variant={currentFilter === 'all' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={currentFilter === 'unread' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setFilter('unread')}
            className='gap-2'
          >
            No leídas
            {unreadCount > 0 && (
              <Badge variant='destructive' className='h-5 min-w-[20px] px-1'>
                {unreadCount.toString()}
              </Badge>
            )}
          </Button>
          <Button
            variant={currentFilter === 'read' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setFilter('read')}
          >
            Leídas
          </Button>
        </div>

        {unreadCount > 0 && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center'>
          <p className='text-muted-foreground'>
            {currentFilter === 'unread'
              ? 'No tienes notificaciones sin leer'
              : currentFilter === 'read'
                ? 'No tienes notificaciones leídas'
                : 'No tienes notificaciones'}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.notificationType)
            const iconColor = getNotificationColor(
              notification.notificationType,
            )
            const isUnread = notification.isRead === 0

            return (
              <div
                key={notification.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  isUnread && 'bg-blue-50 dark:bg-blue-950/20',
                )}
              >
                <div className='flex gap-4'>
                  {/* Icon */}
                  <div className={cn('mt-1 flex-shrink-0', iconColor)}>
                    <Icon className='h-6 w-6' />
                  </div>

                  {/* Content */}
                  <div className='flex-1 space-y-2'>
                    {/* Title with unread indicator */}
                    <div className='flex items-start gap-2'>
                      {isUnread && (
                        <div className='mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500' />
                      )}
                      <div className='flex-1'>
                        <p
                          className={cn(
                            'text-sm',
                            isUnread ? 'font-semibold' : 'font-medium',
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {notification.message}
                        </p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          {formatNotificationTime(
                            new Date(notification.createdAt),
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-2'>
                      {notification.metadata &&
                        'boardId' in notification.metadata &&
                        typeof notification.metadata.boardId === 'string' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleNavigate(notification)}
                          >
                            Ver
                          </Button>
                        )}
                      {isUnread && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marcar como leída
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(notification.id)}
                        className='text-destructive hover:text-destructive'
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {(currentPage > 1 || hasMore) && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Anterior
          </Button>
          <span className='text-sm text-muted-foreground'>
            Página {currentPage}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(currentPage + 1)}
            disabled={!hasMore}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  )
}
