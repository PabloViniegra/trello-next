import { beforeEach, describe, expect, it, vi } from 'vitest'

// Use vi.hoisted to define mock functions before they're used in vi.mock
const {
  mockQuery,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockSelect,
  mockTransaction,
  mockGetCurrentUser,
  mockHasUserBoardAccess,
} = vi.hoisted(() => ({
  mockQuery: {
    list: {
      findFirst: vi.fn(),
    },
    board: {
      findFirst: vi.fn(),
    },
  },
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockSelect: vi.fn(),
  mockTransaction: vi.fn(),
  mockGetCurrentUser: vi.fn(),
  mockHasUserBoardAccess: vi.fn(),
}))

// Mock the database
vi.mock('@/db', () => ({
  db: {
    query: mockQuery,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    select: mockSelect,
    transaction: mockTransaction,
  },
}))

// Mock auth
vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: mockGetCurrentUser,
}))

// Mock board member queries
vi.mock('@/lib/board-member/queries', () => ({
  hasUserBoardAccess: mockHasUserBoardAccess,
}))

// Mock errors
vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

// Import after mocking
import { createList, deleteList, updateList } from '@/lib/list/actions'

describe('List Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createList', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await createList({
        title: 'My List',
        boardId: 'board-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para crear una lista')
    })

    it('returns error for invalid data - empty title', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createList({
        title: '',
        boardId: 'board-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Title is required')
    })

    it('returns error for invalid data - empty boardId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createList({
        title: 'My List',
        boardId: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Board ID is required')
    })

    it('returns error when board not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockHasUserBoardAccess.mockResolvedValue(false)

      const result = await createList({
        title: 'My List',
        boardId: 'board-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'No tienes permiso para añadir listas a este tablero',
      )
    })

    it('returns error when user does not have board access', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockHasUserBoardAccess.mockResolvedValue(false)

      const result = await createList({
        title: 'My List',
        boardId: 'board-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'No tienes permiso para añadir listas a este tablero',
      )
    })

    it('creates list successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockHasUserBoardAccess.mockResolvedValue(true)
      mockQuery.board.findFirst.mockResolvedValue({
        id: 'board-123',
        ownerId: 'user-123',
      })

      const mockList = { id: 'list-123', title: 'My List' }

      mockTransaction.mockImplementation(async (callback) => {
        const lockQueryMock = {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              for: vi.fn().mockResolvedValue([{ id: 'board-123' }]),
            }),
          }),
        }

        const maxPosQueryMock = {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ max: 0 }]),
          }),
        }

        const tx = {
          select: vi
            .fn()
            .mockReturnValueOnce(lockQueryMock)
            .mockReturnValueOnce(maxPosQueryMock),
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockList]),
            }),
          }),
        }
        return callback(tx)
      })

      const result = await createList({
        title: 'My List',
        boardId: 'board-123',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('updateList', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateList({
        id: 'list-123',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para actualizar una lista',
      )
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await updateList({
        id: '',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('List ID is required')
    })

    it('returns error when list not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue(null)

      const result = await updateList({
        id: 'list-123',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Lista no encontrada')
    })

    it('returns error when user does not have board access', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue({
        id: 'list-123',
        boardId: 'board-123',
        board: { ownerId: 'other-user' },
      })
      mockHasUserBoardAccess.mockResolvedValue(false)

      const result = await updateList({
        id: 'list-123',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes permiso para actualizar esta lista')
    })

    it('updates list successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue({
        id: 'list-123',
        boardId: 'board-123',
        board: { ownerId: 'user-123' },
      })
      mockHasUserBoardAccess.mockResolvedValue(true)

      const mockList = { id: 'list-123', title: 'Updated' }
      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockList]),
          }),
        }),
      })

      const result = await updateList({
        id: 'list-123',
        title: 'Updated',
      })

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Updated')
    })
  })

  describe('deleteList', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await deleteList({
        id: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para eliminar una lista')
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await deleteList({
        id: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('List ID is required')
    })

    it('returns error when list not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue(null)

      const result = await deleteList({
        id: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Lista no encontrada')
    })

    it('returns error when user does not have board access', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue({
        id: 'list-123',
        boardId: 'board-123',
        board: { ownerId: 'other-user' },
      })
      mockHasUserBoardAccess.mockResolvedValue(false)

      const result = await deleteList({
        id: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes permiso para eliminar esta lista')
    })

    it('deletes list successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue({
        id: 'list-123',
        boardId: 'board-123',
        board: { ownerId: 'user-123' },
      })
      mockHasUserBoardAccess.mockResolvedValue(true)

      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await deleteList({
        id: 'list-123',
      })

      expect(result.success).toBe(true)
    })
  })
})
