'use server'

import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { signInSchema, signUpSchema } from './schemas'
import type { TAuthResult, TSignInInput, TSignUpInput } from './types'

export async function signIn(data: TSignInInput) {
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
    console.error('Error en signIn:', error)
    return {
      success: false,
      error: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
    }
  }

  // redirect() throws an error internally, so it must be called outside try/catch
  // This properly handles the cookie updates from better-auth
  redirect('/')
}

export async function signUp(data: TSignUpInput) {
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

  // redirect() throws an error internally, so it must be called outside try/catch
  // This properly handles the cookie updates from better-auth
  redirect('/')
}

// Server Action for form submission with useActionState
export async function signInAction(
  _prevState: TAuthResult | null,
  formData: FormData,
) {
  const email = formData.get('email')
  const password = formData.get('password')

  const validated = signInSchema.safeParse({ email, password })

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
    console.error('Error en signIn:', error)
    return {
      success: false,
      error: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
    }
  }

  // redirect() must be outside try/catch
  redirect('/')
}

// Server Action for form submission with useActionState
export async function signUpAction(
  _prevState: TAuthResult | null,
  formData: FormData,
) {
  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  const validated = signUpSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  })

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

  // redirect() must be outside try/catch
  redirect('/')
}

export async function signOut(): Promise<void> {
  try {
    const headersList = await nextHeaders()
    await auth.api.signOut({
      headers: headersList,
    })
  } catch (error) {
    console.error('Error en signOut:', error)
    throw new Error('Error al cerrar sesión')
  }

  redirect('/login')
}
