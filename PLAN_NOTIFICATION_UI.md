# Phase 5: Notification UI Components - Implementation Plan

## Overview
Build React components to display and manage notifications in the user interface.

## Goals
- ✅ Display unread notification count in navbar
- ✅ Show notification dropdown with recent notifications
- ✅ Mark notifications as read (single and bulk)
- ✅ Delete notifications
- ✅ Navigate to related entities from notifications
- ✅ User preference management page/dialog

## Components to Build

### 5.1: NotificationBell Component ⏳

**Location**: `app/_components/notification-bell.tsx`

**Responsibilities**:
- Display bell icon in navbar
- Show unread count badge
- Toggle notification dropdown on click
- Poll for new notifications (or use SSE in Phase 6)

**Props**:
```typescript
// No props - uses global user session
```

**State**:
```typescript
{
  isOpen: boolean           // Dropdown open state
  unreadCount: number       // Badge count
  notifications: TNotification[]  // Recent notifications
  isLoading: boolean
}
```

**Features**:
- ✅ Badge with unread count (max display: 9+)
- ✅ Red dot indicator when unread > 0
- ✅ Click to toggle dropdown
- ✅ Close dropdown on outside click
- ✅ Keyboard accessible (Escape to close)

**Server Actions Used**:
- `getNotificationsAction({ limit: 10 })` - Fetch recent
- `getNotificationCount()` - Get unread count

**UI Design**:
```
┌─────────────┐
│  🔔  [3]    │  ← Bell icon with badge
└─────────────┘
       ↓ (click)
┌──────────────────────────────────┐
│  Notificaciones         [3] 🔕   │  ← Header with mark all read
├──────────────────────────────────┤
│  • Te agregaron a "Project X"    │  ← Unread (bold)
│    hace 5 minutos                │
├──────────────────────────────────┤
│    Te asignaron "Task 123"       │  ← Read (normal)
│    hace 1 hora                   │
├──────────────────────────────────┤
│  [Ver todas] [Configuración]     │  ← Footer actions
└──────────────────────────────────┘
```

---

### 5.2: NotificationDropdown Component ⏳

**Location**: `app/_components/notification-dropdown.tsx`

**Responsibilities**:
- Render list of recent notifications
- Mark individual notifications as read on click
- Navigate to related entities (boards, cards)
- Link to full notification list and settings

**Props**:
```typescript
{
  notifications: TNotification[]
  onClose: () => void
  onMarkAllRead: () => Promise<void>
}
```

**Features**:
- ✅ Display up to 10 recent notifications
- ✅ Visual distinction between read/unread
- ✅ Click notification → mark as read + navigate
- ✅ "Mark all as read" button
- ✅ "View all" link to full page
- ✅ "Settings" link to preferences
- ✅ Empty state message
- ✅ Loading skeleton

**Notification Item Structure**:
```typescript
<div className={cn("p-3", isRead ? "opacity-60" : "bg-blue-50")}>
  <div className="flex gap-2">
    {!isRead && <Badge>•</Badge>}
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">{timeAgo}</p>
    </div>
  </div>
</div>
```

**Server Actions Used**:
- `markAsReadAction(id)` - On notification click
- `markAllAsReadAction()` - On "mark all read"

---

### 5.3: NotificationList Page Component ⏳

**Location**: `app/notifications/page.tsx`

**Responsibilities**:
- Full-page notification list with pagination
- Filter by read/unread status
- Search notifications (future)
- Bulk actions (mark as read, delete)

**Features**:
- ✅ Server-side rendering with pagination
- ✅ Filter tabs: All | Unread | Read
- ✅ Infinite scroll or pagination
- ✅ Select multiple notifications
- ✅ Bulk mark as read
- ✅ Bulk delete (with confirmation)
- ✅ Empty states for each filter
- ✅ Loading states

