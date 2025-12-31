'use client'

/**
 * NotificationDropdown Component
 * Displays list of notifications in a popover dropdown
 */

import { Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
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

interface NotificationDropdownProps {
  notifications: TNotificationWithActivity[]
  isLoading: boolean
  onClose: () => void
  onRefresh: () => void
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onClose,
  onRefresh,
}: NotificationDropdownProps) {
  const router = useRouter()
  const unreadCount = notifications.filter((n) => n.isRead === 0).length

  // Mark notification as read and navigate
  const handleNotificationClick = async (
    notification: TNotificationWithActivity,
  ) => {
    // Mark as read if unread
    if (notification.isRead === 0) {
      await markAsReadAction({ notificationId: notification.id })
    }

    // Navigate to entity if metadata has boardId
    if (notification.metadata?.boardId) {
      const boardId = notification.metadata.boardId as string
      const cardId = notification.metadata.cardId as string | undefined

      // Build URL
      const url = cardId
        ? `/boards/${boardId}?card=${cardId}`
        : `/boards/${boardId}`

      onClose()
      router.push(url)
    } else {
      onRefresh()
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsReadAction()
    onRefresh()
  }

  if (isLoading) {
    return (
      <div className='w-full p-4'>
        <Skeleton className='h-6 w-32 mb-4' />
        <div className='space-y-2'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex items-center justify-between border-b p-4'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold text-sm'>Notificaciones</h3>
          {unreadCount > 0 && (
            <span className='flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white'>
              {unreadCount}
            </span>
          )}
        </div>
        <div className='flex items-center gap-1'>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMarkAllAsRead}
              className='text-xs'
            >
              Marcar todas leídas
            </Button>
          )}
          <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
            <Link href='/settings/notifications' onClick={onClose}>
              <Settings className='h-4 w-4' />
              <span className='sr-only'>Configuración</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className='h-[400px]'>
        {notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <p className='text-sm text-muted-foreground'>
              No tienes notificaciones
            </p>
          </div>
        ) : (
          <div className='divide-y'>
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.notificationType)
              const iconColor = getNotificationColor(
                notification.notificationType,
              )
              const isUnread = notification.isRead === 0

              return (
                <button
                  key={notification.id}
                  type='button'
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full p-4 text-left transition-colors hover:bg-muted/50',
                    isUnread && 'bg-blue-50 dark:bg-blue-950/20',
                  )}
                >
                  <div className='flex gap-3'>
                    {/* Icon */}
                    <div className={cn('mt-0.5 shrink-0', iconColor)}>
                      <Icon className='h-5 w-5' />
                    </div>

                    {/* Content */}
                    <div className='flex-1 space-y-1'>
                      {/* Unread indicator */}
                      {isUnread && (
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-2 rounded-full bg-blue-500' />
                        </div>
                      )}

                      {/* Title */}
                      <p
                        className={cn(
                          'text-sm',
                          isUnread ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {notification.title}
                      </p>

                      {/* Message */}
                      <p className='text-xs text-muted-foreground line-clamp-2'>
                        {notification.message}
                      </p>

                      {/* Time */}
                      <p className='text-xs text-muted-foreground'>
                        {formatNotificationTime(
                          new Date(notification.createdAt),
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className='border-t p-2'>
          <Button variant='ghost' className='w-full text-sm' size='sm' asChild>
            <Link href='/notifications' onClick={onClose}>
              Ver todas las notificaciones
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
