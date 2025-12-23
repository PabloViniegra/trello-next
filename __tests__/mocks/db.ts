import { vi } from 'vitest'

/**
 * Mock database for testing server actions.
 * Provides mocked query and mutation methods.
 */
export const mockDb = {
  query: {
    board: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    list: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    card: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    label: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    cardLabel: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => []),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(() => Promise.resolve()),
  })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        for: vi.fn(() => []),
      })),
    })),
  })),
  transaction: vi.fn((callback) => callback(mockDb)),
}

/**
 * Mock function to setup db mock in tests
 */
export function setupDbMock() {
  vi.mock('@/db', () => ({
    db: mockDb,
  }))
}

/**
 * Reset all mocks
 */
export function resetDbMocks() {
  Object.values(mockDb.query).forEach((entity) => {
    Object.values(entity).forEach((fn) => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        ;(fn as ReturnType<typeof vi.fn>).mockReset()
      }
    })
  })
  mockDb.insert.mockClear()
  mockDb.update.mockClear()
  mockDb.delete.mockClear()
  mockDb.select.mockClear()
  mockDb.transaction.mockClear()
}