**UI Design**:
```
┌────────────────────────────────────────┐
│  Notificaciones                        │
├────────────────────────────────────────┤
│  [Todas] [No leídas (3)] [Leídas]     │  ← Filter tabs
├────────────────────────────────────────┤
│  ☑ Seleccionar todas                   │  ← Bulk actions
│  [Marcar como leídas] [Eliminar]       │
├────────────────────────────────────────┤
│  ☐ • Te agregaron a "Project X"        │  ← Unread
│      hace 5 minutos                    │
│      [Marcar leída] [Eliminar]         │
├────────────────────────────────────────┤
│  ☐   Te asignaron "Task 123"           │  ← Read
│      hace 1 hora                       │
│      [Eliminar]                        │
├────────────────────────────────────────┤
│  [← Anterior] [Siguiente →]            │  ← Pagination
└────────────────────────────────────────┘
```

**Server Actions Used**:
- `getNotificationsAction({ page, limit, filter })` - Fetch with filters
- `markAsReadAction(id)` - Single mark as read
- `markAllAsReadAction()` - Bulk mark as read
- `deleteNotificationAction(id)` - Single delete
- Future: `deleteManyNotificationsAction(ids[])` - Bulk delete

---

### 5.4: NotificationSettings Component ⏳

**Location**: `app/settings/notifications/page.tsx`

**Responsibilities**:
- Display user notification preferences
- Toggle notification types on/off
- Update digest frequency (future)
- Save preferences to database

**Features**:
- ✅ List all notification types with descriptions
- ✅ Toggle switches for each type
- ✅ Save button with loading state
- ✅ Success/error toast feedback
- ✅ Reset to defaults button (with confirmation)
- ✅ Grouped by category (Cards, Boards, Activity)

**UI Design**:
```
┌────────────────────────────────────────┐
│  Configuración de Notificaciones       │
├────────────────────────────────────────┤
│  Tarjetas                              │
│  ──────────────────────────────────    │
│  ☑ Asignación de tarjetas              │
│     Recibir notificación cuando...     │
│                                        │
│  ☑ Tarjetas próximas a vencer          │
│     Notificar 24h antes...             │
│                                        │
│  ☑ Tarjetas vencidas                   │
│     Notificar cuando una tarjeta...    │
├────────────────────────────────────────┤
│  Tableros                              │
│  ──────────────────────────────────    │
│  ☑ Agregado a tablero                  │
│     Cuando te agregan como...          │
│                                        │
│  ☐ Actividad en tablero                │
│     Todas las actualizaciones...       │
├────────────────────────────────────────┤
│  [Guardar cambios] [Restablecer]       │
└────────────────────────────────────────┘
```

**Server Actions Used**:
- `getPreferencesAction()` - Load current preferences
- `updatePreferencesAction(preferences)` - Save changes

---

## Implementation Order

### Step 1: NotificationBell (Core UI) 🎯
1. Create `app/_components/notification-bell.tsx`
2. Add to navbar in `app/_components/navbar.tsx`
3. Implement unread count badge
4. Test with mock data

### Step 2: NotificationDropdown 🎯
1. Create `app/_components/notification-dropdown.tsx`
2. Integrate with NotificationBell
3. Add mark as read functionality
4. Add navigation to entities

### Step 3: NotificationList Page 🎯
1. Create `app/notifications/page.tsx`
2. Implement pagination
3. Add filter tabs
4. Add bulk actions

### Step 4: NotificationSettings 🎯
1. Create `app/settings/notifications/page.tsx`
2. Load preferences on mount
3. Implement toggle switches
4. Add save functionality

### Step 5: Integration & Polish 🎯
1. Add notification bell to navbar
2. Style consistency check
3. Accessibility audit
4. Mobile responsive check
5. Error boundary testing

---

## Shared Utilities

### Time Formatting Helper
**Location**: `lib/notification/formatters.ts`

```typescript
export function formatNotificationTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (days < 7) return `hace ${days} día${days > 1 ? 's' : ''}`
  
  return date.toLocaleDateString('es-ES')
}
```

### Notification Icon Helper
**Location**: `lib/notification/icons.ts`

