import { describe, expect, it } from 'vitest'
import type { TUserDetails, TUserStats } from '@/lib/user/types'

describe('User Types', () => {
  describe('TUserStats', () => {
    it('accepts valid user stats object', () => {
      const stats: TUserStats = {
        totalBoardsOwned: 5,
        totalBoardsCollaborating: 3,
        totalCardsAssigned: 12,
      }

      expect(stats.totalBoardsOwned).toBe(5)
      expect(stats.totalBoardsCollaborating).toBe(3)
      expect(stats.totalCardsAssigned).toBe(12)
    })

    it('accepts zero values', () => {
      const stats: TUserStats = {
        totalBoardsOwned: 0,
        totalBoardsCollaborating: 0,
        totalCardsAssigned: 0,
      }

      expect(stats.totalBoardsOwned).toBe(0)
      expect(stats.totalBoardsCollaborating).toBe(0)
      expect(stats.totalCardsAssigned).toBe(0)
    })

    it('accepts large numbers', () => {
      const stats: TUserStats = {
        totalBoardsOwned: 999999,
        totalBoardsCollaborating: 888888,
        totalCardsAssigned: 777777,
      }

      expect(stats.totalBoardsOwned).toBe(999999)
      expect(stats.totalBoardsCollaborating).toBe(888888)
      expect(stats.totalCardsAssigned).toBe(777777)
    })
  })

  describe('TUserDetails', () => {
    it('accepts valid user details with all fields', () => {
      const details: TUserDetails = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: true,
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      expect(details.id).toBe('user-123')
      expect(details.name).toBe('Juan Pérez')
      expect(details.email).toBe('juan@example.com')
      expect(details.emailVerified).toBe(true)
      expect(details.image).toBe('https://example.com/avatar.jpg')
      expect(details.createdAt).toBeInstanceOf(Date)
      expect(details.updatedAt).toBeInstanceOf(Date)
    })

    it('accepts user details without image', () => {
      const details: TUserDetails = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      expect(details.image).toBeUndefined()
    })

    it('accepts user details with emailVerified false', () => {
      const details: TUserDetails = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      expect(details.emailVerified).toBe(false)
    })

    it('handles different date formats', () => {
      const now = new Date()
      const details: TUserDetails = {
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      }

      expect(details.createdAt).toBe(now)
      expect(details.updatedAt).toBe(now)
    })

    it('handles long names', () => {
      const details: TUserDetails = {
        id: 'user-123',
        name: 'María del Carmen Rodríguez García López',
        email: 'maria@example.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(details.name).toBe('María del Carmen Rodríguez García López')
    })

    it('handles different email formats', () => {
      const emails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@sub.example.com',
      ]

      for (const email of emails) {
        const details: TUserDetails = {
          id: 'user-123',
          name: 'Test User',
          email,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(details.email).toBe(email)
      }
    })
  })
})
