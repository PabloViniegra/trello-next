import { describe, expect, it } from 'vitest'
import {
  deleteAvatarSchema,
  updateUserNameSchema,
  updateUserPasswordSchema,
  uploadAvatarSchema,
} from '@/lib/user/schemas'

describe('User Schemas', () => {
  describe('updateUserNameSchema', () => {
    it('should accept valid names', () => {
      const valid = [
        { name: 'John Doe' },
        { name: 'María García' },
        { name: 'A B' }, // Minimum 2 characters
        { name: 'A'.repeat(100) }, // Maximum 100 characters
      ]

      for (const data of valid) {
        const result = updateUserNameSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should reject names that are too short', () => {
      const result = updateUserNameSchema.safeParse({ name: 'A' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('al menos 2 caracteres')
      }
    })

    it('should reject names that are too long', () => {
      const result = updateUserNameSchema.safeParse({ name: 'A'.repeat(101) })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('no puede exceder 100 caracteres')
      }
    })

    it('should trim whitespace', () => {
      const result = updateUserNameSchema.safeParse({ name: '  John Doe  ' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Doe')
      }
    })
  })

  describe('updateUserPasswordSchema', () => {
    it('should accept valid password updates', () => {
      const valid = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmPassword: 'NewPass456',
      }

      const result = updateUserPasswordSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject if passwords do not match', () => {
      const invalid = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmPassword: 'DifferentPass789',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('no coinciden')
      }
    })

    it('should reject if new password is same as current', () => {
      const invalid = {
        currentPassword: 'SamePass123',
        newPassword: 'SamePass123',
        confirmPassword: 'SamePass123',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('debe ser diferente')
      }
    })

    it('should reject passwords without uppercase', () => {
      const invalid = {
        currentPassword: 'OldPass123',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('mayúscula')
      }
    })

    it('should reject passwords without lowercase', () => {
      const invalid = {
        currentPassword: 'OldPass123',
        newPassword: 'NEWPASS456',
        confirmPassword: 'NEWPASS456',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('minúscula')
      }
    })

    it('should reject passwords without numbers', () => {
      const invalid = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPassword',
        confirmPassword: 'NewPassword',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('número')
      }
    })

    it('should reject passwords that are too short', () => {
      const invalid = {
        currentPassword: 'OldPass123',
        newPassword: 'Pass1',
        confirmPassword: 'Pass1',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('al menos 8 caracteres')
      }
    })

    it('should reject passwords that are too long', () => {
      const invalid = {
        currentPassword: 'OldPass123',
        newPassword: 'A'.repeat(101) + '1Aa',
        confirmPassword: 'A'.repeat(101) + '1Aa',
      }

      const result = updateUserPasswordSchema.safeParse(invalid)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('no puede exceder 100 caracteres')
      }
    })
  })

  describe('uploadAvatarSchema', () => {
    it('should accept valid image files', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

      for (const type of validTypes) {
        const file = new File(['image content'], 'avatar.jpg', { type })
        const result = uploadAvatarSchema.safeParse({ file })

        expect(result.success).toBe(true)
      }
    })

    it('should reject non-image files', () => {
      const file = new File(['text content'], 'document.txt', {
        type: 'text/plain',
      })
      const result = uploadAvatarSchema.safeParse({ file })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('imágenes')
      }
    })

    it('should reject empty files', () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' })
      const result = uploadAvatarSchema.safeParse({ file })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('vacío')
      }
    })

    it('should reject files larger than 5MB', () => {
      // Create a mock file larger than 5MB
      const largeContent = new Uint8Array(6 * 1024 * 1024)
      const file = new File([largeContent], 'large-image.jpg', {
        type: 'image/jpeg',
      })

      const result = uploadAvatarSchema.safeParse({ file })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('5MB')
      }
    })
  })

  describe('deleteAvatarSchema', () => {
    it('should accept valid UUIDs', () => {
      const validUUIDs = [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '550e8400-e29b-41d4-a716-446655440000',
      ]

      for (const userId of validUUIDs) {
        const result = deleteAvatarSchema.safeParse({ userId })
        expect(result.success).toBe(true)
      }
    })

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '12345',
        'f47ac10b-58cc-4372-a567', // Incomplete UUID
      ]

      for (const userId of invalidUUIDs) {
        const result = deleteAvatarSchema.safeParse({ userId })
        expect(result.success).toBe(false)
      }
    })
  })
})
