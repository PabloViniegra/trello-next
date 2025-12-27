'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { resetPasswordAction } from '@/lib/auth/actions'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const error = searchParams.get('error')

  const newPasswordId = useId()
  const confirmPasswordId = useId()
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    null,
  )

  // Handle error from URL (invalid/expired token)
  useEffect(() => {
    if (error === 'INVALID_TOKEN') {
      toast.error(
        'El enlace de restablecimiento ha expirado o es inválido. Solicita uno nuevo.',
      )
    }
  }, [error])

  // Handle form submission result
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(
        '¡Contraseña restablecida correctamente! Ya puedes iniciar sesión.',
      )
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  }, [state, router])

  // Show error if no token is present
  if (!token && !error) {
    return (
      <Card className='w-full border-border/50 shadow-lg backdrop-blur-sm'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='text-2xl font-semibold tracking-tight'>
            Enlace inválido
          </CardTitle>
          <CardDescription className='text-base'>
            Este enlace de restablecimiento no es válido. Por favor, solicita
            uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href='/forgot-password' className='w-full'>
            <Button className='w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow'>
              Solicitar nuevo enlace
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='w-full border-border/50 shadow-lg backdrop-blur-sm'>
      <CardHeader className='space-y-1 pb-4'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          Nueva contraseña
        </CardTitle>
        <CardDescription className='text-base'>
          Ingresa tu nueva contraseña
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        {/* Hidden field for token */}
        <input type='hidden' name='token' value={token || ''} />

        <CardContent className='space-y-5'>
          <div className='space-y-2'>
            <Label
              htmlFor={newPasswordId}
              className='text-foreground font-medium'
            >
              Nueva contraseña
            </Label>
            <Input
              id={newPasswordId}
              name='newPassword'
              type='password'
              placeholder='Ingresa tu nueva contraseña'
              disabled={isPending}
              required
              minLength={8}
              className='h-11 bg-card border-input focus:border-ring focus:ring-ring/20'
            />
            <p className='text-xs text-muted-foreground'>Mínimo 8 caracteres</p>
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
              placeholder='Confirma tu nueva contraseña'
              disabled={isPending}
              required
              minLength={8}
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
                Restableciendo contraseña...
              </span>
            ) : (
              'Restablecer contraseña'
            )}
          </Button>

          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>
              ¿Recordaste tu contraseña?{' '}
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
