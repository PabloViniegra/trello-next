import type { z } from 'zod'
import type { signInSchema, signUpSchema } from './schemas'

// =============================================================================
// USER TYPES
// =============================================================================

export type TUser = {
  id: string
  name: string
  email: string
  image?: string
}

// =============================================================================
// AUTH INPUT TYPES
// =============================================================================

export type TSignInInput = z.infer<typeof signInSchema>

export type TSignUpInput = z.infer<typeof signUpSchema>

// =============================================================================
// AUTH RESULT TYPES
// =============================================================================

export type TAuthResult = {
  success: boolean
  data?: {
    userId: string
  }
  error?: string
  requiresEmailVerification?: boolean
}

export type TAuthError =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'
