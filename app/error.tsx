'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

type TErrorPageProps = {
  error: globalThis.Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: TErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='text-center space-y-4 max-w-md'>
        <h2 className='text-2xl font-bold'>Algo salió mal</h2>
        <p className='text-muted-foreground'>
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        {error.digest && (
          <p className='text-xs text-muted-foreground'>
            Error ID: {error.digest}
          </p>
        )}
        <div className='flex gap-2 justify-center'>
          <Button onClick={reset}>Intentar de nuevo</Button>
          <Button
            variant='outline'
            onClick={() => {
              window.location.href = '/'
            }}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
