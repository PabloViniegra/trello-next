/**
 * Test notification system end-to-end
 */

import { db } from './db'
import { logActivity } from './lib/activity/logger'
import { getNotificationsAction } from './lib/notification/actions'
import { getUserPreferences } from './lib/notification/queries'
import { logger } from './lib/utils/logger'

async function testNotificationSystem() {
  try {
    console.log('🧪 Testing complete notification system...\n')

    // 1. Check user preferences
    console.log('1️⃣ Checking user preferences...')
    const userId = 'HuCYIy6vyRAxD5EtMCJOg8DaDQZhmYZa'
    const prefs = await getUserPreferences(userId)
    console.log(`   notifyBoardUpdates: ${prefs.notifyBoardUpdates}`)
    console.log(`   digestFrequency: ${prefs.digestFrequency}\n`)

    // 2. Log a test activity
    console.log('2️⃣ Logging test activity...')
    const testBoardId = 'e3db2979-3449-4ff3-a223-7af3f3ec04eb'
    await logActivity({
      userId: 'test-user-id',
      actionType: 'member.added',
      entityType: 'member',
      entityId: 'test-member-id',
      boardId: testBoardId,
      metadata: {
        memberId: userId,
        boardTitle: 'Test Board',
        memberName: 'Test User',
        memberEmail: 'test@example.com',
        role: 'member',
      },
    })
    console.log('   Activity logged\n')

    // 3. Check if notification was created
    console.log('3️⃣ Checking notification creation...')
    await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay

    const notifications = await db.execute(`
      SELECT * FROM notification
      WHERE user_id = '${userId}' AND notification_type = 'member.added'
      ORDER BY created_at DESC LIMIT 1
    `)

    if (notifications.rows.length > 0) {
      const notification = notifications.rows[0]
      console.log('   ✅ Notification created!')
      console.log(`   Title: "${notification.title}"`)
      console.log(`   Message: "${notification.message}"`)
      console.log(`   Type: ${notification.notification_type}`)
      console.log(`   Is Read: ${notification.is_read}`)
      console.log(`   Priority: ${notification.priority}`)
    } else {
      console.log('   ❌ No notification found')
    }

    console.log('\n🎉 Test completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testNotificationSystem().then(() => process.exit(0))
