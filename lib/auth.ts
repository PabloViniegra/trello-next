import type { User } from 'better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import * as schema from '@/auth-schema'
import { db } from '@/db'
import { sendVerificationEmail as sendEmail } from '@/lib/email/service'
import { env } from '@/lib/env'

type TSendVerificationEmailParams = {
  user: User
  url: string
  token: string
}

async function sendVerificationEmail({
  user,
  url,
}: TSendVerificationEmailParams): Promise<void> {
  // In development, also log the link to console for easy access
  if (env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('EMAIL DE VERIFICACION')
    console.log('========================================')
    console.log(`Para: ${user.email}`)
    console.log(`Nombre: ${user.name}`)
    console.log(`\nEnlace de verificacion:`)
    console.log(url)
    console.log('========================================\n')
  }

  // Send the email using Resend (only in production or if credentials are properly configured)
  // In development, the console log above is sufficient for testing
  if (
    env.NODE_ENV === 'production' ||
    env.RESEND_FROM !== 'Trello Clone <onboarding@resend.dev>'
  ) {
    const result = await sendEmail({
      to: user.email,
      name: user.name || 'Usuario',
      verificationUrl: url,
    })

    if (!result.success) {
      console.error('Error al enviar email de verificación:', result.error)
      // In production, we might want to log this to an external service
      // or retry the email sending
    }
  } else {
    console.log('⚠️  Email no enviado (usando credenciales de prueba de Resend)')
    console.log(
      '   En producción, configura RESEND_FROM con un dominio verificado',
    )
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [nextCookies()], // Required for Server Actions to set cookies properly
})
