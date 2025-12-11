'use client'

import Link from 'next/link'
import { useActionState, useId } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpAction } from '@/lib/auth/actions'

export function SignupForm() {
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()
  const [state, formAction, isPending] = useActionState(signUpAction, null)

  return (
    <Card className='w-full border-border/50 shadow-lg backdrop-blur-sm'>
      <CardHeader className='space-y-1 pb-4'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          Crea tu cuenta
        </CardTitle>
        <CardDescription className='text-base'>
          Únete para empezar a gestionar tus proyectos
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className='space-y-4'>
          {state?.error && (
            <div className='bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-lg flex items-start gap-3'>
              <svg
                className='w-5 h-5 mt-0.5 flex-shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <title>Error icon</title>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span className='text-sm'>{state.error}</span>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor={nameId} className='text-foreground font-medium'>
              Nombre completo
            </Label>
            <Input
              id={nameId}
              name='name'
              type='text'
              placeholder='Juan Pérez'
              disabled={isPending}
              required
              className='h-11 bg-card border-input focus:border-ring focus:ring-ring/20'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor={emailId} className='text-foreground font-medium'>
              Correo electrónico
            </Label>
            <Input
              id={emailId}
              name='email'
              type='email'
              placeholder='nombre@ejemplo.com'
              disabled={isPending}
              required
              className='h-11 bg-card border-input focus:border-ring focus:ring-ring/20'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor={passwordId} className='text-foreground font-medium'>
              Contraseña
            </Label>
            <Input
              id={passwordId}
              name='password'
              type='password'
              placeholder='Mínimo 8 caracteres'
              disabled={isPending}
              required
              className='h-11 bg-card border-input focus:border-ring focus:ring-ring/20'
            />
            <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <title>Info icon</title>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Debe contener al menos 8 caracteres
            </p>
          </div>
          <div className='space-y-2'>
            <Label
              htmlFor={confirmPasswordId}
              className='text-foreground font-medium'
            >
              Confirmar contraseña
            </Label>
            <Input
              id={confirmPasswordId}
              name='confirmPassword'
              type='password'
              placeholder='Repite tu contraseña'
              disabled={isPending}
              required
              className='h-11 bg-card border-input focus:border-ring focus:ring-ring/20'
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4 pt-2'>
          <Button
            type='submit'
            className='w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow'
            disabled={isPending}
          >
            {isPending ? (
              <span className='flex items-center gap-2'>
                <svg
                  className='animate-spin h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <title>Loading spinner</title>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta'
            )}
          </Button>
          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>
              ¿Ya tienes una cuenta?{' '}
            </span>
            <Link
              href='/login'
              className='text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline'
            >
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
