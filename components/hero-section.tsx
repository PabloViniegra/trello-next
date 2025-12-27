'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Layers, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CreateBoardDialog } from '@/app/_components/create-board-dialog'
import { FadeIn } from '@/components/animations/fade-in'
import {
  StaggerChildren,
  StaggerItem,
} from '@/components/animations/stagger-children'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GradientText } from '@/components/ui/gradient-text'

const MotionButton = motion.create(Button)

export function HeroSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className='flex flex-col'>
      {/* Hero principal */}
      <section className='container mx-auto px-4 py-16 md:py-24'>
        <div className='flex flex-col items-center text-center space-y-8'>
          <div className='space-y-4 max-w-3xl'>
            <FadeIn direction='down' duration={0.7}>
              <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
                Organiza tu trabajo y tu vida de manera{' '}
                <GradientText
                  colors={['#7f6a3f', '#deb6a0', '#9383b2', '#7f6a3f']}
                  animationSpeed={6}
                >
                  eficiente
                </GradientText>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2} duration={0.6}>
              <p className='text-lg text-muted-foreground md:text-xl'>
                Gestiona proyectos, asigna tareas y colabora con tu equipo en un
                solo lugar. Simple, visual y poderoso.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} duration={0.6}>
            <div className='flex flex-col sm:flex-row gap-4'>
              <MotionButton
                size='lg'
                asChild
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Link href='/boards'>
                  Ver mis tableros
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </MotionButton>
              <CreateBoardDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                trigger={
                  <MotionButton
                    size='lg'
                    variant='outline'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 17,
                    }}
                  >
                    Crear nuevo tablero
                  </MotionButton>
                }
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Características */}
      <section className='container mx-auto px-4 py-16 bg-muted/20 backdrop-blur-xl border border-border/50 rounded-3xl'>
        <StaggerChildren
          className='grid grid-cols-1 md:grid-cols-3 gap-6'
          staggerDelay={0.15}
          initialDelay={0.2}
        >
          <StaggerItem>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card className='h-full'>
                <CardHeader>
                  <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                    <Layers className='h-6 w-6 text-primary' />
                  </div>
                  <CardTitle>Tableros visuales</CardTitle>
                  <CardDescription>
                    Organiza tareas en tableros, listas y tarjetas para una
                    vista clara de todo tu trabajo
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
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card className='h-full'>
                <CardHeader>
                  <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                    <Users className='h-6 w-6 text-primary' />
                  </div>
                  <CardTitle>Colaboración en equipo</CardTitle>
                  <CardDescription>
                    Trabaja con tu equipo en tiempo real, asigna tareas y mantén
                    a todos sincronizados
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
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card className='h-full'>
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
            </motion.div>
          </StaggerItem>
        </StaggerChildren>
      </section>
    </div>
  )
}
