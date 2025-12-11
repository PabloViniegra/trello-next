import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { inter, jetBrainsMono, playfairDisplay } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Trello Clone - Gestión de Proyectos',
    template: '%s | Trello Clone',
  },
  description:
    'Organiza tu trabajo y tu vida de manera eficiente con tableros visuales, listas y tarjetas.',
  keywords: [
    'trello',
    'gestión de proyectos',
    'tableros',
    'kanban',
    'productividad',
    'tareas',
  ],
  authors: [{ name: 'Pablo Viniegra' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    description: 'Organiza tu trabajo y tu vida de manera eficiente',
    siteName: 'Trello Clone',
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Organiza tu trabajo y tu vida de manera eficiente',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
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
