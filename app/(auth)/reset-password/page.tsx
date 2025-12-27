import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/fade-in'
import { playfairDisplay } from '@/lib/fonts'
import { ResetPasswordForm } from './_components/reset-password-form'

export const metadata: Metadata = {
  title: 'Restablecer contraseña - Trello Clone',
  description: 'Establece una nueva contraseña para tu cuenta',
}

export default function ResetPasswordPage() {
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
              Establece tu nueva contraseña
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.6}>
          <ResetPasswordForm />
        </FadeIn>
      </div>
    </div>
  )
}
