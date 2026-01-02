import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCard } from '@/lib/card/actions'
import { generateCardWithAI } from '@/lib/card/ai'

// Mock dependencies
vi.mock('ai', () => ({
  generateText: vi.fn(),
}))

vi.mock('@/lib/card/actions', () => ({
  createCard: vi.fn(),
}))

vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/board-member/queries', () => ({
  hasUserBoardAccess: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    query: {
      list: {
        findFirst: vi.fn(),
      },
    },
  },
}))

vi.mock('@/lib/env', () => ({
  env: {
    GROQ_API_KEY: 'test-api-key',
  },
}))

vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

// Get mocked functions
const { generateText } = await import('ai')
const { getCurrentUser } = await import('@/lib/auth/get-user')
const { hasUserBoardAccess } = await import('@/lib/board-member/queries')
const { db } = await import('@/db')
const mockedGenerateText = vi.mocked(generateText)
const mockedCreateCard = vi.mocked(createCard)
const mockedGetCurrentUser = vi.mocked(getCurrentUser)
const mockedHasUserBoardAccess = vi.mocked(hasUserBoardAccess)
const mockedDb = vi.mocked(db)

describe('generateCardWithAI', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks for successful authentication and authorization
    mockedGetCurrentUser.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: undefined,
    })

    vi.mocked(mockedDb.query.list.findFirst).mockResolvedValue({
      id: 'list-123',
      title: 'Test List',
      position: 0,
      boardId: 'board-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      board: {
        id: 'board-123',
        title: 'Test Board',
        ownerId: 'user-123',
        isPrivate: 'private',
        description: undefined,
        backgroundColor: undefined,
        backgroundImage: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never)

    mockedHasUserBoardAccess.mockResolvedValue(true)
  })

  it('should reject unauthenticated users', async () => {
    mockedGetCurrentUser.mockResolvedValue(null)

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'Debes iniciar sesión para generar tarjetas con IA',
    )
    expect(mockedGenerateText).not.toHaveBeenCalled()
  })

  it('should validate input data and reject invalid prompt', async () => {
    const result = await generateCardWithAI({
      prompt: '',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('El prompt es obligatorio')
    expect(mockedGenerateText).not.toHaveBeenCalled()
  })

  it('should validate input data and reject missing listId', async () => {
    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: '',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('El ID de lista es obligatorio')
    expect(mockedGenerateText).not.toHaveBeenCalled()
  })

  it('should reject prompt that is too long', async () => {
    const longPrompt = 'a'.repeat(501)

    const result = await generateCardWithAI({
      prompt: longPrompt,
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('El prompt debe tener menos de 500 caracteres')
    expect(mockedGenerateText).not.toHaveBeenCalled()
  })

  it('should successfully generate a card with AI', async () => {
    const aiResponse = {
      title: 'Revisar código del proyecto',
      description: 'Revisar el código frontend del proyecto antes del viernes',
      dueDate: '2024-12-25',
    }

    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify(aiResponse),
    } as never)

    mockedCreateCard.mockResolvedValue({
      success: true,
      data: {
        id: 'card-123',
        title: aiResponse.title,
      },
    })

    const result = await generateCardWithAI({
      prompt: 'Crear una tarea para revisar el código del proyecto',
      listId: 'list-123',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      id: 'card-123',
      title: 'Revisar código del proyecto',
    })

    expect(mockedGenerateText).toHaveBeenCalledTimes(1)
    expect(mockedCreateCard).toHaveBeenCalledWith({
      title: aiResponse.title,
      description: aiResponse.description,
      listId: 'list-123',
      dueDate: new Date('2024-12-25'),
    })
  })

  it('should handle AI response without description and dueDate', async () => {
    const aiResponse = {
      title: 'Simple task',
    }

    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify(aiResponse),
    } as never)

    mockedCreateCard.mockResolvedValue({
      success: true,
      data: {
        id: 'card-456',
        title: aiResponse.title,
      },
    })

    const result = await generateCardWithAI({
      prompt: 'Create a simple task',
      listId: 'list-123',
    })

    expect(result.success).toBe(true)
    expect(mockedCreateCard).toHaveBeenCalledWith({
      title: 'Simple task',
      description: undefined,
      listId: 'list-123',
      dueDate: undefined,
    })
  })

  it('should handle invalid JSON from AI response', async () => {
    mockedGenerateText.mockResolvedValue({
      text: 'This is not valid JSON',
    } as never)

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'La IA generó una respuesta inválida. Por favor, intenta de nuevo.',
    )
    expect(mockedCreateCard).not.toHaveBeenCalled()
  })

  it('should handle AI response wrapped in markdown code blocks', async () => {
    const aiResponse = {
      title: 'Task with markdown wrapper',
      description: 'Description',
    }

    mockedGenerateText.mockResolvedValue({
      text: `\`\`\`json\n${JSON.stringify(aiResponse)}\n\`\`\``,
    } as never)

    mockedCreateCard.mockResolvedValue({
      success: true,
      data: {
        id: 'card-789',
        title: aiResponse.title,
      },
    })

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(true)
    expect(mockedCreateCard).toHaveBeenCalledWith({
      title: aiResponse.title,
      description: aiResponse.description,
      listId: 'list-123',
      dueDate: undefined,
    })
  })

  it('should handle invalid date format from AI', async () => {
    const aiResponse = {
      title: 'Task with invalid date',
      description: 'Description',
      dueDate: 'invalid-date',
    }

    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify(aiResponse),
    } as never)

    mockedCreateCard.mockResolvedValue({
      success: true,
      data: {
        id: 'card-999',
        title: aiResponse.title,
      },
    })

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(true)
    // Should ignore invalid date and pass undefined
    expect(mockedCreateCard).toHaveBeenCalledWith({
      title: aiResponse.title,
      description: aiResponse.description,
      listId: 'list-123',
      dueDate: undefined,
    })
  })

  it('should propagate errors from createCard', async () => {
    const aiResponse = {
      title: 'Task title',
    }

    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify(aiResponse),
    } as never)

    mockedCreateCard.mockResolvedValue({
      success: false,
      error: 'No tienes permiso para añadir tarjetas a esta lista',
    })

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'No tienes permiso para añadir tarjetas a esta lista',
    )
  })

  it('should handle AI generation errors', async () => {
    mockedGenerateText.mockRejectedValue(new Error('AI service error'))

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'Error al generar la tarjeta con IA. Por favor, intenta de nuevo.',
    )
    expect(mockedCreateCard).not.toHaveBeenCalled()
  })

  it('should handle schema validation errors from AI response', async () => {
    const invalidAiResponse = {
      // Missing required 'title' field
      description: 'Description only',
    }

    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify(invalidAiResponse),
    } as never)

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'La IA generó una respuesta inválida. Por favor, intenta de nuevo.',
    )
    expect(mockedCreateCard).not.toHaveBeenCalled()
  })

  it('should handle title that exceeds max length from AI', async () => {
    const aiResponse = {
      title: 'a'.repeat(256), // Exceeds 255 char limit
    }

    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify(aiResponse),
    } as never)

    const result = await generateCardWithAI({
      prompt: 'Create a task',
      listId: 'list-123',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'La IA generó una respuesta inválida. Por favor, intenta de nuevo.',
    )
    expect(mockedCreateCard).not.toHaveBeenCalled()
  })
})
