/**
 * Notification Icon Utilities
 * Maps notification types to Lucide icons and colors
 */

import type { LucideIcon } from 'lucide-react'
import { AlertCircle, Bell, Calendar, Move, Tag, UserPlus } from 'lucide-react'

/**
 * Get the appropriate icon for a notification type
 */
export function getNotificationIcon(type: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    'member.added': UserPlus,
    'card.assigned': Bell,
    'card.due_soon': Calendar,
    'card.overdue': AlertCircle,
    'label.assigned': Tag,
    'card.moved': Move,
    'board.shared': UserPlus,
  }
  return icons[type] ?? Bell
}

/**
 * Get the appropriate color class for a notification type
 */
export function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    'member.added': 'text-blue-500',
    'card.assigned': 'text-purple-500',
    'card.due_soon': 'text-yellow-500',
    'card.overdue': 'text-red-500',
    'label.assigned': 'text-green-500',
    'card.moved': 'text-gray-500',
    'board.shared': 'text-blue-500',
  }
  return colors[type] ?? 'text-gray-500'
}
