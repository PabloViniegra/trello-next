import type { Metadata } from 'next'
import { SignupForm } from './_components/signup-form'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea una nueva cuenta',
}

export default function SignupPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4'>
      <SignupForm />
    </div>
  )
}
