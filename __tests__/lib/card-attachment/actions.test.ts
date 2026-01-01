/**
 * Card Attachment Actions Tests
 * Tests for upload and delete attachment server actions
 */

import { del, put } from '@vercel/blob'
import { revalidatePath, revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import {
  ATTACHMENT_CONFIG,
  ATTACHMENT_ERRORS,
} from '@/lib/card-attachment/constants'

// Mock dependencies - must be before imports
vi.mock('@vercel/blob')
vi.mock('next/cache')
vi.mock('@/lib/auth/get-user')
vi.mock('@/lib/board-member/queries')
vi.mock('@/lib/card/queries')
vi.mock('@/lib/activity/logger')
vi.mock('@/lib/card-attachment/queries')
vi.mock('@/db')

import { getCurrentUser } from '@/lib/auth/get-user'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { getBoardIdByCardId } from '@/lib/card/queries'
// Import after mocks
import {
  deleteAttachment,
  uploadAttachment,
} from '@/lib/card-attachment/actions'
import {
  getAttachmentById,
  getAttachmentCountByCardId,
} from '@/lib/card-attachment/queries'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/board-member/queries', () => ({
  hasUserBoardAccess: vi.fn(),
}))

vi.mock('@/lib/card/queries', () => ({
  getBoardIdByCardId: vi.fn(),
}))

vi.mock('@/lib/activity/logger', () => ({
  logActivity: vi.fn(),
}))

vi.mock('@/lib/card-attachment/queries', () => ({
  getAttachmentCountByCardId: vi.fn(),
  getAttachmentById: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([
          {
            id: 'attachment-new',
            cardId: 'card-123',
            fileName: 'test.jpg',
            fileUrl: 'https://blob.vercel-storage.com/file.jpg',
            downloadUrl: 'https://blob.vercel-storage.com/file.jpg?download=1',
            contentType: 'image/jpeg',
            fileSize: 1000,
            uploadedBy: 'user-123',
            createdAt: new Date(),
          },
        ]),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    })),
  },
}))

