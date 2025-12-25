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
import { NotificationDropdown } from './notification-dropdown'

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
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          onRefresh={fetchNotifications}
        />
      </PopoverContent>
    </Popover>
  )
}
