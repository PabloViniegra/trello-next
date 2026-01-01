import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NAV_LINKS, NavLinks } from '@/components/nav-links'

// Mock usePathname from next/navigation
const mockPathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

describe('NavLinks Component', () => {
  it('renders navigation with correct aria-label', () => {
    mockPathname.mockReturnValue('/boards')
    render(<NavLinks />)

    const nav = screen.getByRole('navigation', {
      name: 'Navegación principal',
    })
    expect(nav).toBeDefined()
  })

  it('renders all navigation links', () => {
    mockPathname.mockReturnValue('/')
    render(<NavLinks />)

    // Verify all links are rendered
    expect(screen.getByRole('link', { name: /Tableros/ })).toBeDefined()
    expect(screen.getByRole('link', { name: /Acerca de/ })).toBeDefined()
  })

  it('renders links with correct hrefs', () => {
    mockPathname.mockReturnValue('/')
    render(<NavLinks />)

    const boardsLink = screen.getByRole('link', { name: /Tableros/ })
    const aboutLink = screen.getByRole('link', { name: /Acerca de/ })

    expect(boardsLink.getAttribute('href')).toBe('/boards')
    expect(aboutLink.getAttribute('href')).toBe('/about')
  })

  it('marks active link when on exact path', () => {
    mockPathname.mockReturnValue('/boards')
    render(<NavLinks />)

    const boardsLink = screen.getByRole('link', { name: /Tableros/ })

    // Verify active link has aria-current="page" attribute
    expect(boardsLink.getAttribute('aria-current')).toBe('page')
  })

  it('marks active link when on nested path', () => {
    mockPathname.mockReturnValue('/boards/123')
    render(<NavLinks />)

    // Should mark /boards as active even when on /boards/123
    const boardsLink = screen.getByRole('link', { name: /Tableros/ })
    expect(boardsLink.getAttribute('aria-current')).toBe('page')
  })

  it('does not mark link as active when on different path', () => {
    mockPathname.mockReturnValue('/boards')
    render(<NavLinks />)

    // About link should not be active (no aria-current attribute)
    const aboutLink = screen.getByRole('link', { name: /Acerca de/ })
    expect(aboutLink.getAttribute('aria-current')).toBeNull()
  })

  it('applies correct classes to active link', () => {
    mockPathname.mockReturnValue('/about')
    render(<NavLinks />)

    const aboutLink = screen.getByRole('link', { name: /Acerca de/ })
    expect(aboutLink.classList.contains('text-foreground')).toBe(true)
  })

  it('applies correct classes to inactive link', () => {
    mockPathname.mockReturnValue('/about')
    render(<NavLinks />)

    const boardsLink = screen.getByRole('link', { name: /Tableros/ })
    expect(boardsLink.classList.contains('text-muted-foreground')).toBe(true)
  })

  it('has transition classes for smooth animations', () => {
    mockPathname.mockReturnValue('/')
    render(<NavLinks />)

    const link = screen.getByRole('link', { name: /Tableros/ })
    expect(link.classList.contains('transition-all')).toBe(true)
    expect(link.classList.contains('duration-200')).toBe(true)
  })

  it('NAV_LINKS constant is exported and has correct structure', () => {
    expect(NAV_LINKS).toBeDefined()
    expect(Array.isArray(NAV_LINKS)).toBe(true)
    expect(NAV_LINKS.length).toBeGreaterThan(0)

    // Verify structure of each link
    for (const link of NAV_LINKS) {
      expect(link).toHaveProperty('href')
      expect(link).toHaveProperty('label')
      expect(typeof link.href).toBe('string')
      expect(typeof link.label).toBe('string')
    }
  })

  it('NAV_LINKS includes /boards link', () => {
    const boardsLink = NAV_LINKS.find((link) => link.href === '/boards')
    expect(boardsLink).toBeDefined()
    expect(boardsLink?.label).toBe('Tableros')
  })

  it('NAV_LINKS includes /about link', () => {
    const aboutLink = NAV_LINKS.find((link) => link.href === '/about')
    expect(aboutLink).toBeDefined()
    expect(aboutLink?.label).toBe('Acerca de')
  })

  it('renders with correct font styles', () => {
    mockPathname.mockReturnValue('/')
    render(<NavLinks />)

    const link = screen.getByRole('link', { name: /Tableros/ })
    expect(link.classList.contains('font-mono')).toBe(true)
    expect(link.classList.contains('font-medium')).toBe(true)
  })
})
