import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDefined()
    expect(input.getAttribute('data-slot')).toBe('input')
  })

  it('renders with type text by default', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('type')).toBeNull() // type text doesn't show in role textbox
  })

  it('renders with different types', () => {
    const { container } = render(<Input type='email' />)
    const input = container.querySelector('input')
    expect(input?.getAttribute('type')).toBe('email')
  })

  it('renders with password type', () => {
    const { container } = render(<Input type='password' />)
    const input = container.querySelector('input')
    expect(input?.getAttribute('type')).toBe('password')
  })

  it('applies custom className', () => {
    render(<Input className='custom-class' />)
    const input = screen.getByRole('textbox')
    expect(input.classList.contains('custom-class')).toBe(true)
  })

  it('passes placeholder prop', () => {
    render(<Input placeholder='Enter text' />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeDefined()
  })

  it('passes value prop', () => {
    render(<Input value='test value' readOnly />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('test value')
  })

  it('passes disabled prop', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input.hasAttribute('disabled')).toBe(true)
  })

  it('passes required prop', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')
    expect(input.hasAttribute('required')).toBe(true)
  })

  it('passes name prop', () => {
    render(<Input name='username' />)
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('name')).toBe('username')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox') as HTMLInputElement

    await user.type(input, 'Hello World')
    expect(input.value).toBe('Hello World')
  })

  it('renders with aria-invalid for error state', () => {
    render(<Input aria-invalid='true' />)
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('renders with id prop', () => {
    const testId = 'my-input'
    render(<Input id={testId} />)
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('id')).toBe(testId)
  })
})
