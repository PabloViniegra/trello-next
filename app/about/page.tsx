import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const GITHUB_REPO_URL = 'https://github.com/PabloViniegra/trello-next'

export const metadata: Metadata = {
  title: 'Acerca de',
  description:
    'Conoce más sobre Trello Clone, una aplicación moderna de gestión de proyectos y tareas con tableros Kanban visuales.',
  openGraph: {
    title: 'Acerca de - Trello Clone',
    description:
      'Aplicación de gestión de proyectos con tableros Kanban, colaboración en tiempo real y más.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acerca de - Trello Clone',
    description:
      'Aplicación de gestión de proyectos con tableros Kanban, colaboración en tiempo real y más.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/about',
  },
}

type TFeature = {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: TFeature[] = [
  {
    icon: CheckCircle2,
    title: 'Gestión de Tareas',
    description:
      'Organiza tus proyectos con tableros Kanban intuitivos. Crea, mueve y prioriza tareas fácilmente.',
  },
  {
    icon: Users,
    title: 'Colaboración en Equipo',
    description:
      'Trabaja con tu equipo en tiempo real. Asigna tareas, comenta y mantén a todos sincronizados.',
  },
  {
    icon: Zap,
    title: 'Rápido y Eficiente',
    description:
      'Construido con Next.js 16 y React Server Components para un rendimiento óptimo.',
  },
  {
    icon: Shield,
    title: 'Seguro y Confiable',
    description:
      'Autenticación robusta con better-auth y base de datos PostgreSQL segura.',
  },
]

type TTechStack = {
  name: string
  description: string
}

const TECH_STACK: TTechStack[] = [
  { name: 'Next.js 16', description: 'Framework React con App Router' },
  { name: 'TypeScript', description: 'Tipado estático' },
  { name: 'PostgreSQL', description: 'Base de datos relacional' },
  { name: 'Drizzle ORM', description: 'ORM type-safe' },
  { name: 'better-auth', description: 'Autenticación' },
  { name: 'Tailwind CSS', description: 'Estilos utility-first' },
  { name: 'Shadcn UI', description: 'Componentes UI' },
  { name: 'Zustand', description: 'Gestión de estado' },
]

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <main className='container mx-auto px-4 py-8 md:py-12'>
        {/* Hero Section */}
        <section className='max-w-3xl mx-auto text-center mb-12 md:mb-16'>
          <Badge
            variant='secondary'
            className='mb-4'
            aria-label='Versión 1.0.0'
          >
            v1.0.0
          </Badge>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>
            Acerca de Trello Clone
          </h1>
          <p className='text-lg text-muted-foreground mb-6'>
            Una aplicación moderna de gestión de proyectos y tareas inspirada en
            Trello, construida con las últimas tecnologías web.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild size='lg'>
              <Link href='/boards'>
                Ir a Tableros
                <ArrowRight className='ml-2 h-4 w-4' aria-hidden='true' />
              </Link>
            </Button>
            <Button asChild variant='outline' size='lg'>
              <a
                href={GITHUB_REPO_URL}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Ver en GitHub (se abre en nueva pestaña)'
              >
                <FolderGit2 className='mr-2 h-4 w-4' aria-hidden='true' />
                Ver en GitHub
              </a>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className='mb-12 md:mb-16'>
          <h2 className='text-3xl font-bold text-center mb-8'>
            Características Principales
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto'>
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-primary/10'>
                        <Icon
                          className='h-6 w-6 text-primary'
                          aria-hidden='true'
                        />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className='text-base'>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className='mb-12 md:mb-16'>
          <h2 className='text-3xl font-bold text-center mb-8'>
            Stack Tecnológico
          </h2>
          <Card className='max-w-4xl mx-auto'>
            <CardHeader>
              <CardTitle>Tecnologías Utilizadas</CardTitle>
              <CardDescription>
                Construido con herramientas modernas y robustas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {TECH_STACK.map((tech) => (
                  <div
                    key={tech.name}
                    className='p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
                  >
                    <h3 className='font-semibold text-sm mb-1'>{tech.name}</h3>
                    <p className='text-xs text-muted-foreground'>
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Project Info */}
        <section className='max-w-3xl mx-auto text-center'>
          <Card>
            <CardHeader>
              <CardTitle>Proyecto Open Source</CardTitle>
              <CardDescription>
                Este proyecto está disponible en GitHub bajo licencia MIT
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Desarrollado como un proyecto de aprendizaje y demostración de
                las capacidades de Next.js 16, React Server Components y las
                mejores prácticas de desarrollo web moderno.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <Button asChild variant='outline'>
                  <a
                    href={`${GITHUB_REPO_URL}/issues`}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Reportar un problema (se abre en nueva pestaña)'
                  >
                    Reportar un problema
                  </a>
                </Button>
                <Button asChild variant='outline'>
                  <a
                    href={`${GITHUB_REPO_URL}/blob/main/LICENSE`}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Ver Licencia (se abre en nueva pestaña)'
                  >
                    Ver Licencia
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
