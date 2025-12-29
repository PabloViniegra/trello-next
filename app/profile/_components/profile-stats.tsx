import { LayoutGrid, Users, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TUserStats } from '@/lib/user/types'

type TProfileStatsProps = {
  stats: TUserStats
}

export function ProfileStats({ stats }: TProfileStatsProps) {
  const statsData = [
    {
      title: 'Tableros Creados',
      value: stats.totalBoardsOwned,
      icon: LayoutGrid,
      description: 'Tableros de los que eres propietario',
    },
    {
      title: 'Colaboraciones',
      value: stats.totalBoardsCollaborating,
      icon: Users,
      description: 'Tableros donde colaboras',
    },
    {
      title: 'Tarjetas Asignadas',
      value: stats.totalCardsAssigned,
      icon: CheckSquare,
      description: 'Tarjetas en las que trabajas',
    },
  ]

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
