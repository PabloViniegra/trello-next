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
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-2xl'>Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa tu email y contraseña para acceder
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded'>
              {error}
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              name='email'
              type='email'
              placeholder='tu@email.com'
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor={passwordId}>Contraseña</Label>
            <Input
              id={passwordId}
              name='password'
              type='password'
              placeholder='••••••••'
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
          <p className='text-sm text-center text-muted-foreground'>
            ¿No tienes una cuenta?{' '}
            <Link href='/signup' className='text-primary hover:underline'>
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
