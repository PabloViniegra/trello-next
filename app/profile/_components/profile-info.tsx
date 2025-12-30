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
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3'>
            <Mail className='h-5 w-5 text-muted-foreground' />
            <div className='flex-1'>
              <p className='text-sm font-medium'>Correo Electrónico</p>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 items-center justify-center'>
              {user.image ? (
                <CheckCircle2 className='h-5 w-5 text-green-600' />
              ) : (
                <XCircle className='h-5 w-5 text-muted-foreground' />
              )}
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium'>Foto de Perfil</p>
              <p className='text-sm text-muted-foreground'>
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
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>Total de tableros</p>
              <Badge variant='secondary'>{totalBoards}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>Tarjetas activas</p>
              <Badge variant='secondary'>{stats.totalCardsAssigned}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>Rol principal</p>
              <Badge variant='outline'>
                {stats.totalBoardsOwned > 0 ? 'Propietario' : 'Colaborador'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
