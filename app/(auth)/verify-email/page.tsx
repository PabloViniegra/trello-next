import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FadeIn } from '@/components/animations/fade-in'
import { playfairDisplay } from '@/lib/fonts'
import { VerifyEmailForm } from './_components/verify-email-form'

export const metadata: Metadata = {
  title: 'Verificar Email - Trello Clone',
  description: 'Verifica tu direccion de email',
}

function VerifyEmailFormWrapper() {
  return <VerifyEmailForm />
}

export default function VerifyEmailPage() {
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
            <p className='text-muted-foreground'>Verificacion de email</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.6}>
          <Suspense
            fallback={
              <div className='flex items-center justify-center py-8'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              </div>
            }
          >
            <VerifyEmailFormWrapper />
          </Suspense>
        </FadeIn>
      </div>
    </div>
  )
}
