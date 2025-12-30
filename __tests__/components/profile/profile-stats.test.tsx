import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileStats } from '@/app/profile/_components/profile-stats'
import type { TUserStats } from '@/lib/user/types'

describe('ProfileStats Component', () => {
  const mockStats: TUserStats = {
    totalBoardsOwned: 5,
    totalBoardsCollaborating: 3,
    totalCardsAssigned: 12,
  }

  it('renders all three stat cards', () => {
    render(<ProfileStats stats={mockStats} />)

    expect(screen.getByText('Tableros Creados')).toBeDefined()
    expect(screen.getByText('Colaboraciones')).toBeDefined()
    expect(screen.getByText('Tarjetas Asignadas')).toBeDefined()
  })

  it('displays correct stat values', () => {
    render(<ProfileStats stats={mockStats} />)

    expect(screen.getByText('5')).toBeDefined() // Boards owned
    expect(screen.getByText('3')).toBeDefined() // Collaborating
    expect(screen.getByText('12')).toBeDefined() // Cards assigned
  })

  it('displays correct descriptions', () => {
    render(<ProfileStats stats={mockStats} />)

    expect(
      screen.getByText('Tableros de los que eres propietario'),
    ).toBeDefined()
    expect(screen.getByText('Tableros donde colaboras')).toBeDefined()
    expect(screen.getByText('Tarjetas en las que trabajas')).toBeDefined()
  })

  it('renders icons for each stat card', () => {
    const { container } = render(<ProfileStats stats={mockStats} />)

    // Check that SVG icons are rendered (Lucide icons)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBe(3)
  })

  it('handles zero values correctly', () => {
    const zeroStats: TUserStats = {
      totalBoardsOwned: 0,
      totalBoardsCollaborating: 0,
      totalCardsAssigned: 0,
    }

    render(<ProfileStats stats={zeroStats} />)

    // Should render 0 for all stats
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBe(3)
  })

  it('handles large numbers correctly', () => {
    const largeStats: TUserStats = {
      totalBoardsOwned: 999,
      totalBoardsCollaborating: 50,
      totalCardsAssigned: 1234,
    }

    render(<ProfileStats stats={largeStats} />)

    expect(screen.getByText('999')).toBeDefined()
    expect(screen.getByText('50')).toBeDefined()
    expect(screen.getByText('1234')).toBeDefined()
  })

  it('renders in responsive grid layout', () => {
    const { container } = render(<ProfileStats stats={mockStats} />)

    const grid = container.querySelector('.grid.gap-4.md\\:grid-cols-3')
    expect(grid).toBeDefined()
  })

  it('renders stat values with correct styling', () => {
    const { container } = render(<ProfileStats stats={mockStats} />)

    const statValues = container.querySelectorAll('.text-2xl.font-bold')
    expect(statValues.length).toBe(3)
  })

  it('renders card titles with correct styling', () => {
    const { container } = render(<ProfileStats stats={mockStats} />)

    const titles = container.querySelectorAll('.text-sm.font-medium')
    expect(titles.length).toBe(3)
  })
})
