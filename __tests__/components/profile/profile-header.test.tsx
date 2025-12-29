import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileHeader } from '@/app/profile/_components/profile-header'
import type { TUser } from '@/lib/auth/types'

describe('ProfileHeader Component', () => {
  const mockUser: TUser = {
    id: 'user-123',
    name: 'Juan Pérez García',
    email: 'juan.perez@example.com',
    image: 'https://example.com/avatar.jpg',
  }

  it('renders user name and email correctly', () => {
    render(<ProfileHeader user={mockUser} />)

    expect(screen.getByText('Juan Pérez García')).toBeDefined()
    expect(screen.getByText('juan.perez@example.com')).toBeDefined()
  })

  it('renders user name as h2 heading', () => {
    render(<ProfileHeader user={mockUser} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeDefined()
    expect(heading.textContent).toBe('Juan Pérez García')
  })

  it('renders avatar with image when provided', () => {
    const { container } = render(<ProfileHeader user={mockUser} />)

    // Check that avatar image element exists
    const avatarImage = container.querySelector('[data-slot="avatar-image"]')
    expect(avatarImage).toBeDefined()
  })

  it('renders initials when no image provided', () => {
    const userWithoutImage: TUser = {
      id: 'user-123',
      name: 'Juan Pérez',
      email: 'juan@example.com',
    }

    render(<ProfileHeader user={userWithoutImage} />)

    // Avatar fallback should show initials
    expect(screen.getByText('JP')).toBeDefined()
  })

  it('handles single name correctly', () => {
    const userWithSingleName: TUser = {
      id: 'user-123',
      name: 'Juan',
      email: 'juan@example.com',
    }

    render(<ProfileHeader user={userWithSingleName} />)

    expect(screen.getByText('Juan')).toBeDefined()
    expect(screen.getByText('J')).toBeDefined() // Initial
  })

  it('handles long names with correct initials', () => {
    const userWithLongName: TUser = {
      id: 'user-123',
      name: 'María del Carmen Rodríguez López',
      email: 'maria@example.com',
    }

    render(<ProfileHeader user={userWithLongName} />)

    // Should show only first two initials
    expect(screen.getByText('MD')).toBeDefined()
  })

  it('renders within a card container', () => {
    const { container } = render(<ProfileHeader user={mockUser} />)

    const card = container.querySelector('.rounded-lg.border.bg-card')
    expect(card).toBeDefined()
  })

  it('displays user information in correct layout', () => {
    const { container } = render(<ProfileHeader user={mockUser} />)

    // Check flex layout structure
    const flexContainer = container.querySelector('.flex.items-start.gap-6')
    expect(flexContainer).toBeDefined()
  })
})
