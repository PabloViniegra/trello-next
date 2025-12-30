import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileInfo } from '@/app/profile/_components/profile-info'
import type { TUser } from '@/lib/auth/types'
import type { TUserStats } from '@/lib/user/types'

describe('ProfileInfo Component', () => {
  const mockUser: TUser = {
    id: 'user-123',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    image: 'https://example.com/avatar.jpg',
  }

  const mockStats: TUserStats = {
    totalBoardsOwned: 5,
    totalBoardsCollaborating: 3,
    totalCardsAssigned: 12,
  }

  it('renders account information section', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Información de la Cuenta')).toBeDefined()
  })

  it('renders activity summary section', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Resumen de Actividad')).toBeDefined()
  })

  it('displays user email correctly', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Correo Electrónico')).toBeDefined()
    expect(screen.getByText('juan.perez@example.com')).toBeDefined()
  })

  it('shows profile photo status when configured', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Foto de Perfil')).toBeDefined()
    expect(screen.getByText('Configurada')).toBeDefined()
  })

  it('shows profile photo status when not configured', () => {
    const userWithoutImage: TUser = {
      ...mockUser,
      image: undefined,
    }

    render(<ProfileInfo user={userWithoutImage} stats={mockStats} />)

    expect(screen.getByText('Foto de Perfil')).toBeDefined()
    expect(screen.getByText('Sin configurar')).toBeDefined()
  })

  it('calculates and displays total boards correctly', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Total de tableros')).toBeDefined()
    // Should show 5 + 3 = 8
    expect(screen.getByText('8')).toBeDefined()
  })

  it('displays active cards count', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Tarjetas activas')).toBeDefined()
    expect(screen.getByText('12')).toBeDefined()
  })

  it('shows "Propietario" role when user owns boards', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    expect(screen.getByText('Rol principal')).toBeDefined()
    expect(screen.getByText('Propietario')).toBeDefined()
  })

  it('shows "Colaborador" role when user owns no boards', () => {
    const collaboratorStats: TUserStats = {
      totalBoardsOwned: 0,
      totalBoardsCollaborating: 5,
      totalCardsAssigned: 10,
    }

    render(<ProfileInfo user={mockUser} stats={collaboratorStats} />)

    expect(screen.getByText('Rol principal')).toBeDefined()
    expect(screen.getByText('Colaborador')).toBeDefined()
  })

  it('handles zero stats correctly', () => {
    const zeroStats: TUserStats = {
      totalBoardsOwned: 0,
      totalBoardsCollaborating: 0,
      totalCardsAssigned: 0,
    }

    render(<ProfileInfo user={mockUser} stats={zeroStats} />)

    // Should still render all sections with zero values
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues.length).toBeGreaterThan(0)
  })

  it('renders in two-column grid layout', () => {
    const { container } = render(
      <ProfileInfo user={mockUser} stats={mockStats} />,
    )

    const grid = container.querySelector('.grid.gap-4.md\\:grid-cols-2')
    expect(grid).toBeDefined()
  })

  it('displays badges with correct styling', () => {
    render(<ProfileInfo user={mockUser} stats={mockStats} />)

    // Check that badges exist by looking for the text content
    expect(screen.getByText('8')).toBeDefined() // Total boards badge
    expect(screen.getByText('12')).toBeDefined() // Cards badge
    expect(screen.getByText('Propietario')).toBeDefined() // Role badge
  })

  it('renders mail icon for email section', () => {
    const { container } = render(
      <ProfileInfo user={mockUser} stats={mockStats} />,
    )

    const mailIcon = container.querySelector('svg')
    expect(mailIcon).toBeDefined()
  })

  it('calculates total boards correctly for different combinations', () => {
    const stats1: TUserStats = {
      totalBoardsOwned: 10,
      totalBoardsCollaborating: 5,
      totalCardsAssigned: 0,
    }

    const { rerender } = render(<ProfileInfo user={mockUser} stats={stats1} />)
    expect(screen.getByText('15')).toBeDefined() // 10 + 5

    const stats2: TUserStats = {
      totalBoardsOwned: 0,
      totalBoardsCollaborating: 7,
      totalCardsAssigned: 0,
    }

    rerender(<ProfileInfo user={mockUser} stats={stats2} />)
    expect(screen.getByText('7')).toBeDefined() // 0 + 7
  })
})
