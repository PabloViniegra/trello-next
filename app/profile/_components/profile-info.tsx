import { CheckCircle2, Mail, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TUser } from '@/lib/auth/types'
import type { TUserStats } from '@/lib/user/types'

type TProfileInfoProps = {
  user: TUser
  stats: TUserStats
}

function _formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function ProfileInfo({ user, stats }: TProfileInfoProps) {
  // Calculate total boards
  const totalBoards = stats.totalBoardsOwned + stats.totalBoardsCollaborating

  return (
    <>
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-start gap-3'>
            <Mail className='mt-0.5 h-4 w-4 text-muted-foreground' />
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-muted-foreground'>
                Correo Electrónico
              </p>
              <p className='text-sm truncate'>{user.email}</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-4 w-4 items-center justify-center'>
              {user.image ? (
                <CheckCircle2 className='h-4 w-4 text-green-600' />
              ) : (
                <XCircle className='h-4 w-4 text-muted-foreground' />
              )}
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-muted-foreground'>
                Foto de Perfil
              </p>
              <p className='text-sm'>
                {user.image ? 'Configurada' : 'Sin configurar'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>Total de tableros</p>
            <Badge variant='secondary' className='font-semibold'>
              {totalBoards}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>Tarjetas activas</p>
            <Badge variant='secondary' className='font-semibold'>
              {stats.totalCardsAssigned}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>Rol principal</p>
            <Badge variant='outline' className='font-medium'>
              {stats.totalBoardsOwned > 0 ? 'Propietario' : 'Colaborador'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