describe('Card Attachment Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadAttachment', () => {
    const mockCardId = 'card-123'
    const mockBoardId = 'board-123'
    const mockUserId = 'user-123'

    const createMockFile = (size: number, type: string, name: string): File => {
      const blob = new Blob(['a'.repeat(size)], { type })
      return new File([blob], name, { type })
    }

    beforeEach(() => {
      // biome-ignore lint/suspicious/noExplicitAny: Partial mock
      vi.mocked(getCurrentUser).mockResolvedValue({ id: mockUserId } as any)
      vi.mocked(getBoardIdByCardId).mockResolvedValue(mockBoardId)
      vi.mocked(hasUserBoardAccess).mockResolvedValue(true)
      vi.mocked(getAttachmentCountByCardId).mockResolvedValue(0)
      vi.mocked(put as Mock).mockResolvedValue({
        url: 'https://blob.vercel-storage.com/file.jpg',
        downloadUrl: 'https://blob.vercel-storage.com/file.jpg?download=1',
      })
    })

    it('should reject unauthenticated users', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const file = createMockFile(1000, 'image/jpeg', 'test.jpg')
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', file)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.UNAUTHORIZED)
    })

    it('should reject files that are too large', async () => {
      const oversizedFile = createMockFile(
        ATTACHMENT_CONFIG.maxFileSize + 1,
        'image/jpeg',
        'large.jpg',
      )
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', oversizedFile)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.FILE_TOO_LARGE)
    })

    it('should reject disallowed file types', async () => {
      const invalidFile = createMockFile(1000, 'application/x-exe', 'virus.exe')
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', invalidFile)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.INVALID_FILE_TYPE)
    })

    it('should reject when card has reached max attachments', async () => {
      vi.mocked(getAttachmentCountByCardId).mockResolvedValue(
        ATTACHMENT_CONFIG.maxFilesPerCard,
      )

      const file = createMockFile(1000, 'image/jpeg', 'test.jpg')
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', file)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.MAX_FILES_REACHED)
    })

    it('should reject when user has no board access', async () => {
      vi.mocked(hasUserBoardAccess).mockResolvedValue(false)

      const file = createMockFile(1000, 'image/jpeg', 'test.jpg')
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', file)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.UNAUTHORIZED)
    })

    it('should successfully upload a valid file', async () => {
      const file = createMockFile(1000, 'image/jpeg', 'test.jpg')
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', file)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(put).toHaveBeenCalled()
      expect(revalidateTag).toHaveBeenCalledWith(
        `board:${mockBoardId}:lists`,
        'max',
      )
      expect(revalidatePath).toHaveBeenCalledWith(`/boards/${mockBoardId}`)
    })

    it('should handle blob upload failures gracefully', async () => {
      vi.mocked(put as Mock).mockRejectedValue(new Error('Blob upload failed'))

      const file = createMockFile(1000, 'image/jpeg', 'test.jpg')
      const formData = new FormData()
      formData.append('cardId', mockCardId)
      formData.append('file', file)

      const result = await uploadAttachment(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.UPLOAD_FAILED)
    })
  })

  describe('deleteAttachment', () => {
    const mockAttachmentId = 'attachment-123'
    const mockCardId = 'card-123'
    const mockBoardId = 'board-123'
    const mockUserId = 'user-123'
    const mockFileUrl = 'https://blob.vercel-storage.com/file.jpg'

    beforeEach(() => {
      // biome-ignore lint/suspicious/noExplicitAny: Partial mock
      vi.mocked(getCurrentUser).mockResolvedValue({ id: mockUserId } as any)
      vi.mocked(getBoardIdByCardId).mockResolvedValue(mockBoardId)
      vi.mocked(hasUserBoardAccess).mockResolvedValue(true)
      vi.mocked(getAttachmentById).mockResolvedValue({
        id: mockAttachmentId,
        cardId: mockCardId,
        fileName: 'test.jpg',
        fileUrl: mockFileUrl,
        downloadUrl: `${mockFileUrl}?download=1`,
        contentType: 'image/jpeg',
        fileSize: 1000,
        uploadedBy: mockUserId,
        createdAt: new Date(),
      })
      vi.mocked(del as Mock).mockResolvedValue(undefined)
    })

    it('should reject unauthenticated users', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await deleteAttachment({ attachmentId: mockAttachmentId })

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.UNAUTHORIZED)
    })

    it('should reject when attachment not found', async () => {
      vi.mocked(getAttachmentById).mockResolvedValue(undefined)

      const result = await deleteAttachment({ attachmentId: mockAttachmentId })

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.NOT_FOUND)
    })

    it('should reject when user has no board access', async () => {
      vi.mocked(hasUserBoardAccess).mockResolvedValue(false)

      const result = await deleteAttachment({ attachmentId: mockAttachmentId })

      expect(result.success).toBe(false)
      expect(result.error).toBe(ATTACHMENT_ERRORS.UNAUTHORIZED)
    })

    it('should successfully delete attachment', async () => {
      const result = await deleteAttachment({ attachmentId: mockAttachmentId })

      expect(result.success).toBe(true)
      expect(del).toHaveBeenCalledWith(mockFileUrl)
      expect(revalidateTag).toHaveBeenCalledWith(
        `board:${mockBoardId}:lists`,
        'max',
      )
      expect(revalidatePath).toHaveBeenCalledWith(`/boards/${mockBoardId}`)
    })

    it('should handle blob deletion failures gracefully (tolerant)', async () => {
      // With the new implementation, blob deletion errors are logged but don't fail the operation
      vi.mocked(del as Mock).mockRejectedValue(new Error('Blob delete failed'))

      const result = await deleteAttachment({ attachmentId: mockAttachmentId })

      // Should succeed because DB deletion completed (blob error is tolerated)
      expect(result.success).toBe(true)
      expect(del).toHaveBeenCalledWith(mockFileUrl)
    })

    it('should complete successfully even if blob deletion fails', async () => {
      // DB deletion happens first, then blob deletion (which may fail)
      vi.mocked(del as Mock).mockRejectedValue(new Error('Blob delete failed'))

      const result = await deleteAttachment({ attachmentId: mockAttachmentId })

      // Should succeed - the attachment record is deleted even if blob cleanup fails
      expect(result.success).toBe(true)
      expect(revalidateTag).toHaveBeenCalledWith(
        `board:${mockBoardId}:lists`,
        'max',
      )
    })
  })
})
