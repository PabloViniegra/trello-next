/**
 * Fix notification preferences for existing users
 */

import { eq } from 'drizzle-orm'
import { db } from './db'
import { userNotificationPreferences } from './db/schema'

async function fixPreferences() {
  try {
    console.log('🔧 Fixing notification preferences for existing users...')

    // Update all existing preferences to enable board updates notifications
    const result = await db
      .update(userNotificationPreferences)
      .set({ notifyBoardUpdates: 1 })
      .where(eq(userNotificationPreferences.notifyBoardUpdates, 0))

    console.log(`✅ Updated ${result.rowCount} user preferences`)

    // Verify the fix
    const updatedPrefs = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.notifyBoardUpdates, 1))

    console.log(
      `📊 Total users with board updates enabled: ${updatedPrefs.length}`,
    )
  } catch (error) {
    console.error('❌ Error fixing preferences:', error)
    process.exit(1)
  }
}

fixPreferences().then(() => {
  console.log('🎉 Preferences fixed successfully!')
  process.exit(0)
})
