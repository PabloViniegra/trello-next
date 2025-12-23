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
} = vi.hoisted(() => ({
  mockQuery: {
    card: {
      findFirst: vi.fn(),
    },
    list: {
      findFirst: vi.fn(),
    },
  },
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockSelect: vi.fn(),
  mockTransaction: vi.fn(),
  mockGetCurrentUser: vi.fn(),
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

// Mock errors
vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

// Import after mocking
import {
  createCard,
  deleteCard,
  moveCardAction,
  updateCard,
} from '@/lib/card/actions'

describe('Card Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await createCard({
        title: 'My Card',
        listId: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para crear una tarjeta')
    })

    it('returns error for invalid data - empty title', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createCard({
        title: '',
        listId: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El título es obligatorio')
    })

    it('returns error for invalid data - empty listId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createCard({
        title: 'My Card',
        listId: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de lista es obligatorio')
    })

    it('returns error when list not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue(null)

      const result = await createCard({
        title: 'My Card',
        listId: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Lista no encontrada')
    })

    it('returns error when user is not board owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue({
        id: 'list-123',
        board: { ownerId: 'other-user' },
      })

      const result = await createCard({
        title: 'My Card',
        listId: 'list-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'No tienes permiso para añadir tarjetas a esta lista',
      )
    })

    it('creates card successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.list.findFirst.mockResolvedValue({
        id: 'list-123',
        boardId: 'board-123',
        board: { ownerId: 'user-123' },
      })

      const mockCard = { id: 'card-123', title: 'My Card' }

      mockTransaction.mockImplementation(async (callback) => {
        const lockQueryMock = {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              for: vi.fn().mockResolvedValue([{ id: 'list-123' }]),
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
              returning: vi.fn().mockResolvedValue([mockCard]),
            }),
          }),
        }
        return callback(tx)
      })

      const result = await createCard({
        title: 'My Card',
        listId: 'list-123',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('updateCard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateCard({
        id: 'card-123',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para actualizar una tarjeta',
      )
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await updateCard({
        id: '',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de tarjeta es obligatorio')
    })

    it('returns error when card not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.card.findFirst.mockResolvedValue(null)

      const result = await updateCard({
        id: 'card-123',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Tarjeta no encontrada')
    })

    it('returns error when user is not board owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.card.findFirst.mockResolvedValue({
        id: 'card-123',
        list: { board: { ownerId: 'other-user' } },
      })

      const result = await updateCard({
        id: 'card-123',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'No tienes permiso para actualizar esta tarjeta',
      )
    })

    it('updates card successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.card.findFirst.mockResolvedValue({
        id: 'card-123',
        listId: 'list-123',
        list: { boardId: 'board-123', board: { ownerId: 'user-123' } },
      })

      const mockCard = { id: 'card-123', title: 'Updated' }
      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockCard]),
          }),
        }),
      })

      const result = await updateCard({
        id: 'card-123',
        title: 'Updated',
      })

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Updated')
    })
  })

  describe('deleteCard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await deleteCard({
        id: 'card-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para eliminar una tarjeta',
      )
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await deleteCard({
        id: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de tarjeta es obligatorio')
    })

    it('returns error when card not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.card.findFirst.mockResolvedValue(null)

      const result = await deleteCard({
        id: 'card-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Tarjeta no encontrada')
    })

    it('returns error when user is not board owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.card.findFirst.mockResolvedValue({
        id: 'card-123',
        list: { board: { ownerId: 'other-user' } },
      })

      const result = await deleteCard({
        id: 'card-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes permiso para eliminar esta tarjeta')
    })

    it('deletes card successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.card.findFirst.mockResolvedValue({
        id: 'card-123',
        list: { boardId: 'board-123', board: { ownerId: 'user-123' } },
      })

      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await deleteCard({
        id: 'card-123',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('moveCardAction', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await moveCardAction({
        cardId: 'card-123',
        targetListId: 'list-456',
        position: 0,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para mover una tarjeta')
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await moveCardAction({
        cardId: '',
        targetListId: 'list-456',
        position: 0,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de tarjeta es obligatorio')
    })

    it('returns error for negative position', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await moveCardAction({
        cardId: 'card-123',
        targetListId: 'list-456',
        position: -1,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('La posición debe ser un número no negativo')
    })
  })
})
