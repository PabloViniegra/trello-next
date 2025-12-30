import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { inter, jetBrainsMono, playfairDisplay } from '@/lib/fonts'
import './globals.css'

// SEO: Base URL para metadata (configurable via variable de entorno)
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://trello-clone.example.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Trello Clone - Gestión de Proyectos y Tareas | Tableros Kanban',
    template: '%s | Trello Clone',
  },
  description:
    'Organiza tu trabajo y gestiona proyectos de manera eficiente con tableros visuales Kanban, listas y tarjetas. Colabora con tu equipo, asigna tareas y aumenta tu productividad con nuestra herramienta de gestión de proyectos.',
  keywords: [
    'trello',
    'trello clone',
    'gestión de proyectos',
    'tableros kanban',
    'kanban board',
    'productividad',
    'tareas',
    'gestión de tareas',
    'colaboración en equipo',
    'organización de trabajo',
    'drag and drop',
    'listas de tareas',
    'planificación de proyectos',
    'gestión ágil',
    'scrum board',
  ],
  authors: [{ name: 'Pablo Viniegra', url: APP_URL }],
  creator: 'Pablo Viniegra',
  publisher: 'Trello Clone',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: APP_URL,
    title: 'Trello Clone - Gestión de Proyectos y Tareas',
    description:
      'Organiza tu trabajo y gestiona proyectos de manera eficiente con tableros visuales Kanban, listas y tarjetas. Colabora con tu equipo y aumenta tu productividad.',
    siteName: 'Trello Clone',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Trello Clone - Gestión de Proyectos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trello Clone - Gestión de Proyectos y Tareas',
    description:
      'Organiza tu trabajo y gestiona proyectos de manera eficiente con tableros visuales Kanban',
    images: [`${APP_URL}/og-image.png`],
    creator: '@trelloclone',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  verification: {
    // google: 'tu-codigo-de-verificacion-de-google',
    // yandex: 'tu-codigo-de-verificacion-de-yandex',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Structured Data (JSON-LD) para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Trello Clone',
    description:
      'Herramienta de gestión de proyectos con tableros visuales Kanban para organizar tareas y colaborar en equipo',
    url: APP_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Tableros Kanban visuales',
      'Drag and drop de tarjetas',
      'Colaboración en tiempo real',
      'Gestión de tareas',
      'Etiquetas y categorías',
      'Asignación de tareas',
      'Fechas límite',
      'Comentarios y menciones',
    ],
    inLanguage: 'es-ES',
    creator: {
      '@type': 'Person',
      name: 'Pablo Viniegra',
    },
  }

  return (
    <html lang='es' suppressHydrationWarning>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
