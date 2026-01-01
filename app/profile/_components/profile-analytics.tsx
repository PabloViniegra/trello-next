'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { TLabelUsageData, TUserAnalytics } from '@/lib/user/types'

type TProfileAnalyticsProps = {
  analytics: TUserAnalytics
}

export function ProfileAnalytics({ analytics }: TProfileAnalyticsProps) {
  // Chart configs with better colors
  const activityConfig = {
    cards: {
      label: 'Tarjetas',
      color: 'hsl(var(--chart-1))',
    },
    comments: {
      label: 'Comentarios',
      color: 'hsl(var(--chart-2))',
    },
    boards: {
      label: 'Tableros',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig

  const cardStatusConfig = {
    completed: {
      label: 'Completadas',
      color: 'hsl(142 76% 36%)', // Green for completed
    },
    pending: {
      label: 'Pendientes',
      color: 'hsl(25 95% 53%)', // Orange for pending
    },
  } satisfies ChartConfig

  const boardActivityConfig = {
    totalCards: {
      label: 'Total Tarjetas',
      color: 'hsl(221 83% 53%)', // Blue
    },
    completedCards: {
      label: 'Completadas',
      color: 'hsl(142 76% 36%)', // Green
    },
    activeMembers: {
      label: 'Miembros Activos',
      color: 'hsl(262 83% 58%)', // Purple
    },
  } satisfies ChartConfig

  const labelUsageConfig = analytics.labelUsage.reduce(
    (acc: ChartConfig, label: TLabelUsageData) => {
      acc[label.labelName] = {
        label: label.labelName,
        color: label.color,
      }
      return acc
    },
    {} as ChartConfig,
  )

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Panel de Analíticas
        </h2>
        <p className='text-muted-foreground mt-1'>
          Visualiza tu actividad y progreso en tiempo real
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className='grid gap-4 md:grid-cols-6 lg:grid-cols-8'>
        {/* Card Status - Large card top left */}
        <Card className='col-span-full md:col-span-3 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Estado de Tarjetas (30 días)</CardTitle>
          </CardHeader>
          <CardContent className='px-2'>
            {analytics.cardStatusOverTime.length > 0 ? (
              <ChartContainer
                config={cardStatusConfig}
                className='h-[300px] w-full'
              >
                <BarChart
                  data={analytics.cardStatusOverTime}
                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                  barCategoryGap='20%'
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey='completed'
                    fill='var(--color-completed)'
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey='pending'
                    fill='var(--color-pending)'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                No hay datos de tarjetas disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Label Usage - Medium card top right */}
        <Card className='col-span-full md:col-span-3 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Uso de Etiquetas</CardTitle>
          </CardHeader>
          <CardContent className='px-2'>
            {analytics.labelUsage.length > 0 ? (
              <ChartContainer
                config={labelUsageConfig}
                className='h-[300px] w-full'
              >
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={analytics.labelUsage}
                    dataKey='count'
                    nameKey='labelName'
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    label={false}
                  >
                    {analytics.labelUsage.map((entry: TLabelUsageData) => (
                      <Cell
                        key={entry.labelName}
                        fill={entry.color}
                        stroke='hsl(var(--background))'
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                No hay datos de etiquetas disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline - Full width bottom */}
        <Card className='col-span-full'>
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
          </CardHeader>
          <CardContent className='px-2'>
            {analytics.activityTimeline.length > 0 ? (
              <ChartContainer
                config={activityConfig}
                className='h-[300px] w-full'
              >
                <LineChart
                  data={analytics.activityTimeline}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='week'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type='monotone'
                    dataKey='cards'
                    stroke='var(--color-cards)'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='comments'
                    stroke='var(--color-comments)'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='boards'
                    stroke='var(--color-boards)'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                No hay datos de actividad disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Board Activity - Full width at bottom */}
        <Card className='col-span-full'>
          <CardHeader>
            <CardTitle>Actividad por Tablero</CardTitle>
          </CardHeader>
          <CardContent className='px-2'>
            {analytics.boardActivity.length > 0 ? (
              <ChartContainer
                config={boardActivityConfig}
                className='h-[300px] w-full'
              >
                <BarChart
                  data={analytics.boardActivity}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  maxBarSize={50}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='boardName'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey='totalCards'
                    fill='var(--color-totalCards)'
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey='completedCards'
                    fill='var(--color-completedCards)'
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey='activeMembers'
                    fill='var(--color-activeMembers)'
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                No hay datos de tableros disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
