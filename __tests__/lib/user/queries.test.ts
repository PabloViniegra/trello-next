import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Mock database BEFORE importing the module
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

// Mock Drizzle functions
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    count: vi.fn(() => ({ count: 'count_value' })),
    eq: vi.fn((field, value) => ({ field, value, type: 'eq' })),
    and: vi.fn((...conditions) => ({ conditions, type: 'and' })),
    sql: vi.fn((strings, ...values) => ({ strings, values, type: 'sql' })),
  }
})

// Mock schema tables
vi.mock('@/auth-schema', () => ({
  user: { 
    id: 'user.id', 
    name: 'user.name', 
    email: 'user.email', 
    emailVerified: 'user.emailVerified', 
    image: 'user.image', 
    createdAt: 'user.createdAt', 
    updatedAt: 'user.updatedAt' 
  },
  session: { 
    userId: 'session.userId', 
    expiresAt: 'session.expiresAt' 
  },
}))

vi.mock('@/db/schema', () => ({
  board: { ownerId: 'board.ownerId' },
  cardMember: { userId: 'cardMember.userId' },
  boardMember: { userId: 'boardMember.userId' },
}))

// Import after mocks
import { getUserStats, getUserDetails, getUserActiveSessions } from '@/lib/user/queries'
import { db } from '@/db'

const mockDb = db as unknown as {
  select: ReturnType<typeof vi.fn>
}

describe('User Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserStats', () => {
    it('returns user statistics successfully', async () => {
      // Mock successful database responses
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserStats('user-123')

      expect(result).toEqual({
        totalBoardsOwned: 5,
        totalBoardsCollaborating: 5,
        totalCardsAssigned: 5,
      })
    })

    it('returns zero stats when user has no activity', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserStats('user-123')

      expect(result).toEqual({
        totalBoardsOwned: 0,
        totalBoardsCollaborating: 0,
        totalCardsAssigned: 0,
      })
    })

    it('handles database errors gracefully', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error('Database error')),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getUserStats('user-123')

      expect(result).toEqual({
        totalBoardsOwned: 0,
        totalBoardsCollaborating: 0,
        totalCardsAssigned: 0,
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting user stats:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('handles empty result arrays', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserStats('user-123')

      expect(result).toEqual({
        totalBoardsOwned: 0,
        totalBoardsCollaborating: 0,
        totalCardsAssigned: 0,
      })
    })
  })

  describe('getUserDetails', () => {
    it('returns user details successfully', async () => {
      const mockUserData = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: true,
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUserData]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserDetails('user-123')

      expect(result).toEqual({
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: true,
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      })
    })

    it('returns undefined image when not provided', async () => {
      const mockUserData = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: false,
        image: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUserData]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserDetails('user-123')

      expect(result).toEqual({
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: false,
        image: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      })
    })

    it('returns null when user not found', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserDetails('non-existent-user')

      expect(result).toBeNull()
    })

    it('handles database errors gracefully', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Database error')),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getUserDetails('user-123')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting user details:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('getUserActiveSessions', () => {
    it('returns active sessions count successfully', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserActiveSessions('user-123')

      expect(result).toBe(3)
    })

    it('returns zero when user has no active sessions', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserActiveSessions('user-123')

      expect(result).toBe(0)
    })

    it('handles empty result arrays', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const result = await getUserActiveSessions('user-123')

      expect(result).toBe(0)
    })

    it('handles database errors gracefully', async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error('Database error')),
      }

      mockDb.select.mockReturnValue(mockSelectChain)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getUserActiveSessions('user-123')

      expect(result).toBe(0)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting active sessions:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
