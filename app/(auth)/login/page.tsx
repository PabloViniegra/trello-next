import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/fade-in'
import { playfairDisplay } from '@/lib/fonts'
import { LoginForm } from './_components/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión - Trello Clone',
  description: 'Inicia sesión en tu cuenta',
}

export default function LoginPage() {
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
