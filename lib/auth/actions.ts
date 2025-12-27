'use server'

import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppError, logError } from '@/lib/errors'
import { sanitizeFormData } from '@/lib/utils/form'
import { authRateLimit } from '@/lib/utils/rate-limit'
import {
  signInSchema,
  signUpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from './schemas'
import type { TAuthResult, TSignInInput, TSignUpInput } from './types'

// =============================================================================
// HELPERS
// =============================================================================

async function getClientIp(): Promise<string> {
  const headersList = await nextHeaders()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'anonymous'
  )
}

export async function signIn(data: TSignInInput): Promise<TAuthResult | never> {
  // Rate limiting
  const clientIp = await getClientIp()
  const rateLimitResult = authRateLimit.signIn(clientIp)

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateLimitResult.resetIn / 1000)} segundos.`,
    }
  }

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
  // Rate limiting
  const clientIp = await getClientIp()
  const rateLimitResult = authRateLimit.signUp(clientIp)

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateLimitResult.resetIn / 1000)} segundos.`,
    }
  }

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
  // Rate limiting
  const clientIp = await getClientIp()
  const rateLimitResult = authRateLimit.signIn(clientIp)

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateLimitResult.resetIn / 1000)} segundos.`,
    }
  }

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
  // Rate limiting
  const clientIp = await getClientIp()
  const rateLimitResult = authRateLimit.signUp(clientIp)

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateLimitResult.resetIn / 1000)} segundos.`,
    }
  }

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

/**
 * Server action to request a password reset email.
 * Always returns success to prevent email enumeration attacks.
 *
 * @param _prevState - Previous form state (unused)
 * @param formData - Form data containing the email address
 * @returns Result object with success status
 */
export async function requestPasswordResetAction(
  _prevState: TAuthResult | null,
  formData: FormData,
): Promise<TAuthResult> {
  // Rate limiting
  const clientIp = await getClientIp()
  const rateLimitResult = authRateLimit.signIn(clientIp) // Using signIn rate limit for password reset

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateLimitResult.resetIn / 1000)} segundos.`,
    }
  }

  const email = sanitizeFormData(formData.get('email'))

  const validated = requestPasswordResetSchema.safeParse({ email })

  if (!validated.success) {
    return {
      success: false,
      error: 'Correo electrónico inválido',
    }
  }

  try {
    const headersList = await nextHeaders()

    await auth.api.requestPasswordReset({
      body: {
        email: validated.data.email,
        redirectTo: '/reset-password',
      },
      headers: headersList,
    })

    // Always return success even if the user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'requestPasswordResetAction')

    // Still return success to prevent email enumeration
    // The actual error is logged for debugging
    return {
      success: true,
    }
  }
}

/**
 * Server action to reset password using a valid token.
 *
 * @param _prevState - Previous form state (unused)
 * @param formData - Form data containing token, newPassword, and confirmPassword
 * @returns Result object with success status and optional error message
 */
export async function resetPasswordAction(
  _prevState: TAuthResult | null,
  formData: FormData,
): Promise<TAuthResult> {
  const token = sanitizeFormData(formData.get('token'))
  const newPassword = sanitizeFormData(formData.get('newPassword'))
  const confirmPassword = sanitizeFormData(formData.get('confirmPassword'))

  const validated = resetPasswordSchema.safeParse({
    token,
    newPassword,
    confirmPassword,
  })

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    const errorMessage = firstError?.message || 'Datos inválidos'

    // Replace Zod's default English error messages with Spanish
    if (
      errorMessage.includes('expected string') ||
      errorMessage.includes('Invalid input')
    ) {
      return {
        success: false,
        error: 'Datos inválidos',
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }

  try {
    const headersList = await nextHeaders()

    await auth.api.resetPassword({
      body: {
        newPassword: validated.data.newPassword,
      },
      query: {
        token: validated.data.token,
      },
      headers: headersList,
    })

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'resetPasswordAction')

    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      const message = error.message.toLowerCase()
      if (message.includes('invalid') || message.includes('expired')) {
        return {
          success: false,
          error:
            'El enlace de restablecimiento ha expirado o es inválido. Solicita uno nuevo.',
        }
      }
    }

    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return {
      success: false,
      error: 'Error al restablecer la contraseña. Por favor, intenta de nuevo.',
    }
  }
}
