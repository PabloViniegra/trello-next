# Notification System Integration

## Overview

The notification system is now integrated with the activity logging system. When activities are logged, notifications are automatically created for relevant users based on business rules.

## How It Works

### 1. Activity Logging Triggers Notifications

When `logActivity()` or `logActivities()` is called, the system:
1. Creates an activity log entry in the database
2. Calls `createNotificationFromActivity()` to determine who should be notified
3. Creates notifications for each recipient based on their preferences

### 2. Notification Business Rules

The system uses `determineNotificationRecipients()` to decide who gets notified:

#### ✅ Currently Implemented

**Member Added to Board**
- **Trigger**: `actionType === 'member.added'`
- **Recipient**: The newly added member (`metadata.memberId`)
- **Notification Type**: `member.added`
- **Priority**: Normal
- **Required Metadata**:
  - `memberId` (string) - ID of user being added
  - `boardTitle` (string) - Title of the board
- **Example**:
  ```typescript
  await logActivity({
    userId: currentUser.id,
    actionType: ACTIVITY_TYPES.MEMBER_ADDED,
    entityType: ENTITY_TYPES.MEMBER,
    entityId: newMember.id,
    boardId: boardId,
    metadata: {
      memberId: userId,           // Required for notification
      boardTitle: 'My Board',     // Required for notification
      memberName: 'John Doe',
      memberEmail: 'john@example.com',
      role: 'member',
    },
  })
  ```

#### ⏳ Planned (Future Implementation)

**Card Assigned to User**
- **Trigger**: `actionType === 'card.updated'` AND `metadata.assignedUserId` exists
- **Recipient**: The assigned user
- **Notification Type**: `card.assigned`
- **Priority**: High
- **Required Metadata**:
  - `assignedUserId` (string) - ID of user being assigned
  - `cardId` (string) - ID of the card
  - `cardTitle` (string) - Title of the card
- **Note**: Requires adding `assignedUserId` field to card schema

**Card Due Soon**
- **Trigger**: Cron job checks for cards due in next 24 hours
- **Recipient**: Card assignee (when implemented)
- **Notification Type**: `card.due_soon`
- **Priority**: High

**Card Overdue**
- **Trigger**: Cron job checks for cards past due date
- **Recipient**: Card assignee (when implemented)
- **Notification Type**: `card.overdue`
- **Priority**: Urgent

**Card Moved** (for watchers)
- **Trigger**: `actionType === 'card.moved'`
- **Recipient**: Users watching the card
- **Notification Type**: `card.moved`
- **Priority**: Low
- **Note**: Requires implementing card watchers feature

**Label Assigned** (for watchers)
- **Trigger**: Label assigned to card
- **Recipient**: Users watching the card
- **Notification Type**: `label.assigned`
- **Priority**: Low
- **Note**: Requires implementing card watchers feature

**Mentions in Comments**
- **Trigger**: Comment created with @mention
- **Recipient**: Mentioned users
- **Notification Type**: TBD
- **Priority**: Normal
- **Note**: Requires implementing comments feature

### 3. User Preference Checks

Before creating a notification:
1. System checks `shouldNotifyUser(userId, notificationType)`
2. User preferences are auto-created with defaults if they don't exist
3. If user has disabled that notification type, no notification is created

**Default Preferences** (auto-created):
- `card.assigned`: ✅ Enabled
- `card.due_soon`: ✅ Enabled
- `card.overdue`: ✅ Enabled
- `member.added`: ✅ Enabled
- `board.shared`: ✅ Enabled
- `card.moved`: ❌ Disabled
- `label.assigned`: ❌ Disabled

### 4. Spam Prevention

The system prevents duplicate notifications:
- **Time Window**: 5 minutes
- **Logic**: If a notification of the same type was sent to the same user within the last 5 minutes, the new notification is silently skipped
- **Implemented in**: `checkDuplicateNotification()`

### 5. Notification Metadata

Each notification stores:
```typescript
{
  userId: string           // Recipient
  activityId: string       // Link to activity log
  title: string           // Spanish title
  message: string         // Spanish message
  notificationType: string // e.g., 'member.added'
  metadata: {             // Context data
    boardId?: string
    cardId?: string
    boardTitle?: string
    cardTitle?: string
    // ... other context
  }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isRead: 0 | 1
  readAt: Date | null
  createdAt: Date
}
```

## Integration Points

### Modified Files

