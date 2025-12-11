import type { Metadata } from 'next'
import { playfairDisplay } from '@/lib/fonts'
import { SignupForm } from './_components/signup-form'

export const metadata: Metadata = {
  title: 'Crear cuenta - Trello Clone',
  description: 'Crea una nueva cuenta',
}

export default function SignupPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8'>
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
        <SignupForm />
      </div>
    </div>
  )
}
