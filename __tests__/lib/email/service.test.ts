import { beforeEach, describe, expect, it, vi } from 'vitest'

// Use vi.hoisted to define mock functions before they're used in vi.mock
const { mockSend, mockRender, mockVerificationEmail } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  mockRender: vi.fn(),
  mockVerificationEmail: vi.fn(),
}))

// Mock Resend
vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      }
    },
  }
})

// Mock React Email render
vi.mock('@react-email/components', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@react-email/components')>()
  return {
    ...actual,
    render: mockRender,
  }
})

// Mock the email template
vi.mock('@/emails/templates/verification-email', () => ({
  default: mockVerificationEmail,
}))

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    RESEND_API_KEY: 'test-api-key',
    RESEND_FROM: 'test@example.com',
  },
}))

// Import after mocks
import { sendVerificationEmail } from '@/lib/email/service'

describe('Email Service', () => {
  describe('sendVerificationEmail', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      mockVerificationEmail.mockReturnValue({
        type: 'div',
        props: { children: 'Test email' },
      })
      mockRender.mockResolvedValue('<html>Test email</html>')
      mockSend.mockResolvedValue({ error: null })
    })

    it('should send verification email successfully', async () => {
      const result = await sendVerificationEmail({
        to: 'user@example.com',
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=abc123',
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle email sending errors', async () => {
      mockSend.mockResolvedValueOnce({
        error: { message: 'Failed to send email' },
      })

      const result = await sendVerificationEmail({
        to: 'user@example.com',
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=abc123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Error al enviar el email de verificación')
    })

    it('should include correct email parameters', async () => {
      await sendVerificationEmail({
        to: 'user@example.com',
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=abc123',
      })

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Verifica tu cuenta de Trello Clone',
        html: '<html>Test email</html>',
      })
    })

    it('should call the verification email template with correct props', async () => {
      await sendVerificationEmail({
        to: 'user@example.com',
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=abc123',
      })

      expect(mockVerificationEmail).toHaveBeenCalledWith({
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=abc123',
      })
    })

    it('should reject invalid email addresses', async () => {
      const result = await sendVerificationEmail({
        to: 'invalid-email',
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=abc123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Dirección de email inválida')
      expect(mockSend).not.toHaveBeenCalled()
    })
  })
})