**lib/activity/logger.ts**
- ✅ Imports `createNotificationFromActivity`
- ✅ `logActivity()` now calls notification service after creating activity
- ✅ `logActivities()` now calls notification service for each activity in batch

**lib/board-member/actions.ts**
- ✅ `addBoardMember()` now includes `memberId` and `boardTitle` in metadata
- ✅ Fetches board title before logging activity for notification context

### Notification Service Files

**lib/notification/service.ts**
- `createNotification()` - Validates, checks preferences, prevents spam, creates notification
- `createNotificationFromActivity()` - Determines recipients and creates notifications
- `determineNotificationRecipients()` - Business rules for who gets notified
- `checkDuplicateNotification()` - Spam prevention (5min window)

**lib/notification/queries.ts**
- `shouldNotifyUser()` - Checks user preferences
- `getUserPreferences()` - Auto-creates defaults if needed
- `getUnreadNotifications()` - Fetch with pagination
- `getNotificationCount()` - Unread count

**lib/notification/actions.ts** (Server Actions for UI)
- `getNotificationsAction()` - Fetch user notifications
- `markAsReadAction()` - Mark single as read
- `markAllAsReadAction()` - Mark all as read
- `deleteNotificationAction()` - Delete notification
- `getPreferencesAction()` - Get user preferences
- `updatePreferencesAction()` - Update preferences

## Testing the Integration

### Manual Test Steps

1. **Apply database migration**:
   ```bash
   pnpm drizzle-kit push
   ```

2. **Test Member Added Notification**:
   - Login as user A (board owner)
   - Create a board
   - Add user B as a member
   - Check database:
     ```sql
     SELECT * FROM notification WHERE user_id = '<user-b-id>' ORDER BY created_at DESC LIMIT 1;
     SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 1;
     ```
   - Verify notification was created with:
     - `notification_type = 'member.added'`
     - `title = 'Te agregaron a un tablero'`
     - `message` contains board title
     - `activity_id` links to the activity log
     - `is_read = 0`

3. **Test User Preferences**:
   - Call `getPreferencesAction()` as user B
   - Verify default preferences were created
   - Update preferences to disable `member.added`
   - Add user B to another board
   - Verify no notification was created (preference check)

4. **Test Duplicate Prevention**:
   - Add user C to a board
   - Immediately try adding them again (should fail at DB level)
   - Verify only one notification exists

### Automated Tests (TODO)

Create tests in `__tests__/lib/notification/`:
- `integration.test.ts` - Test full flow from activity to notification
- `spam-prevention.test.ts` - Test duplicate detection
- `preferences.test.ts` - Test preference checking

## Next Steps

### Phase 5: UI Components (Next)
- [ ] NotificationBell component (navbar badge with unread count)
- [ ] NotificationDropdown component (list of recent notifications)
- [ ] NotificationList component (full list with pagination)
- [ ] NotificationSettings component (preference management)

### Phase 6: Real-time Updates
- [ ] SSE endpoint for live notifications
- [ ] `useNotifications` hook with SSE subscription
- [ ] Toast notifications for instant notifications
- [ ] Notification sound (optional)

### Future Features
- [ ] Add `assignedUserId` to card schema
- [ ] Implement card assignment notifications
- [ ] Add cron jobs for due date notifications
- [ ] Implement card watchers feature
- [ ] Implement comments with @mentions
- [ ] Email digest for `hourly`/`daily`/`weekly` preferences
- [ ] Notification templates system
- [ ] Bulk notification management
- [ ] Notification history/archive

## Error Handling

All notification operations are non-blocking:
- If notification creation fails, activity logging still succeeds
- Errors are logged but don't throw exceptions
- User experience is never interrupted by notification failures

## Performance Considerations

- ✅ Database indexes on `user_id` + `is_read` for fast queries
- ✅ Database index on `created_at` for timeline queries
- ✅ Spam prevention reduces unnecessary DB writes
- ✅ Batch operations use `Promise.all()` for parallel execution
- ⚠️ Future: Consider queue system for high-volume notifications
- ⚠️ Future: Consider notification aggregation (e.g., "5 cards were updated")

## Cache Invalidation

Notifications use cache tags for revalidation:
- Tag: `notifications:${userId}` - Invalidated on create/update/delete
- Tag: `notification-count:${userId}` - Invalidated on read status change

## Security

- ✅ All Server Actions check authentication
- ✅ Users can only access their own notifications
- ✅ Users can only update their own preferences
- ✅ Zod validation on all inputs
- ✅ No SQL injection risk (using Drizzle ORM)
