import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from '@/lib/auth/schemas'

describe('Auth Schemas', () => {
  describe('signInSchema', () => {
    it('validates correct login data', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('transforms email to lowercase', () => {
      const result = signInSchema.safeParse({
        email: 'Test@EXAMPLE.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('rejects empty email', () => {
      const result = signInSchema.safeParse({
        email: '',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El email es obligatorio')
      }
    })

    it('rejects invalid email format', () => {
      const result = signInSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido')
      }
    })

    it('rejects empty password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La contraseña es obligatoria',
        )
      }
    })
  })

  describe('signUpSchema', () => {
    it('validates correct registration data', () => {
      const result = signUpSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects name shorter than 2 characters', () => {
      const result = signUpSchema.safeParse({
        name: 'A',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El nombre debe tener al menos 2 caracteres',
        )
      }
    })

    it('rejects name longer than 100 characters', () => {
      const result = signUpSchema.safeParse({
        name: 'A'.repeat(101),
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El nombre no puede exceder 100 caracteres',
        )
      }
    })

    it('rejects password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: '1234567',
        confirmPassword: '1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La contraseña debe tener al menos 8 caracteres',
        )
      }
    })

    it('rejects password longer than 100 characters', () => {
      const longPassword = 'A'.repeat(101)
      const result = signUpSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: longPassword,
        confirmPassword: longPassword,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La contraseña no puede exceder 100 caracteres',
        )
      }
    })

    it('rejects mismatched passwords', () => {
      const result = signUpSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Las contraseñas no coinciden',
        )
      }
    })

    it('trims name and transforms email to lowercase', () => {
      const result = signUpSchema.safeParse({
        name: '  Test User  ',
        email: 'Test@Example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test User')
        expect(result.data.email).toBe('test@example.com')
      }
    })
  })
})
