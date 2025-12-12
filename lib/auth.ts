import type { User } from 'better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import * as schema from '@/auth-schema'
import { db } from '@/db'
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
  // En desarrollo, mostramos el enlace en la consola
  if (env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('EMAIL DE VERIFICACION')
    console.log('========================================')
    console.log(`Para: ${user.email}`)
    console.log(`Nombre: ${user.name}`)
    console.log(`\nEnlace de verificacion:`)
    console.log(url)
    console.log('========================================\n')
  } else {
    // TODO: Implementar envio real de emails en produccion
    // Puedes usar Resend, SendGrid, Nodemailer, etc.
    console.warn(
      `[PRODUCCION] Se necesita configurar el envio de emails para: ${user.email}`,
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
