import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutPage, { metadata } from '@/app/about/page'

// Mock Navbar component
vi.mock('@/components/navbar', () => ({
  Navbar: () => <nav data-testid='navbar'>Navbar</nav>,
}))

describe('About Page', () => {
  it('renders the page with correct structure', () => {
    render(<AboutPage />)

    // Verify navbar is rendered
    expect(screen.getByTestId('navbar')).toBeDefined()

    // Verify main content is rendered
    const main = screen.getByRole('main')
    expect(main).toBeDefined()
  })

  it('renders the hero section with version badge', () => {
    render(<AboutPage />)

    // Verify version badge
    const badge = screen.getByText('v1.0.0')
    expect(badge).toBeDefined()
    expect(badge.getAttribute('aria-label')).toBe('Versión 1.0.0')
  })

  it('renders the main heading', () => {
    render(<AboutPage />)

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Acerca de Trello Clone',
    })
    expect(heading).toBeDefined()
  })

  it('renders hero description', () => {
    render(<AboutPage />)

    const description = screen.getByText(/aplicación moderna de gestión/)
    expect(description).toBeDefined()
  })

  it('renders navigation buttons in hero section', () => {
    render(<AboutPage />)

    // Verify "Ir a Tableros" link
    const boardsLink = screen.getByRole('link', { name: /Ir a Tableros/ })
    expect(boardsLink).toBeDefined()
    expect(boardsLink.getAttribute('href')).toBe('/boards')

    // Verify GitHub link with accessibility label
    const githubLink = screen.getByRole('link', {
      name: /Ver en GitHub \(se abre en nueva pestaña\)/,
    })
    expect(githubLink).toBeDefined()
    expect(githubLink.getAttribute('target')).toBe('_blank')
    expect(githubLink.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders features section with correct heading', () => {
    render(<AboutPage />)

    const featuresHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Características Principales',
    })
    expect(featuresHeading).toBeDefined()
  })

  it('renders all four features', () => {
    render(<AboutPage />)

    // Verify feature titles
    expect(screen.getByText('Gestión de Tareas')).toBeDefined()
    expect(screen.getByText('Colaboración en Equipo')).toBeDefined()
    expect(screen.getByText('Rápido y Eficiente')).toBeDefined()
    expect(screen.getByText('Seguro y Confiable')).toBeDefined()
  })

  it('renders feature descriptions', () => {
    render(<AboutPage />)

    // Verify at least one feature description
    expect(
      screen.getByText(/Organiza tus proyectos con tableros Kanban/),
    ).toBeDefined()
    expect(
      screen.getByText(/Trabaja con tu equipo en tiempo real/),
    ).toBeDefined()
  })

  it('renders tech stack section', () => {
    render(<AboutPage />)

    const techHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Stack Tecnológico',
    })
    expect(techHeading).toBeDefined()

    // Verify some key technologies
    expect(screen.getByText('Next.js 16')).toBeDefined()
    expect(screen.getByText('TypeScript')).toBeDefined()
    expect(screen.getByText('PostgreSQL')).toBeDefined()
    expect(screen.getByText('Drizzle ORM')).toBeDefined()
  })

  it('renders tech stack descriptions', () => {
    render(<AboutPage />)

    expect(screen.getByText('Framework React con App Router')).toBeDefined()
    expect(screen.getByText('Tipado estático')).toBeDefined()
  })

  it('renders project info section', () => {
    render(<AboutPage />)

    // CardTitle doesn't render as a heading, just verify the text exists
    expect(screen.getByText('Proyecto Open Source')).toBeDefined()

    // Verify project description
    expect(
      screen.getByText(/Este proyecto está disponible en GitHub/),
    ).toBeDefined()
  })

  it('renders external links with accessibility attributes', () => {
    render(<AboutPage />)

    // Verify "Reportar un problema" link
    const issuesLink = screen.getByRole('link', {
      name: /Reportar un problema \(se abre en nueva pestaña\)/,
    })
    expect(issuesLink).toBeDefined()
    expect(issuesLink.getAttribute('target')).toBe('_blank')
    expect(issuesLink.getAttribute('rel')).toBe('noopener noreferrer')

    // Verify "Ver Licencia" link
    const licenseLink = screen.getByRole('link', {
      name: /Ver Licencia \(se abre en nueva pestaña\)/,
    })
    expect(licenseLink).toBeDefined()
    expect(licenseLink.getAttribute('target')).toBe('_blank')
    expect(licenseLink.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('has proper semantic HTML structure', () => {
    const { container } = render(<AboutPage />)

    // Verify main element exists
    const main = container.querySelector('main')
    expect(main).toBeDefined()

    // Verify sections exist
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThanOrEqual(3) // Hero, Features, Tech Stack, Project Info
  })

  it('icons have aria-hidden attribute', () => {
    const { container } = render(<AboutPage />)

    // Check that SVG icons have aria-hidden
    const icons = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThan(0)
  })

  describe('Metadata', () => {
    it('has correct title', () => {
      expect(metadata.title).toBe('Acerca de')
    })

    it('has correct description', () => {
      expect(metadata.description).toContain('Trello Clone')
      expect(metadata.description).toContain('gestión de proyectos')
    })

    it('has OpenGraph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBe('Acerca de - Trello Clone')
      expect(metadata.openGraph?.images).toEqual(['/og-image.png'])
    })

    it('has Twitter metadata', () => {
      expect(metadata.twitter).toBeDefined()
      if (metadata.twitter && typeof metadata.twitter !== 'string') {
        expect(metadata.twitter.title).toBe('Acerca de - Trello Clone')
        expect(metadata.twitter.images).toEqual(['/og-image.png'])
      }
    })

    it('has canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('/about')
    })
  })
})
