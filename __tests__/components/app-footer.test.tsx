import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AppFooter } from '@/components/app-footer'

describe('AppFooter', () => {
  describe('Rendering', () => {
    it('should render the footer with all main elements', () => {
      render(<AppFooter />)

      // Check for "Acerca de" link
      expect(screen.getByRole('link', { name: /acerca de/i })).toBeDefined()

      // Check for "Términos" button
      expect(screen.getByRole('button', { name: /términos/i })).toBeDefined()

      // Check for copyright with current year
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(`© ${currentYear}`)).toBeDefined()
      expect(screen.getByText('Trello Clone')).toBeDefined()

      // Check for GitHub link
      expect(screen.getByRole('link', { name: /github/i })).toBeDefined()
    })

    it('should render the copyright text', () => {
      render(<AppFooter />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(`© ${currentYear}`)).toBeDefined()
    })

    it('should have correct href for "Acerca de" link', () => {
      render(<AppFooter />)
      const link = screen.getByRole('link', { name: /acerca de/i })
      expect(link.getAttribute('href')).toBe('/about')
    })

    it('should have correct href for GitHub link', () => {
      render(<AppFooter />)
      const link = screen.getByRole('link', { name: /github/i })
      expect(link.getAttribute('href')).toBe(
        'https://github.com/PabloViniegra/trello-next',
      )
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    })
  })

  describe('Terms & Conditions Modal', () => {
    it('should not show terms modal by default', () => {
      render(<AppFooter />)
      expect(
        screen.queryByRole('heading', { name: /términos y condiciones/i }),
      ).toBeNull()
    })

    it('should open terms modal when button is clicked', async () => {
      const user = userEvent.setup()
      render(<AppFooter />)

      const button = screen.getByRole('button', { name: /términos/i })
      await user.click(button)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /términos y condiciones/i }),
        ).toBeDefined()
      })
    })

    it('should display terms content when modal is open', async () => {
      const user = userEvent.setup()
      render(<AppFooter />)

      const button = screen.getByRole('button', { name: /términos/i })
      await user.click(button)

      await waitFor(() => {
        // Check for some key sections (using headings to avoid duplicates)
        expect(screen.getByText('1. Aceptación de los Términos')).toBeDefined()
        expect(screen.getByText('2. Uso del Servicio')).toBeDefined()
        expect(screen.getByText('3. Contenido del Usuario')).toBeDefined()
        expect(screen.getByText('4. Privacidad')).toBeDefined()
      })
    })

    it('should show current year in modal description', async () => {
      const user = userEvent.setup()
      render(<AppFooter />)

      const button = screen.getByRole('button', { name: /términos/i })
      await user.click(button)

      const currentYear = new Date().getFullYear()
      await waitFor(() => {
        expect(
          screen.getByText(`Última actualización: ${currentYear}`),
        ).toBeDefined()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible GitHub link with aria-label', () => {
      render(<AppFooter />)
      const link = screen.getByRole('link', { name: /github/i })
      expect(link.getAttribute('aria-label')).toBe('GitHub')
    })

    it('should have semantic footer element', () => {
      const { container } = render(<AppFooter />)
      const footer = container.querySelector('footer')
      expect(footer).toBeDefined()
    })

    it('should have proper navigation landmark', () => {
      render(<AppFooter />)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeDefined()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile and desktop', () => {
      const { container } = render(<AppFooter />)
      const footer = container.querySelector('footer')

      // Check that footer exists and has proper structure
      expect(footer).toBeDefined()
      expect(footer?.querySelector('.flex-col')).toBeDefined()
      expect(footer?.querySelector('.sm\\:flex-row')).toBeDefined()
    })
  })
})
