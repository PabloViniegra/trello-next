import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeDefined()
    expect(button.getAttribute('data-variant')).toBe('default')
    expect(button.getAttribute('data-size')).toBe('default')
  })

  it('renders with different variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
    ] as const

    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>Button</Button>)
      const button = container.querySelector('button')
      expect(button?.getAttribute('data-variant')).toBe(variant)
    }
  })

  it('renders with different sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const

    for (const size of sizes) {
      const { container } = render(<Button size={size}>Button</Button>)
      const button = container.querySelector('button')
      expect(button?.getAttribute('data-size')).toBe(size)
    }
  })

  it('applies custom className', () => {
    render(<Button className='custom-class'>Button</Button>)
    const button = screen.getByRole('button')
    expect(button.classList.contains('custom-class')).toBe(true)
  })

  it('passes additional props', () => {
    render(
      <Button type='submit' disabled>
        Button
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button.getAttribute('type')).toBe('submit')
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('renders as child component with asChild', () => {
    render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/test')
  })

  it('has data-slot attribute', () => {
    render(<Button>Button</Button>)
    const button = screen.getByRole('button')
    expect(button.getAttribute('data-slot')).toBe('button')
  })

  it('renders children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        Text
      </Button>,
    )
    expect(screen.getByText('Icon')).toBeDefined()
    expect(screen.getByText('Text')).toBeDefined()
  })
})
