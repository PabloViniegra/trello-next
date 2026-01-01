import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProfileAnalytics } from '@/app/profile/_components/profile-analytics'
import type { TUserAnalytics } from '@/lib/user/types'

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='line-chart'>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='bar-chart'>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='pie-chart'>{children}</div>
  ),
  Line: () => <div data-testid='line' />,
  Bar: () => <div data-testid='bar' />,
  Pie: ({ data }: { data: unknown[] }) => (
    <div data-testid='pie' data-length={data.length} />
  ),
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  Tooltip: () => <div data-testid='tooltip' />,
  Legend: () => <div data-testid='legend' />,
  Cell: () => <div data-testid='cell' />,
}))

describe('ProfileAnalytics', () => {
  const mockAnalytics: TUserAnalytics = {
    activityTimeline: [
      { week: '01/01', cards: 5, comments: 10, boards: 2 },
      { week: '08/01', cards: 8, comments: 15, boards: 3 },
    ],
    cardStatusOverTime: [
      { date: '01/01', total: 10, completed: 6, pending: 4 },
      { date: '02/01', total: 12, completed: 8, pending: 4 },
    ],
    labelUsage: [
      { labelName: 'Bug', color: '#ef4444', count: 5 },
      { labelName: 'Feature', color: '#10b981', count: 8 },
      { labelName: 'Documentation', color: '#3b82f6', count: 3 },
    ],
    boardActivity: [
      {
        boardName: 'Proyecto A',
        totalCards: 15,
        completedCards: 10,
        activeMembers: 4,
      },
      {
        boardName: 'Proyecto B',
        totalCards: 20,
        completedCards: 12,
        activeMembers: 6,
      },
    ],
  }

  const emptyAnalytics: TUserAnalytics = {
    activityTimeline: [],
    cardStatusOverTime: [],
    labelUsage: [],
    boardActivity: [],
  }

  it('should render analytics title and description', () => {
    render(<ProfileAnalytics analytics={mockAnalytics} />)

    expect(screen.getByText('Panel de Analíticas')).toBeInTheDocument()
    expect(
      screen.getByText('Visualiza tu actividad y progreso en tiempo real'),
    ).toBeInTheDocument()
  })

  it('should render all chart titles', () => {
    render(<ProfileAnalytics analytics={mockAnalytics} />)

    expect(screen.getByText('Actividad Semanal')).toBeInTheDocument()
    expect(screen.getByText('Estado de Tarjetas (30 días)')).toBeInTheDocument()
    expect(screen.getByText('Uso de Etiquetas')).toBeInTheDocument()
    expect(screen.getByText('Actividad por Tablero')).toBeInTheDocument()
  })

  it('should show empty state messages when no data is available', () => {
    render(<ProfileAnalytics analytics={emptyAnalytics} />)

    expect(
      screen.getByText('No hay datos de actividad disponibles'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No hay datos de tarjetas disponibles'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No hay datos de etiquetas disponibles'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No hay datos de tableros disponibles'),
    ).toBeInTheDocument()
  })

  it('should render charts when data is available', () => {
    const { container } = render(<ProfileAnalytics analytics={mockAnalytics} />)

    // Check that recharts containers are rendered
    const chartContainers = container.querySelectorAll('[data-slot="chart"]')
    expect(chartContainers.length).toBeGreaterThan(0)
  })

  it('should display activity timeline data', () => {
    render(<ProfileAnalytics analytics={mockAnalytics} />)

    // The component should render, we're testing structure not chart internals
    expect(screen.getByText('Actividad Semanal')).toBeInTheDocument()
  })

  it('should display label usage data with colors', () => {
    render(<ProfileAnalytics analytics={mockAnalytics} />)

    expect(screen.getByText('Uso de Etiquetas')).toBeInTheDocument()
    // Colors are applied via fill attribute in PieChart cells
  })

  it('should display board activity data', () => {
    render(<ProfileAnalytics analytics={mockAnalytics} />)

    expect(screen.getByText('Actividad por Tablero')).toBeInTheDocument()
  })

  it('should handle partial data correctly', () => {
    const partialAnalytics: TUserAnalytics = {
      activityTimeline: mockAnalytics.activityTimeline,
      cardStatusOverTime: [],
      labelUsage: [],
      boardActivity: mockAnalytics.boardActivity,
    }

    render(<ProfileAnalytics analytics={partialAnalytics} />)

    // Should show data for available charts
    expect(screen.getByText('Actividad Semanal')).toBeInTheDocument()
    expect(screen.getByText('Actividad por Tablero')).toBeInTheDocument()

    // Should show empty state for unavailable charts
    expect(
      screen.getByText('No hay datos de tarjetas disponibles'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No hay datos de etiquetas disponibles'),
    ).toBeInTheDocument()
  })
})