```typescript
import { Bell, UserPlus, Calendar, AlertCircle, Tag, Move } from 'lucide-react'

export function getNotificationIcon(type: string) {
  const icons = {
    'member.added': UserPlus,
    'card.assigned': Bell,
    'card.due_soon': Calendar,
    'card.overdue': AlertCircle,
    'label.assigned': Tag,
    'card.moved': Move,
    'board.shared': UserPlus,
  }
  return icons[type] || Bell
}

export function getNotificationColor(type: string) {
  const colors = {
    'member.added': 'text-blue-500',
    'card.assigned': 'text-purple-500',
    'card.due_soon': 'text-yellow-500',
    'card.overdue': 'text-red-500',
    'label.assigned': 'text-green-500',
    'card.moved': 'text-gray-500',
    'board.shared': 'text-blue-500',
  }
  return colors[type] || 'text-gray-500'
}
```

### Navigation Helper
**Location**: `lib/notification/navigation.ts`

```typescript
export function getNotificationLink(notification: TNotification): string | null {
  const { notificationType, metadata } = notification
  
  switch (notificationType) {
    case 'member.added':
    case 'board.shared':
      return metadata.boardId ? `/boards/${metadata.boardId}` : null
    
    case 'card.assigned':
    case 'card.due_soon':
    case 'card.overdue':
    case 'card.moved':
    case 'label.assigned':
      return metadata.boardId && metadata.cardId
        ? `/boards/${metadata.boardId}?card=${metadata.cardId}`
        : null
    
    default:
      return null
  }
}
```

---

## Styling Guidelines

### Colors
- Unread background: `bg-blue-50 dark:bg-blue-950`
- Unread text: `font-semibold text-foreground`
- Read text: `text-muted-foreground opacity-75`
- Badge: `bg-red-500 text-white`
- Icons: Type-specific colors (see helper above)

### Typography
- Title: `font-medium text-sm`
- Message: `text-sm text-muted-foreground`
- Time: `text-xs text-muted-foreground`

### Spacing
- Dropdown width: `w-96`
- Max height: `max-h-[500px] overflow-y-auto`
- Item padding: `p-3`
- Gap between items: `gap-2`

### Animations
- Dropdown enter: `animate-in fade-in-0 slide-in-from-top-2`
- Dropdown exit: `animate-out fade-out-0 slide-out-to-top-2`
- Badge pulse: `animate-pulse` (when new notification arrives)

---

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader announcements for new notifications
- ✅ ARIA labels on all interactive elements
- ✅ Focus management (trap focus in dropdown)
- ✅ Color contrast meets WCAG AA
- ✅ Semantic HTML (button, nav, section)

---

## Performance Considerations

- ✅ Debounce notification fetching
- ✅ Optimistic UI updates (mark as read immediately)
- ✅ Cache notification count in localStorage
- ✅ Virtual scrolling for large notification lists (future)
- ✅ Lazy load notification list page
- ✅ Prefetch notification data on bell hover

---

## Error Handling

- Network errors: Show retry button
- Empty state: "No tienes notificaciones"
- Loading state: Skeleton components
- Failed actions: Toast error message + revert optimistic update
- Session expired: Redirect to login

---

## Testing Checklist

### Unit Tests
- [ ] NotificationBell renders correctly
- [ ] NotificationBell displays correct unread count
- [ ] NotificationDropdown renders notification items
- [ ] Mark as read updates state optimistically
- [ ] Time formatting works correctly
- [ ] Icon helper returns correct icons

### Integration Tests
- [ ] Clicking notification marks it as read
- [ ] Mark all as read clears badge
- [ ] Navigation from notification works
- [ ] Preferences save correctly
- [ ] Filter tabs work on list page

### E2E Tests (Playwright)
- [ ] Complete flow: Member added → notification appears → click → navigate
- [ ] Notification preferences persist across sessions
- [ ] Bulk actions work correctly

---

## Next: Phase 6 (Real-time Updates)

After completing Phase 5 UI:
- [ ] SSE endpoint for live notifications (`/api/notifications/stream`)
- [ ] `useNotifications` hook with SSE subscription
- [ ] Toast notifications for instant alerts
- [ ] Optional notification sound
- [ ] Badge update without page refresh
