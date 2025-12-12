'use client'

import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

type TVerificationStatus = 'loading' | 'success' | 'error'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<TVerificationStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error')
        setErrorMessage('No se encontro el token de verificacion')
        return
      }

      try {
        const result = await authClient.verifyEmail({ query: { token } })

        if (result.error) {
          setStatus('error')
          setErrorMessage(
            result.error.message ||
              'Error al verificar el email. El enlace puede haber expirado.',
          )
          return
        }

        setStatus('success')

        // Redirigir al inicio después de 2 segundos
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
      } catch (error) {
        setStatus('error')
        setErrorMessage(
          'Error al verificar el email. Por favor, intenta de nuevo.',
        )
        console.error('Error verifying email:', error)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <Card className='w-full border-border/50 shadow-lg backdrop-blur-sm'>
      <CardHeader className='space-y-1 pb-4 text-center'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          Verificacion de Email
        </CardTitle>
        <CardDescription className='text-base'>
          {status === 'loading' && 'Verificando tu direccion de email...'}
          {status === 'success' && 'Tu email ha sido verificado correctamente'}
          {status === 'error' && 'No se pudo verificar tu email'}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center py-8'>
        {status === 'loading' && (
          <Loader2 className='h-16 w-16 animate-spin text-primary' />
        )}
        {status === 'success' && (
          <CheckCircle className='h-16 w-16 text-green-500' />
        )}
        {status === 'error' && <XCircle className='h-16 w-16 text-red-500' />}

        {status === 'success' && (
          <p className='mt-4 text-center text-muted-foreground'>
            Seras redirigido automaticamente en unos segundos...
          </p>
        )}

        {status === 'error' && (
          <p className='mt-4 text-center text-muted-foreground'>
            {errorMessage}
          </p>
        )}
      </CardContent>
      <CardFooter className='flex flex-col space-y-4 pt-2'>
        {status === 'success' && (
          <Button asChild className='w-full'>
            <Link href='/'>Ir al inicio</Link>
          </Button>
        )}
        {status === 'error' && (
          <div className='flex w-full flex-col gap-2'>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/login'>Iniciar sesion</Link>
            </Button>
            <Button asChild variant='ghost' className='w-full'>
              <Link href='/signup'>Crear nueva cuenta</Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
