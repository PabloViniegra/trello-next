import { beforeEach, describe, expect, it, vi } from 'vitest'

// Use vi.hoisted to define mock functions before they're used in vi.mock
const { mockInsert, mockUpdate, mockDelete, mockSelect, mockGetCurrentUser } =
  vi.hoisted(() => ({
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockSelect: vi.fn(),
    mockGetCurrentUser: vi.fn(),
  }))

// Mock the database
vi.mock('@/db', () => ({
  db: {
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    select: mockSelect,
  },
}))

// Mock auth
vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: mockGetCurrentUser,
}))

// Mock errors
vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

// Import after mocking
import {
  createBoard,
  deleteBoard,
  updateBoard,
  updateBoardPrivacy,
} from '@/lib/board/actions'

describe('Board Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createBoard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await createBoard({
        title: 'My Board',
        backgroundColor: '#0079bf',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para crear un tablero')
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createBoard({
        title: '', // Invalid empty title
        backgroundColor: '#0079bf',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El título es obligatorio')
    })

    it('creates board successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const mockBoard = {
        id: 'board-123',
        title: 'My Board',
        description: null,
        backgroundColor: '#0079bf',
        ownerId: 'user-123',
      }

      mockInsert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBoard]),
        }),
      })

      const result = await createBoard({
        title: 'My Board',
        backgroundColor: '#0079bf',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockBoard)
    })

    it('handles database error', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      mockInsert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('DB Error')),
        }),
      })

      const result = await createBoard({
        title: 'My Board',
        backgroundColor: '#0079bf',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Error al crear el tablero. Por favor, intenta de nuevo.',
      )
    })
  })

  describe('deleteBoard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await deleteBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para eliminar un tablero')
    })

    it('returns error for invalid boardId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await deleteBoard({
        boardId: 'invalid-uuid',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('ID de tablero inválido')
    })

    it('returns error when board does not exist', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await deleteBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El tablero no existe')
    })

    it('returns error when user is not owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                ownerId: 'other-user',
              },
            ]),
          }),
        }),
      })

      const result = await deleteBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes permiso para eliminar este tablero')
    })

    it('deletes board successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                ownerId: 'user-123',
              },
            ]),
          }),
        }),
      })

      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await deleteBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('updateBoard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para editar un tablero')
    })

    it('returns error when no fields to update', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                ownerId: 'user-123',
              },
            ]),
          }),
        }),
      })

      const result = await updateBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No se proporcionaron campos para actualizar')
    })

    it('updates board successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const mockBoard = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title',
        ownerId: 'user-123',
      }

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockBoard]),
          }),
        }),
      })

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockBoard]),
          }),
        }),
      })

      const result = await updateBoard({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title',
      })

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Updated Title')
    })
  })

  describe('updateBoardPrivacy', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateBoardPrivacy({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        isPrivate: 'private',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para cambiar la privacidad del tablero',
      )
    })

    it('returns error for invalid privacy value', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await updateBoardPrivacy({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        // @ts-expect-error Testing invalid value
        isPrivate: 'invalid',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Valor de privacidad inválido')
    })

    it('updates privacy successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const mockBoard = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isPrivate: 'private',
        ownerId: 'user-123',
      }

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockBoard]),
          }),
        }),
      })

      const result = await updateBoardPrivacy({
        boardId: '123e4567-e89b-12d3-a456-426614174000',
        isPrivate: 'private',
      })

      expect(result.success).toBe(true)
    })
  })
})
