'use client'

import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TCardMember } from '@/lib/card-member/types'
import { cn } from '@/lib/utils'

type TCardMembersAvatarsProps = {
  members: TCardMember[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
}

const AVATAR_SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export function CardMembersAvatars({
  members,
  maxVisible = 3,
  size = 'sm',
}: TCardMembersAvatarsProps) {
  if (!members || members.length === 0) {
    return null
  }

  const visibleMembers = members.slice(0, maxVisible)
  const remainingCount = members.length - maxVisible

  return (
    <div className='flex items-center gap-1'>
      <Users className='w-3.5 h-3.5 text-muted-foreground' />
      <div className='flex -space-x-2'>
        {visibleMembers.map((member) => {
          const initials = member.user.name
            ? member.user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : member.user.email.slice(0, 2).toUpperCase()

          return (
            <Avatar
              key={member.id}
              className={cn(
                AVATAR_SIZES[size],
                'border-2 border-background ring-1 ring-border',
              )}
              title={member.user.name || member.user.email}
            >
              <AvatarImage
                src={member.user.image || undefined}
                alt={member.user.name || member.user.email}
              />
              <AvatarFallback className='text-xs font-medium bg-primary/10 text-primary'>
                {initials}
              </AvatarFallback>
            </Avatar>
          )
        })}
        {remainingCount > 0 && (
          <div
            className={cn(
              AVATAR_SIZES[size],
              'flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium',
            )}
            title={`+${remainingCount} más`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}
