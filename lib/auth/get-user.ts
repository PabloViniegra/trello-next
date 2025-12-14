'use server'

import { headers as nextHeaders } from 'next/headers'
import { auth } from '@/lib/auth'
import type { TUser } from './types'

export async function getCurrentUser(): Promise<TUser | null> {
  try {
    const headersList = await nextHeaders()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image || undefined,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
