import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { getCurrentUser } from '@/lib/auth/get-user'
import { getUserAnalytics, getUserStats } from '@/lib/user/queries'
import { ProfileAnalytics } from './_components/profile-analytics'
import { ProfileHeader } from './_components/profile-header'
import { ProfileInfo } from './_components/profile-info'
import { ProfileStats } from './_components/profile-stats'

export const metadata: Metadata = {
  title: 'Mi Perfil',
  description:
    'Visualiza y gestiona tu perfil de usuario. Revisa tus estadísticas, tableros y tarjetas asignadas.',
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

  const [stats, analytics] = await Promise.all([
    getUserStats(user.id),
    getUserAnalytics(user.id),
  ])

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

          {/* Bento Grid Layout for Stats and Info */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Stats - Takes 2 columns on large screens */}
            <div className='md:col-span-2 lg:col-span-2'>
              <ProfileStats stats={stats} />
            </div>

            {/* Account Info - 1 column on large */}
            <ProfileInfo user={user} stats={stats} />
          </div>

          {/* Analytics - Second */}
          <ProfileAnalytics analytics={analytics} />
        </div>
      </main>
    </div>
  )
}
