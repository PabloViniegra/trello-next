import { z } from 'zod'

const envSchema = z
  .object({
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    BETTER_AUTH_URL: z
      .string()
      .url('BETTER_AUTH_URL must be a valid URL')
      .optional(),
    NEXT_PUBLIC_BETTER_AUTH_URL: z
      .string()
      .url('NEXT_PUBLIC_BETTER_AUTH_URL must be a valid URL')
      .optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .refine((data) => data.BETTER_AUTH_URL || data.NEXT_PUBLIC_BETTER_AUTH_URL, {
    message:
      'Either BETTER_AUTH_URL or NEXT_PUBLIC_BETTER_AUTH_URL must be set',
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
  )
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
