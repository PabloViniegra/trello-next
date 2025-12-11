import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-user'
import { UserNav } from './user-nav'

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <nav className='border-b bg-background'>
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

        {user && <UserNav user={user} />}
      </div>
    </nav>
  )
}
