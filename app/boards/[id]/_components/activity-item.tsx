'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  formatActivityMessage,
  formatRelativeTime,
  getActivityColor,
  getActivityIcon,
} from '@/lib/activity/formatters'
import { getActivityIconComponent } from '@/lib/activity/icon-map'
import type { TActivityLogWithUser, TActivityType } from '@/lib/activity/types'
import { cn } from '@/lib/utils'

type TActivityItemProps = {
  activity: TActivityLogWithUser
}

export function ActivityItem({ activity }: TActivityItemProps) {
  const message = formatActivityMessage(activity)
  const relativeTime = formatRelativeTime(activity.createdAt)
  const iconName = getActivityIcon(activity.actionType as TActivityType)
  const colorClass = getActivityColor(activity.actionType as TActivityType)

  // Get the icon component using the static map
  const IconComponent = getActivityIconComponent(iconName)

  // Get user initials for avatar fallback
  const userInitials = activity.user?.name
    ? activity.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  // Get action type badge variant
  const actionType = activity.actionType.split('.')[1] // created, updated, deleted, moved
  const badgeVariant =
    {
      created: 'default',
      updated: 'secondary',
      deleted: 'destructive',
      moved: 'outline',
    }[actionType] || 'default'

  return (
    <div className='group relative flex gap-3 rounded-xl border border-border/50 bg-card p-4 text-card-foreground transition-all hover:border-border hover:shadow-md hover:bg-accent/30'>
      {/* Left border accent */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 rounded-l-xl transition-opacity opacity-0 group-hover:opacity-100',
          colorClass.replace('text-', 'bg-'),
        )}
      />

      {/* User Avatar */}
      <Avatar className='h-10 w-10 shrink-0 ring-2 ring-background'>
        <AvatarImage
          src={activity.user?.image || undefined}
          alt={activity.user?.name || 'Usuario'}
        />
        <AvatarFallback className='text-xs font-medium'>
          {userInitials}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0 space-y-2'>
        {/* Header with user name and action icon */}
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-sm font-semibold text-foreground'>
            {activity.user?.name || 'Usuario desconocido'}
          </span>

          <div className='flex items-center gap-1.5'>
            <IconComponent className={cn('h-3.5 w-3.5 shrink-0', colorClass)} />
            <Badge
              variant={badgeVariant as never}
              className='text-[10px] px-1.5 py-0 h-4 font-medium'
            >
              {actionType}
            </Badge>
          </div>
        </div>

        {/* Activity Message */}
        <p className='text-sm text-muted-foreground leading-relaxed break-words'>
          {message}
        </p>

        {/* Timestamp */}
        <div className='flex items-center gap-2'>
          <time className='text-xs text-muted-foreground/60 font-medium'>
            {relativeTime}
          </time>
          <span className='text-xs text-muted-foreground/40'>•</span>
          <time className='text-xs text-muted-foreground/40'>
            {new Date(activity.createdAt).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </div>
    </div>
  )
}
