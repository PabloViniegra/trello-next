import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TUser } from '@/lib/auth/types'
import { EditProfileDialog } from './edit-profile-dialog'

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
    <div className='rounded-lg border bg-card p-4 sm:p-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
        <Avatar className='h-20 w-20 sm:h-24 sm:w-24'>
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className='text-xl sm:text-2xl'>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className='flex flex-1 flex-col gap-3 sm:gap-2'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='min-w-0 flex-1 space-y-1'>
              <h2 className='truncate text-xl font-bold sm:text-2xl'>
                {user.name}
              </h2>
              <p className='truncate text-sm text-muted-foreground sm:text-base'>
                {user.email}
              </p>
            </div>
            <EditProfileDialog user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
