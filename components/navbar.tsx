import Link from 'next/link'
import { Suspense } from 'react'
import { CreateBoardDialog } from '@/app/_components/create-board-dialog'
import { NotificationBell } from '@/app/_components/notification-bell'
import { AnimatedNavbar } from '@/components/animations/animated-navbar'
import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NavLinks } from './nav-links'
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
      <NotificationBell />
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
        {/* Logo - izquierda */}
        <div className='flex items-center'>
          <Link href='/' className='text-xl font-bold'>
            Trello Clone
          </Link>
        </div>

        {/* NavLinks - centro */}
        <div className='flex-1 flex justify-center'>
          <NavLinks />
        </div>

        {/* Acciones - derecha */}
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
