import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/signup', '/api/auth']

  // Permitir acceso a rutas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Para la página principal (/), permitir que la página maneje la redirección
  // Esto es importante para que funcionen correctamente las redirecciones de Server Actions
  // después del login, ya que las cookies se establecen en el response pero el proxy
  // se ejecuta antes de que lleguen al navegador
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Verificar sesión para otras rutas protegidas
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Si no hay sesión, redirigir a login
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
