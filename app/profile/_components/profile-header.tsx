import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { TUser } from '@/lib/auth/types'

type TProfileHeaderProps = {
  user: TUser
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileHeader({ user }: TProfileHeaderProps) {
  return (
    <div className='rounded-lg border bg-card p-6'>
      <div className='flex items-start gap-6'>
        <Avatar className='h-24 w-24'>
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className='text-2xl'>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 space-y-2'>
          <h2 className='text-2xl font-bold'>{user.name}</h2>
          <p className='text-muted-foreground'>{user.email}</p>
        </div>
      </div>
    </div>
  )
}
