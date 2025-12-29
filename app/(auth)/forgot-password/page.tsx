import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/fade-in'
import { playfairDisplay } from '@/lib/fonts'
import { ForgotPasswordForm } from './_components/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Solicita un enlace para restablecer tu contraseña y recuperar el acceso a tu cuenta de Trello Clone.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordPage() {
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
              Recupera el acceso a tu cuenta
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.6}>
          <ForgotPasswordForm />
        </FadeIn>
      </div>
    </div>
  )
}
