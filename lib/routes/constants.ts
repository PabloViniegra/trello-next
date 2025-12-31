/**
 * Authentication routes configuration
 * These routes will not display the footer or main navigation
 */
export const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const

export type TAuthRoute = (typeof AUTH_ROUTES)[number]

/**
 * Check if a pathname is an authentication route
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route))
}
