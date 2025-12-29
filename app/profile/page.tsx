import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { getCurrentUser } from '@/lib/auth/get-user'
import { getUserStats } from '@/lib/user/queries'
import { ProfileHeader } from './_components/profile-header'
import { ProfileStats } from './_components/profile-stats'
import { ProfileInfo } from './_components/profile-info'

export const metadata: Metadata = {
  title: 'Mi Perfil',
  description: 'Visualiza y gestiona tu perfil de usuario. Revisa tus estadísticas, tableros y tarjetas asignadas.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getUserStats(user.id)

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='container mx-auto max-w-5xl px-4 py-8'>
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Mi Perfil</h1>
            <p className='text-muted-foreground mt-1'>
              Visualiza tu información y estadísticas de actividad
            </p>
          </div>

          {/* Profile Content */}
          <ProfileHeader user={user} />
          <ProfileStats stats={stats} />
          <ProfileInfo user={user} stats={stats} />
        </div>
      </main>
    </div>
  )
}
