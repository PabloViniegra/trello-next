/**
 * Manual migration script to apply notification metadata jsonb conversion
 */

import { sql } from 'drizzle-orm'
import { db } from './db'

async function applyMigration() {
  try {
    console.log('Applying migration 0007_workable_unicorn...')

    // Check current column type
    const result = await db.execute(sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notification' 
      AND column_name = 'metadata'
    `)

    console.log('Current metadata type:', result.rows[0])

    if (result.rows[0]?.data_type === 'text') {
      console.log('Converting metadata from text to jsonb...')

      // Step 1: Drop default
      console.log('Step 1: Dropping default value...')
      await db.execute(sql`
        ALTER TABLE "notification" 
        ALTER COLUMN "metadata" 
        DROP DEFAULT
      `)

      // Step 2: Convert type
      console.log('Step 2: Converting to jsonb...')
      await db.execute(sql`
        ALTER TABLE "notification" 
        ALTER COLUMN "metadata" 
        SET DATA TYPE jsonb 
        USING metadata::jsonb
      `)

      // Step 3: Set new default
      console.log('Step 3: Setting new default...')
      await db.execute(sql`
        ALTER TABLE "notification" 
        ALTER COLUMN "metadata" 
        SET DEFAULT '{}'::jsonb
      `)

      console.log('✅ Migration applied successfully!')
    } else {
      console.log('⚠️  Metadata column is already jsonb, skipping migration')
    }

    // Verify the change
    const verification = await db.execute(sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notification' 
      AND column_name = 'metadata'
    `)

    console.log('New metadata type:', verification.rows[0])
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
