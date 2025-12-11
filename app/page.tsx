import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { playfairDisplay } from '@/app/layout'
import { auth } from '@/lib/auth'
import { SignOutButton } from './_components/sign-out-button'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b border-border bg-card'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <h1
            className={`${playfairDisplay.className} text-3xl font-bold text-primary`}
          >
            Trello Clone
          </h1>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <p className='text-sm text-muted-foreground'>Bienvenido</p>
              <p className='font-medium text-foreground'>{user.name}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-card rounded-xl border border-border p-8 shadow-sm'>
            <h2 className='text-2xl font-semibold mb-4 text-foreground'>
              Panel Principal
            </h2>
            <div className='space-y-4'>
              <div className='bg-muted/50 rounded-lg p-6'>
                <h3 className='font-medium text-foreground mb-2'>
                  Información del Usuario
                </h3>
                <dl className='space-y-2'>
                  <div className='flex gap-2'>
                    <dt className='text-sm text-muted-foreground font-medium w-24'>
                      ID:
                    </dt>
                    <dd className='text-sm text-foreground font-mono'>
                      {user.id}
                    </dd>
                  </div>
                  <div className='flex gap-2'>
                    <dt className='text-sm text-muted-foreground font-medium w-24'>
                      Nombre:
                    </dt>
                    <dd className='text-sm text-foreground'>{user.name}</dd>
                  </div>
                  <div className='flex gap-2'>
                    <dt className='text-sm text-muted-foreground font-medium w-24'>
                      Email:
                    </dt>
                    <dd className='text-sm text-foreground'>{user.email}</dd>
                  </div>
                  <div className='flex gap-2'>
                    <dt className='text-sm text-muted-foreground font-medium w-24'>
                      Verificado:
                    </dt>
                    <dd className='text-sm text-foreground'>
                      {user.emailVerified ? (
                        <span className='inline-flex items-center gap-1.5 text-green-600'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                          >
                            <title>Verified icon</title>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          Verificado
                        </span>
                      ) : (
                        <span className='text-muted-foreground'>
                          No verificado
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className='bg-primary/5 border border-primary/20 rounded-lg p-6'>
                <h3 className='font-medium text-foreground mb-2 flex items-center gap-2'>
                  <svg
                    className='w-5 h-5 text-primary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                  >
                    <title>Success icon</title>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Autenticación Exitosa
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Has iniciado sesión correctamente. El flujo de autenticación
                  está funcionando como se esperaba.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
