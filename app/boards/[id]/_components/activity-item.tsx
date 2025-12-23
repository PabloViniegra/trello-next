'use client'

import type { TActivityLogWithUser } from '@/lib/activity/types'
import {
  formatActivityMessage,
  formatRelativeTime,
  getActivityColor,
  getActivityIcon,
} from '@/lib/activity/formatters'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

type TActivityItemProps = {
  activity: TActivityLogWithUser
  showBoardName?: boolean
}

export function ActivityItem({
  activity,
  showBoardName = false,
}: TActivityItemProps) {
  const message = formatActivityMessage(activity)
  const relativeTime = formatRelativeTime(activity.createdAt)
  const iconName = getActivityIcon(activity.actionType)
  const colorClass = getActivityColor(activity.actionType)

  // Get the icon component dynamically
  const IconComponent =
    LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Activity

  // Get user initials for avatar fallback
  const userInitials = activity.user?.name
    ? activity.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  return (
    <div className='flex gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground transition-colors hover:bg-accent/50'>
      {/* User Avatar */}
      <Avatar className='h-8 w-8 shrink-0'>
        <AvatarImage
          src={activity.user?.image || undefined}
          alt={activity.user?.name || 'Usuario'}
        />
        <AvatarFallback className='text-xs'>{userInitials}</AvatarFallback>
      </Avatar>

      <div className='flex-1 space-y-1'>
        {/* Activity Header */}
        <div className='flex items-start gap-2'>
          <div className='flex items-center gap-1.5'>
            <span className='text-sm font-medium text-foreground'>
              {activity.user?.name || 'Usuario desconocido'}
            </span>
            <IconComponent className={cn('h-4 w-4 shrink-0', colorClass)} />
          </div>
        </div>

        {/* Activity Message */}
        <p className='text-sm text-muted-foreground'>{message}</p>

        {/* Activity Timestamp */}
        <p className='text-xs text-muted-foreground/70'>{relativeTime}</p>
      </div>
    </div>
  )
}
