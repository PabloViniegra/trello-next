import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from '@/lib/auth/actions'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    },
  },
}))

// Mock utils
vi.mock('@/lib/utils/form', () => ({
  sanitizeFormData: (value: FormDataEntryValue | null) => value as string,
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  authRateLimit: {
    signIn: vi.fn().mockReturnValue({ success: true }),
  },
}))

vi.mock('@/lib/errors', () => ({
  AppError: class AppError extends Error {},
  logError: vi.fn(),
}))

describe('Password Reset Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requestPasswordResetAction', () => {
    it('should return success for valid email', async () => {
      const formData = new FormData()
      formData.set('email', 'test@example.com')

      const result = await requestPasswordResetAction(null, formData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid email format', async () => {
      const formData = new FormData()
      formData.set('email', '')

      const result = await requestPasswordResetAction(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Correo electrónico inválido')
    })

    it('should always return success even if user does not exist (security)', async () => {
      const { auth } = await import('@/lib/auth')
      vi.mocked(auth.api.requestPasswordReset).mockRejectedValueOnce(
        new Error('User not found'),
      )

      const formData = new FormData()
      formData.set('email', 'nonexistent@example.com')

      const result = await requestPasswordResetAction(null, formData)

      // Should still return success to prevent email enumeration
      expect(result.success).toBe(true)
    })

    it('should handle rate limiting', async () => {
      const { authRateLimit } = await import('@/lib/utils/rate-limit')
      vi.mocked(authRateLimit.signIn).mockReturnValueOnce({
        success: false,
        remaining: 0,
        resetIn: 60000,
      })

      const formData = new FormData()
      formData.set('email', 'test@example.com')

      const result = await requestPasswordResetAction(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Demasiados intentos')
    })
  })

  describe('resetPasswordAction', () => {
    it('should return success for valid token and matching passwords', async () => {
      const formData = new FormData()
      formData.set('token', 'valid-token')
      formData.set('newPassword', 'newpassword123')
      formData.set('confirmPassword', 'newpassword123')

      const result = await resetPasswordAction(null, formData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error when passwords do not match', async () => {
      const formData = new FormData()
      formData.set('token', 'valid-token')
      formData.set('newPassword', 'newpassword123')
      formData.set('confirmPassword', 'differentpassword123')

      const result = await resetPasswordAction(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Las contraseñas no coinciden')
    })

    it('should return error for password shorter than 8 characters', async () => {
      const formData = new FormData()
      formData.set('token', 'valid-token')
      formData.set('newPassword', 'short')
      formData.set('confirmPassword', 'short')

      const result = await resetPasswordAction(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'La contraseña debe tener al menos 8 caracteres',
      )
    })

    it('should return error for missing token', async () => {
      const formData = new FormData()
      formData.set('newPassword', 'newpassword123')
      formData.set('confirmPassword', 'newpassword123')

      const result = await resetPasswordAction(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Datos inválidos')
    })

    it('should handle invalid/expired token error', async () => {
      const { auth } = await import('@/lib/auth')
      vi.mocked(auth.api.resetPassword).mockRejectedValueOnce(
        new Error('Invalid token'),
      )

      const formData = new FormData()
      formData.set('token', 'invalid-token')
      formData.set('newPassword', 'newpassword123')
      formData.set('confirmPassword', 'newpassword123')

      const result = await resetPasswordAction(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('expirado o es inválido')
    })
  })
})
