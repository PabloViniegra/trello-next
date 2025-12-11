'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
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
import { signIn } from '@/lib/auth/actions'
import type { TSignInInput } from '@/lib/auth/types'

export function LoginForm() {
  const emailId = useId()
  const passwordId = useId()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<TSignInInput>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn(formData)

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

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
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-5'>
          {error && (
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
              <span className='text-sm'>{error}</span>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor={emailId} className='text-foreground font-medium'>
              Correo electrónico
            </Label>
            <Input
              id={emailId}
              name='email'
              type='email'
              placeholder='nombre@ejemplo.com'
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
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
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              className='h-11 bg-card border-input focus:border-ring focus:ring-ring/20'
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4 pt-2'>
          <Button
            type='submit'
            className='w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow'
            disabled={isLoading}
          >
            {isLoading ? (
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
