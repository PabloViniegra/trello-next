import {
  Activity,
  FileText,
  LayoutDashboard,
  List,
  type LucideProps,
  Move,
  Tag,
  Trash2,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import type React from 'react'

/**
 * Map of icon names to their corresponding Lucide components.
 * This avoids dynamic namespace imports which prevent tree-shaking.
 */
export const ACTIVITY_ICON_MAP: Record<
  string,
  React.ComponentType<LucideProps>
> = {
  'layout-dashboard': LayoutDashboard,
  'trash-2': Trash2,
  list: List,
  'file-text': FileText,
  move: Move,
  tag: Tag,
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  activity: Activity,
} as const

/**
 * Gets the icon component for an activity icon name.
 * Falls back to Activity icon if not found.
 */
export function getActivityIconComponent(
  iconName: string,
): React.ComponentType<LucideProps> {
  return ACTIVITY_ICON_MAP[iconName] || Activity
}
