import { render } from '@react-email/components'
import { Resend } from 'resend'
import { z } from 'zod'
import VerificationEmail from '@/emails/templates/verification-email'
import { env } from '@/lib/env'
import { logError } from '@/lib/errors'

// Lazy initialization of Resend client
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resend = new Resend(env.RESEND_API_KEY)
  }
  return resend
}

// Email validation schema
const emailSchema = z.string().email()

type TSendVerificationEmailParams = {
  to: string
  name: string
  verificationUrl: string
}

type TEmailResult = {
  success: boolean
  error?: string
}

/**
 * Sends a verification email to the user using Resend and React Email templates
 * @param params - Email parameters including recipient, name, and verification URL
 * @returns Result object with success status and optional error message
 */
export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: TSendVerificationEmailParams): Promise<TEmailResult> {
  try {
    // Validate email format
    const validEmail = emailSchema.safeParse(to)
    if (!validEmail.success) {
      return {
        success: false,
        error: 'Dirección de email inválida',
      }
    }

    // Validate RESEND_FROM environment variable
    if (!env.RESEND_FROM) {
      throw new Error('RESEND_FROM is not configured')
    }

    // Render the email template to HTML
    const emailHtml = await render(
      VerificationEmail({
        name,
        verificationUrl,
      }),
    )

    // Send the email using Resend
    const client = getResendClient()
    const { error } = await client.emails.send({
      from: env.RESEND_FROM,
      to,
      subject: 'Verifica tu cuenta de Trello Clone',
      html: emailHtml,
    })

    if (error) {
      logError(error, 'sendVerificationEmail')
      return {
        success: false,
        error: 'Error al enviar el email de verificación',
      }
    }

    return { success: true }
  } catch (error) {
    logError(error, 'sendVerificationEmail')
    return {
      success: false,
      error: 'Error al enviar el email de verificación',
    }
  }
}
