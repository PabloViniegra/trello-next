import { Suspense } from 'react'
import { CreateBoardDialog } from '@/app/_components/create-board-dialog'
import { NotificationBell } from '@/app/_components/notification-bell'
import { AnimatedNavbar } from '@/components/animations/animated-navbar'
import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NavLinks } from './nav-links'
import { NavbarLogo } from './navbar-logo'
import { NavbarMobileMenu } from './navbar-mobile-menu'
import { Avatar, AvatarFallback } from './ui/avatar'
import { UserNav } from './user-nav'

async function UserSection() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <>
      {/* CreateBoardDialog - oculto en móvil */}
      <div className='hidden sm:block'>
        <CreateBoardDialog />
      </div>
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
      <div className='container mx-auto flex h-16 items-center justify-between px-4 gap-3'>
        {/* Menú hamburguesa (móvil) + Logo */}
        <div className='flex items-center gap-3'>
          <NavbarMobileMenu />
          <NavbarLogo />
        </div>

        {/* NavLinks - centro (desktop only) */}
        <div className='hidden md:flex flex-1 justify-center'>
          <NavLinks />
        </div>

        {/* Acciones - derecha */}
        <div className='flex items-center gap-2 md:gap-4'>
          <ThemeSwitcher />
          <Suspense fallback={<UserSkeleton />}>
            <UserSection />
          </Suspense>
        </div>
      </div>
    </AnimatedNavbar>
  )
}
