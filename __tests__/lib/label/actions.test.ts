import { beforeEach, describe, expect, it, vi } from 'vitest'

// Use vi.hoisted to define mock functions before they're used in vi.mock
const {
  mockQuery,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockTransaction,
  mockGetCurrentUser,
} = vi.hoisted(() => ({
  mockQuery: {
    label: {
      findFirst: vi.fn(),
    },
    board: {
      findFirst: vi.fn(),
    },
    card: {
      findFirst: vi.fn(),
    },
    cardLabel: {
      findFirst: vi.fn(),
    },
  },
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
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
  assignLabelToCard,
  createLabel,
  deleteLabel,
  removeLabelFromCard,
  updateLabel,
} from '@/lib/label/actions'

describe('Label Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createLabel', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await createLabel({
        boardId: 'board-123',
        color: '#FF0000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para crear una etiqueta')
    })

    it('returns error for invalid data - empty boardId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createLabel({
        boardId: '',
        color: '#FF0000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID del tablero es obligatorio')
    })

    it('returns error for invalid color format', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await createLabel({
        boardId: 'board-123',
        color: 'invalid',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Formato de color hex inválido (#RRGGBB)')
    })

    it('returns error when board not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.board.findFirst.mockResolvedValue(null)

      const result = await createLabel({
        boardId: 'board-123',
        color: '#FF0000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Tablero no encontrado')
    })

    it('returns error when user is not board owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.board.findFirst.mockResolvedValue({
        id: 'board-123',
        ownerId: 'other-user',
      })

      const result = await createLabel({
        boardId: 'board-123',
        color: '#FF0000',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Solo el propietario del tablero puede crear etiquetas',
      )
    })

    it('creates label successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.board.findFirst.mockResolvedValue({
        id: 'board-123',
        ownerId: 'user-123',
      })

      const mockLabel = { id: 'label-123', color: '#FF0000', name: 'Bug' }
      mockInsert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockLabel]),
        }),
      })

      const result = await createLabel({
        boardId: 'board-123',
        color: '#FF0000',
        name: 'Bug',
      })

      expect(result.success).toBe(true)
      expect(result.data?.color).toBe('#FF0000')
    })
  })

  describe('updateLabel', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await updateLabel({
        id: 'label-123',
        name: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para actualizar una etiqueta',
      )
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await updateLabel({
        id: '',
        name: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de la etiqueta es obligatorio')
    })

    it('returns error when label not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.label.findFirst.mockResolvedValue(null)

      const result = await updateLabel({
        id: 'label-123',
        name: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Etiqueta no encontrada')
    })

    it('returns error when user is not board owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.label.findFirst.mockResolvedValue({
        id: 'label-123',
        board: { ownerId: 'other-user' },
      })

      const result = await updateLabel({
        id: 'label-123',
        name: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Solo el propietario del tablero puede editar etiquetas',
      )
    })

    it('updates label successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.label.findFirst.mockResolvedValue({
        id: 'label-123',
        boardId: 'board-123',
        board: { ownerId: 'user-123' },
      })

      const mockLabel = { id: 'label-123', name: 'Updated', color: '#FF0000' }
      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockLabel]),
          }),
        }),
      })

      const result = await updateLabel({
        id: 'label-123',
        name: 'Updated',
      })

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Updated')
    })
  })

  describe('deleteLabel', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await deleteLabel({
        id: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para eliminar una etiqueta',
      )
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await deleteLabel({
        id: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de la etiqueta es obligatorio')
    })

    it('returns error when label not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.label.findFirst.mockResolvedValue(null)

      const result = await deleteLabel({
        id: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Etiqueta no encontrada')
    })

    it('returns error when user is not board owner', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.label.findFirst.mockResolvedValue({
        id: 'label-123',
        board: { ownerId: 'other-user' },
      })

      const result = await deleteLabel({
        id: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Solo el propietario del tablero puede eliminar etiquetas',
      )
    })

    it('deletes label successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.label.findFirst.mockResolvedValue({
        id: 'label-123',
        boardId: 'board-123',
        board: { ownerId: 'user-123' },
      })

      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await deleteLabel({
        id: 'label-123',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('assignLabelToCard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await assignLabelToCard({
        cardId: 'card-123',
        labelId: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Debes iniciar sesión para asignar una etiqueta',
      )
    })

    it('returns error for invalid data - empty cardId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await assignLabelToCard({
        cardId: '',
        labelId: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de la tarjeta es obligatorio')
    })

    it('returns error for invalid data - empty labelId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await assignLabelToCard({
        cardId: 'card-123',
        labelId: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de la etiqueta es obligatorio')
    })
  })

  describe('removeLabelFromCard', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const result = await removeLabelFromCard({
        cardId: 'card-123',
        labelId: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Debes iniciar sesión para quitar una etiqueta')
    })

    it('returns error for invalid data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-123' })

      const result = await removeLabelFromCard({
        cardId: '',
        labelId: 'label-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('El ID de la tarjeta es obligatorio')
    })
  })
})
