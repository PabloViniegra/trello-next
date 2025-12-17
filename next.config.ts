import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Configurar tiempos de caché por defecto
    // Ref: https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes
    staleTimes: {
      // Cache para páginas dinámicas: 30 segundos
      // Útil para páginas con autenticación que cambian frecuentemente
      dynamic: 30,

      // Cache para páginas estáticas: 3 minutos
      // Útil para contenido que no cambia tan frecuentemente
      static: 180,
    },
  },
}

export default nextConfig
