import type { z } from 'zod'
import type { signInSchema, signUpSchema } from './schemas'

export type TSignInInput = z.infer<typeof signInSchema>

export type TSignUpInput = z.infer<typeof signUpSchema>

export type TAuthResult = {
  success: boolean
  data?: {
    userId: string
  }
  error?: string
}

export type TAuthError =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'
