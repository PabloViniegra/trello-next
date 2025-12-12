import Link from 'next/link'
import { Suspense } from 'react'
import { CreateBoardDialog } from '@/app/_components/create-board-dialog'
import { AnimatedNavbar } from '@/components/animations/animated-navbar'
import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher'
import { getCurrentUser } from '@/lib/auth/get-user'
import { Avatar, AvatarFallback } from './ui/avatar'
import { UserNav } from './user-nav'

async function UserSection() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <>
      <CreateBoardDialog />
      <UserNav user={user} />
    </>
  )
}

function UserSkeleton() {
  return (
    <Avatar className='h-9 w-9'>
      <AvatarFallback>...</AvatarFallback>
    </Avatar>
  )
}

export function Navbar() {
  return (
    <AnimatedNavbar className='border-b bg-background'>
      <div className='container mx-auto flex h-16 items-center px-4'>
        <div className='flex items-center gap-6 flex-1'>
          <Link href='/' className='text-xl font-bold'>
            Trello Clone
          </Link>

          <div className='flex items-center gap-4'>
            <Link
              href='/boards'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              Boards
            </Link>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <ThemeSwitcher />
          <Suspense fallback={<UserSkeleton />}>
            <UserSection />
          </Suspense>
        </div>
      </div>
    </AnimatedNavbar>
  )
}
