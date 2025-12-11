'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId } from 'react'
import { toast } from 'sonner'
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
import { signInAction } from '@/lib/auth/actions'

export function LoginForm() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()
  const [state, formAction, isPending] = useActionState(signInAction, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success('Sesión iniciada correctamente')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 500)
    }
  }, [state, router])

  return (
    <Card className='w-full border-border/50 shadow-lg backdrop-blur-sm'>
      <CardHeader className='space-y-1 pb-4'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          Bienvenido de nuevo
        </CardTitle>
        <CardDescription className='text-base'>
          Ingresa tus credenciales para continuar
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className='space-y-5'>
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
              placeholder='Ingresa tu contraseña'
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
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>
              ¿No tienes una cuenta?{' '}
            </span>
            <Link
              href='/signup'
              className='text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline'
            >
              Crear cuenta
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
