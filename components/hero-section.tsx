import { ArrowRight, CheckCircle2, Layers, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HeroSection() {
  return (
    <div className='flex flex-col'>
      {/* Hero principal */}
      <section className='container mx-auto px-4 py-16 md:py-24'>
        <div className='flex flex-col items-center text-center space-y-8'>
          <div className='space-y-4 max-w-3xl'>
            <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
              Organiza tu trabajo y tu vida de manera{' '}
              <span className='text-primary'>eficiente</span>
            </h1>
            <p className='text-lg text-muted-foreground md:text-xl'>
              Gestiona proyectos, asigna tareas y colabora con tu equipo en un
              solo lugar. Simple, visual y poderoso.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4'>
            <Button size='lg' asChild>
              <Link href='/boards'>
                Ver mis tableros
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/boards'>Crear nuevo tablero</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className='container mx-auto px-4 py-16 bg-muted/50'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                <Layers className='h-6 w-6 text-primary' />
              </div>
              <CardTitle>Tableros visuales</CardTitle>
              <CardDescription>
                Organiza tareas en tableros, listas y tarjetas para una vista
                clara de todo tu trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Drag & drop intuitivo
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Personalización completa
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Etiquetas y categorías
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                <Users className='h-6 w-6 text-primary' />
              </div>
              <CardTitle>Colaboración en equipo</CardTitle>
              <CardDescription>
                Trabaja con tu equipo en tiempo real, asigna tareas y mantén a
                todos sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Asignación de tareas
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Comentarios y menciones
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Actualizaciones en tiempo real
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                <CheckCircle2 className='h-6 w-6 text-primary' />
              </div>
              <CardTitle>Gestión simplificada</CardTitle>
              <CardDescription>
                Mantén el control de todos tus proyectos con herramientas
                potentes pero fáciles de usar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Fechas límite
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Listas de verificación
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  Adjuntar archivos
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
