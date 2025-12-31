'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type TNavLink = {
  href: string
  label: string
}

export const NAV_LINKS: TNavLink[] = [
  { href: '/boards', label: 'Tableros' },
  { href: '/about', label: 'Acerca de' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className='flex items-center gap-1' aria-label='Navegación principal'>
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative px-4 py-2 text-sm font-mono font-medium transition-all duration-200',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
            {isActive && (
              <>
                <span className='sr-only'>Página actual: {link.label}</span>
                <span className='absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full' />
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
