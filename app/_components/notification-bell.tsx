'use client'

/**
 * NotificationBell Component
 * Displays notification icon with unread count badge in navbar
 */

import { Bell } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getNotificationsAction } from '@/lib/notification/actions'
import type { TNotificationWithActivity } from '@/lib/notification/types'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<
    TNotificationWithActivity[]
  >([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    const result = await getNotificationsAction(10, 0)

    if (result.success) {
      setNotifications(result.notifications || [])
      setUnreadCount(result.unreadCount || 0)
    }

    setIsLoading(false)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  // Format badge count (9+ for > 9)
  const badgeCount = unreadCount > 9 ? '9+' : unreadCount.toString()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative'
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center',
                'rounded-full bg-red-500 px-1 text-[10px] font-bold text-white',
                'ring-2 ring-background',
              )}
              aria-hidden='true'
            >
              {badgeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-96 p-0' align='end'>
        <div className='p-4'>
          <h3 className='font-semibold text-sm mb-2'>Notificaciones</h3>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>Cargando...</p>
          ) : notifications.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No tienes notificaciones
            </p>
          ) : (
            <div className='space-y-2'>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-2 rounded text-sm',
                    notification.isRead === 0
                      ? 'bg-blue-50 dark:bg-blue-950'
                      : 'opacity-75',
                  )}
                >
                  <p className='font-medium'>{notification.title}</p>
                  <p className='text-muted-foreground text-xs'>
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
