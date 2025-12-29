import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

async function main() {
  console.log('[DEPLOY] Iniciando migración de base de datos de producción...')

  const productionDbUrl =
    process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL

  if (!productionDbUrl) {
    throw new Error(
      '[ERROR] DATABASE_URL_PRODUCTION o DATABASE_URL no está definida',
    )
  }

  console.log('[DEPLOY] Conectando a la base de datos...')
  console.log(`[INFO] Host: ${new URL(productionDbUrl).host}`)

  const pool = new Pool({ connectionString: productionDbUrl })
  const db = drizzle(pool)

  console.log('[DEPLOY] Aplicando migraciones...')
  await migrate(db, { migrationsFolder: './drizzle' })

  await pool.end()
  console.log('[SUCCESS] Migraciones aplicadas exitosamente')
  console.log('[INFO] Verifica las tablas en Neon Dashboard')
}

main().catch((err) => {
  console.error('[ERROR] Error durante la migración:', err)
  process.exit(1)
})
