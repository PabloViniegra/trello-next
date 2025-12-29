import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/fade-in'
import { playfairDisplay } from '@/lib/fonts'
import { SignupForm } from './_components/signup-form'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta gratuita en Trello Clone y comienza a organizar tus proyectos con tableros Kanban. Gestión de tareas simple y eficiente.',
  robots: {
    index: false, // No indexar páginas de autenticación
    follow: true,
  },
}

export default function SignupPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8'>
        <FadeIn direction='down' duration={0.6}>
          <div className='text-center'>
            <h1
              className={`${playfairDisplay.className} text-5xl font-bold tracking-tight text-primary mb-2`}
            >
              Trello Clone
            </h1>
            <p className='text-muted-foreground'>
              Comienza a organizar tus proyectos hoy
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.6}>
          <SignupForm />
        </FadeIn>
      </div>
    </div>
  )
}
