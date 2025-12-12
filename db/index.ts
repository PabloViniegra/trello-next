import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as authSchema from '@/auth-schema'
import * as boardSchema from '@/db/schema'
import { env } from '@/lib/env'

export const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: true,
  },
  schema: { ...authSchema, ...boardSchema },
})
