'use client'

import { usePathname } from 'next/navigation'
import type { JSX, ReactNode } from 'react'
import { isAuthRoute } from '@/lib/routes/constants'
import { AppFooter } from './app-footer'

type TRootLayoutWrapperProps = {
  children: ReactNode
}

export function RootLayoutWrapper({
  children,
}: TRootLayoutWrapperProps): JSX.Element {
  const pathname = usePathname()

  // Check if current route is an auth route
  const shouldHideFooter = isAuthRoute(pathname)

  return (
    <div className='flex min-h-screen flex-col'>
      <main className='flex-1'>{children}</main>
      {!shouldHideFooter && <AppFooter />}
    </div>
  )
}
