'use server'

import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppError, logError } from '@/lib/errors'
import { sanitizeFormData } from '@/lib/utils/form'
import { signInSchema, signUpSchema } from './schemas'
import type { TAuthResult, TSignInInput, TSignUpInput } from './types'

export async function signIn(data: TSignInInput): Promise<TAuthResult | never> {
  const validated = signInSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: 'Datos de inicio de sesión inválidos',
    }
  }

  try {
    const headersList = await nextHeaders()

    const result = await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: headersList,
    })

    if (!result) {
      return {
        success: false,
        error: 'Credenciales incorrectas',
      }
    }
  } catch (error) {
    logError(error, 'signIn')

    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return {
      success: false,
      error: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
    }
  }

  // redirect() throws an error internally, so it must be called outside try/catch
  // This properly handles the cookie updates from better-auth
  redirect('/')
}

export async function signUp(data: TSignUpInput): Promise<TAuthResult | never> {
  const validated = signUpSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: 'Datos de registro inválidos',
    }
  }

  try {
    const headersList = await nextHeaders()

    const result = await auth.api.signUpEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
        name: validated.data.name,
      },
      headers: headersList,
    })

    if (!result) {
      return {
        success: false,
        error: 'Error al crear la cuenta',
      }
    }
  } catch (error) {
    logError(error, 'signUp')

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

    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return {
      success: false,
      error: 'Error al crear la cuenta. Por favor, intenta de nuevo.',
    }
  }

  // redirect() throws an error internally, so it must be called outside try/catch
  // This properly handles the cookie updates from better-auth
  redirect('/')
}

// Server Action for form submission with useActionState
export async function signInAction(
  _prevState: TAuthResult | null,
  formData: FormData,
): Promise<TAuthResult> {
  const email = sanitizeFormData(formData.get('email'))
  const password = sanitizeFormData(formData.get('password'))

  const validated = signInSchema.safeParse({ email, password })

  if (!validated.success) {
    return {
      success: false,
      error: 'Datos de inicio de sesion invalidos',
    }
  }

  try {
    const headersList = await nextHeaders()

    const result = await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: headersList,
    })

    if (!result) {
      return {
        success: false,
        error: 'Credenciales incorrectas',
      }
    }
  } catch (error) {
    logError(error, 'signInAction')

    // Verificar si es un error de email no verificado
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      const message = error.message.toLowerCase()
      if (
        message.includes('email') &&
        (message.includes('verified') || message.includes('verification'))
      ) {
        return {
          success: false,
          error:
            'Debes verificar tu email antes de iniciar sesion. Revisa tu bandeja de entrada.',
          requiresEmailVerification: true,
        }
      }
    }

    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return {
      success: false,
      error: 'Error al iniciar sesion. Por favor, intenta de nuevo.',
    }
  }

  return {
    success: true,
  }
}

// Server Action for form submission with useActionState
export async function signUpAction(
  _prevState: TAuthResult | null,
  formData: FormData,
): Promise<TAuthResult> {
  const name = sanitizeFormData(formData.get('name'))
  const email = sanitizeFormData(formData.get('email'))
  const password = sanitizeFormData(formData.get('password'))
  const confirmPassword = sanitizeFormData(formData.get('confirmPassword'))

  const validated = signUpSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  })

  if (!validated.success) {
    return {
      success: false,
      error: 'Datos de registro invalidos',
    }
  }

  try {
    const headersList = await nextHeaders()

    const result = await auth.api.signUpEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
        name: validated.data.name,
      },
      headers: headersList,
    })

    if (!result) {
      return {
        success: false,
        error: 'Error al crear la cuenta',
      }
    }

    return {
      success: true,
      requiresEmailVerification: true,
    }
  } catch (error) {
    logError(error, 'signUpAction')

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
        error: 'Este email ya esta registrado',
      }
    }

    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return {
      success: false,
      error: 'Error al crear la cuenta. Por favor, intenta de nuevo.',
    }
  }
}

export async function signOut(): Promise<TAuthResult> {
  try {
    const headersList = await nextHeaders()
    await auth.api.signOut({
      headers: headersList,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error en signOut:', error)
    logError(error, 'signOut')

    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return {
      success: false,
      error: 'Error al cerrar sesión',
    }
  }
}
