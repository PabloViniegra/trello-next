/**
 * Notification Formatting Utilities
 * Helper functions for displaying notifications
 */

/**
 * Format notification timestamp as relative time in Spanish
 */
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

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Format unread count for badge display
 * Shows "9+" for counts > 9
 */
export function formatUnreadCount(count: number): string {
  if (count === 0) return '0'
  if (count > 9) return '9+'
  return count.toString()
}
