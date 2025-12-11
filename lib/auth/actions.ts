'use server'

import { auth } from '@/lib/auth'
import { signInSchema, signUpSchema } from './schemas'
import type { TAuthResult, TSignInInput, TSignUpInput } from './types'

export async function signIn(data: TSignInInput): Promise<TAuthResult> {
  try {
    const validated = signInSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        error: 'Datos de inicio de sesión inválidos',
      }
    }

    const result = await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
    })

    if (!result) {
      return {
        success: false,
        error: 'Credenciales incorrectas',
      }
    }

    return {
      success: true,
      data: {
        userId: result.user.id,
      },
    }
  } catch (error) {
    console.error('Error en signIn:', error)
    return {
      success: false,
      error: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
    }
  }
}

export async function signUp(data: TSignUpInput): Promise<TAuthResult> {
  try {
    const validated = signUpSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        error: 'Datos de registro inválidos',
      }
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
        name: validated.data.name,
      },
    })

    if (!result) {
      return {
        success: false,
        error: 'Error al crear la cuenta',
      }
    }

    return {
      success: true,
      data: {
        userId: result.user.id,
      },
    }
  } catch (error) {
    console.error('Error en signUp:', error)

    // Check for duplicate email error
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.includes('duplicate')
    ) {
      return {
        success: false,
        error: 'Este email ya está registrado',
      }
    }

    return {
      success: false,
      error: 'Error al crear la cuenta. Por favor, intenta de nuevo.',
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    await auth.api.signOut()
  } catch (error) {
    console.error('Error en signOut:', error)
    throw new Error('Error al cerrar sesión')
  }
}
