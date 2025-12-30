import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/fade-in'
import { playfairDisplay } from '@/lib/fonts'
import { LoginForm } from './_components/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Inicia sesión en tu cuenta de Trello Clone y accede a tus tableros de proyectos. Gestiona tus tareas y colabora con tu equipo.',
  robots: {
    index: false, // No indexar páginas de autenticación
    follow: true,
  },
}

export default function LoginPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 md:p-8'>
      <div className='w-full max-w-md space-y-6 sm:space-y-8'>
        <FadeIn direction='down' duration={0.6}>
          <div className='text-center'>
            <h1
              className={`${playfairDisplay.className} text-5xl font-bold tracking-tight text-primary mb-2`}
            >
              Trello Clone
            </h1>
            <p className='text-muted-foreground'>
              Organiza tus proyectos de forma visual
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.6}>
          <LoginForm />
        </FadeIn>
      </div>
    </div>
  )
}
