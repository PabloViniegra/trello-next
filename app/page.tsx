import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { HeroSection } from '@/components/hero-section'
import { Navbar } from '@/components/navbar'
import { getCurrentUser } from '@/lib/auth/get-user'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Bienvenido a Trello Clone. Organiza proyectos, gestiona tareas y colabora con tu equipo usando tableros Kanban visuales.',
  openGraph: {
    title: 'Trello Clone - Gestión de Proyectos y Tareas',
    description:
      'Bienvenido a Trello Clone. Organiza proyectos, gestiona tareas y colabora con tu equipo.',
  },
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  const user = await getCurrentUser()

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  )
}
