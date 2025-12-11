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
import { signUp } from '@/lib/auth/actions'
import type { TSignUpInput } from '@/lib/auth/types'

export function SignupForm() {
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<TSignUpInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signUp(formData)

      if (!result.success) {
        setError(result.error || 'Error al crear la cuenta')
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
        <CardTitle className='text-2xl'>Crear cuenta</CardTitle>
        <CardDescription>
          Ingresa tus datos para crear una nueva cuenta
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
            <Label htmlFor={nameId}>Nombre</Label>
            <Input
              id={nameId}
              name='name'
              type='text'
              placeholder='Tu nombre'
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
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
            <p className='text-xs text-muted-foreground'>Mínimo 8 caracteres</p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor={confirmPasswordId}>Confirmar contraseña</Label>
            <Input
              id={confirmPasswordId}
              name='confirmPassword'
              type='password'
              placeholder='••••••••'
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <p className='text-sm text-center text-muted-foreground'>
            ¿Ya tienes una cuenta?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
