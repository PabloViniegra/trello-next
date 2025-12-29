import type { MetadataRoute } from 'next'

/**
 * Web App Manifest para Trello Clone
 * Permite instalación como PWA y define identidad de la app
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trello Clone - Gestión de Proyectos',
    short_name: 'Trello Clone',
    description: 'Organiza tu trabajo y tu vida de manera eficiente con tableros visuales, listas y tarjetas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7f6a3f',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'business'],
    lang: 'es-ES',
  }
}
