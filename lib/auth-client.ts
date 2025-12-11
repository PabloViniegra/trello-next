import { createAuthClient } from 'better-auth/react'
import { env } from '@/lib/env'

const baseURL = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL

if (!baseURL) {
  throw new Error('BETTER_AUTH_URL or NEXT_PUBLIC_BETTER_AUTH_URL must be set')
}

export const authClient = createAuthClient({
  baseURL,
})
