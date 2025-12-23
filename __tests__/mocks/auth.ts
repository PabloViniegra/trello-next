import { vi } from 'vitest'

/**
 * Mock user for authenticated tests
 */
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
}

/**
 * Mock getCurrentUser function
 */
export const mockGetCurrentUser = vi.fn()

/**
 * Setup auth mock to return authenticated user
 */
export function setupAuthenticatedUser() {
  mockGetCurrentUser.mockResolvedValue(mockUser)
}

/**
 * Setup auth mock to return no user (unauthenticated)
 */
export function setupUnauthenticatedUser() {
  mockGetCurrentUser.mockResolvedValue(null)
}

/**
 * Mock module for @/lib/auth/get-user
 */
vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUser: mockGetCurrentUser,
}))
