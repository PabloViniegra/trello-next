import { beforeEach, describe, expect, it, vi } from 'vitest'

// Use vi.hoisted to define mock functions before they're used in vi.mock
const {
  mockGetCurrentUser,
  mockUpdate,
  mockAuth,
  mockPut,
  mockDel,
  mockLogError,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockUpdate: vi.fn(),
  mockAuth: {
    api: {
      signInEmail: vi.fn(),
      changePassword: vi.fn(),
    },
  },
  mockPut: vi.fn(),
  mockDel: vi.fn(),
  mockLogError: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

// Mock dependencies
vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: mockGetCurrentUser,
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

vi.mock('@vercel/blob', () => ({
  put: mockPut,
  del: mockDel,
}))

vi.mock('@/lib/errors', () => ({
  logError: mockLogError,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}))

vi.mock('@/auth-schema', () => ({
  user: {
    id: 'mock-id',
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

// Import after mocking
import {
  deleteAvatar,
  updateUserName,
  updateUserPassword,
  uploadAvatar,
} from '@/lib/user/actions'

describe('User Actions', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateUserName', () => {
    it('should update user name successfully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await updateUserName({ name: 'New Name' })

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
    })

    it('should reject if user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateUserName({ name: 'New Name' })

      expect(result).toEqual({
        success: false,
        error: 'Debes iniciar sesión para actualizar tu perfil',
      })
    })

    it('should reject invalid names', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await updateUserName({ name: 'A' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('al menos 2 caracteres')
    })

    it('should reject names that are too long', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await updateUserName({ name: 'A'.repeat(101) })

      expect(result.success).toBe(false)
      expect(result.error).toContain('no puede exceder 100 caracteres')
    })
  })

  describe('updateUserPassword', () => {
    it('should update password when current password is correct', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)
      mockAuth.api.signInEmail.mockResolvedValue({ success: true })
      mockAuth.api.changePassword.mockResolvedValue({ success: true })

      const result = await updateUserPassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmPassword: 'NewPass456',
      })

      expect(result).toEqual({ success: true })
      expect(mockAuth.api.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            email: mockUser.email,
            password: 'OldPass123',
          },
        }),
      )
      expect(mockAuth.api.changePassword).toHaveBeenCalled()
    })

    it('should reject if user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateUserPassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmPassword: 'NewPass456',
      })

      expect(result).toEqual({
        success: false,
        error: 'Debes iniciar sesión para actualizar tu contraseña',
      })
    })

    it('should reject if current password is incorrect', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)
      mockAuth.api.signInEmail.mockRejectedValue(new Error('Invalid password'))

      const result = await updateUserPassword({
        currentPassword: 'WrongPassword',
        newPassword: 'NewPass456',
        confirmPassword: 'NewPass456',
      })

      expect(result).toEqual({
        success: false,
        error: 'La contraseña actual es incorrecta',
      })
    })

    it('should reject if passwords do not match', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await updateUserPassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmPassword: 'DifferentPass789',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('no coinciden')
    })

    it('should reject if new password is same as current', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await updateUserPassword({
        currentPassword: 'SamePass123',
        newPassword: 'SamePass123',
        confirmPassword: 'SamePass123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('debe ser diferente')
    })

    it('should reject weak passwords', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await updateUserPassword({
        currentPassword: 'OldPass123',
        newPassword: 'weak',
        confirmPassword: 'weak',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)
      mockPut.mockResolvedValue({
        url: 'https://blob.url/avatar.jpg',
        downloadUrl: 'https://blob.url/avatar.jpg?download=1',
      })

      const formData = new FormData()
      const file = new File(['image content'], 'avatar.jpg', {
        type: 'image/jpeg',
      })
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      expect(result.success).toBe(true)
      if (result.success && result.data) {
        expect(result.data.imageUrl).toBe('https://blob.url/avatar.jpg')
      }
      expect(mockPut).toHaveBeenCalled()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
    })

    it('should delete old avatar when uploading new one', async () => {
      const userWithAvatar = {
        ...mockUser,
        image: 'https://old-blob.url/old-avatar.jpg',
      }
      mockGetCurrentUser.mockResolvedValue(userWithAvatar)
      mockPut.mockResolvedValue({
        url: 'https://blob.url/new-avatar.jpg',
        downloadUrl: 'https://blob.url/new-avatar.jpg?download=1',
      })

      const formData = new FormData()
      const file = new File(['image content'], 'avatar.jpg', {
        type: 'image/jpeg',
      })
      formData.append('file', file)

      await uploadAvatar(formData)

      expect(mockDel).toHaveBeenCalledWith(
        'https://old-blob.url/old-avatar.jpg',
      )
    })

    it('should reject if user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const formData = new FormData()
      const file = new File(['image content'], 'avatar.jpg', {
        type: 'image/jpeg',
      })
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      expect(result).toEqual({
        success: false,
        error: 'Debes iniciar sesión para actualizar tu avatar',
      })
    })

    it('should reject non-image files', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const formData = new FormData()
      const file = new File(['text content'], 'document.txt', {
        type: 'text/plain',
      })
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('imágenes')
    })

    it('should reject files larger than 5MB', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const formData = new FormData()
      // Create a mock file larger than 5MB
      const largeContent = new Uint8Array(6 * 1024 * 1024)
      const file = new File([largeContent], 'large-image.jpg', {
        type: 'image/jpeg',
      })
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('5MB')
    })
  })

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      const userWithAvatar = {
        ...mockUser,
        image: 'https://blob.url/avatar.jpg',
      }
      mockGetCurrentUser.mockResolvedValue(userWithAvatar)

      const result = await deleteAvatar()

      expect(result).toEqual({ success: true })
      expect(mockDel).toHaveBeenCalledWith('https://blob.url/avatar.jpg')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
    })

    it('should reject if user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await deleteAvatar()

      expect(result).toEqual({
        success: false,
        error: 'Debes iniciar sesión para eliminar tu avatar',
      })
    })

    it('should reject if user has no avatar', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const result = await deleteAvatar()

      expect(result).toEqual({
        success: false,
        error: 'No tienes un avatar para eliminar',
      })
    })

    it('should still succeed if blob deletion fails', async () => {
      const userWithAvatar = {
        ...mockUser,
        image: 'https://blob.url/avatar.jpg',
      }
      mockGetCurrentUser.mockResolvedValue(userWithAvatar)
      mockDel.mockRejectedValue(new Error('Blob deletion failed'))

      const result = await deleteAvatar()

      // Should still succeed and update database
      expect(result).toEqual({ success: true })
    })
  })
})
