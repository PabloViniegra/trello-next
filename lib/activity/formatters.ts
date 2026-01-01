import type { TActivityLog, TActivityLogWithUser, TActivityType } from './types'
import { ACTIVITY_TYPES } from './types'

/**
 * Formats an activity log entry into a human-readable message in Spanish
 */
export function formatActivityMessage(
  activity: TActivityLog | TActivityLogWithUser,
): string {
  const { actionType, metadata, entityType } = activity

  // Parse metadata if it's a string
  const meta =
    typeof metadata === 'string'
      ? (JSON.parse(metadata) as Record<string, unknown>)
      : (metadata as Record<string, unknown>)

  // Parse newValues if available (for TActivityLogWithUser)
  const newValues =
    'newValues' in activity && activity.newValues
      ? typeof activity.newValues === 'string'
        ? (JSON.parse(activity.newValues) as Record<string, unknown>)
        : (activity.newValues as Record<string, unknown>)
      : null

  // Parse previousValues if available (for TActivityLogWithUser)
  const previousValues =
    'previousValues' in activity && activity.previousValues
      ? typeof activity.previousValues === 'string'
        ? (JSON.parse(activity.previousValues) as Record<string, unknown>)
        : (activity.previousValues as Record<string, unknown>)
      : null

  switch (actionType) {
    // Board activities
    case 'board.created':
      return `creó el tablero "${(meta.title as string) || 'sin título'}"`

    case 'board.updated': {
      const changes: string[] = []
      if (meta.titleChanged) changes.push('título')
      if (meta.descriptionChanged) changes.push('descripción')
      if (meta.backgroundColorChanged) changes.push('color de fondo')
      if (meta.privacyChanged && newValues) {
        const privacy =
          newValues.isPrivate === 'private' ? 'privado' : 'público'
        return `cambió la privacidad del tablero a ${privacy}`
      }
      return changes.length > 0
        ? `actualizó el ${changes.join(', ')} del tablero`
        : 'actualizó el tablero'
    }

    case 'board.deleted':
      return `eliminó el tablero "${(meta.previousTitle as string) || 'sin título'}"`

    // List activities
    case 'list.created':
      return `creó la lista "${(meta.listTitle as string) || 'sin título'}"`

    case 'list.updated': {
      const changes: string[] = []
      if (meta.titleChanged) changes.push('título')
      if (meta.positionChanged) changes.push('posición')
      return changes.length > 0
        ? `actualizó el ${changes.join(', ')} de la lista`
        : 'actualizó la lista'
    }

    case 'list.reordered':
      return `reordenó la lista desde la posición ${(meta.fromPosition as number) ?? '?'} a ${(meta.toPosition as number) ?? '?'}`

    case 'list.deleted': {
      // Try multiple possible field names for the list title
      // Check metadata first, then previousValues as fallback
      const listTitle =
        (meta.listTitle as string) ||
        (meta.previousTitle as string) ||
        (meta.title as string) ||
        (previousValues?.title as string)
      return `eliminó la lista "${listTitle || 'sin título'}"`
    }

    // Card activities
    case 'card.created':
      return `creó la tarjeta "${(meta.cardTitle as string) || 'sin título'}"`

    case 'card.updated': {
      const changes: string[] = []
      if (meta.titleChanged) changes.push('título')
      if (meta.descriptionChanged) changes.push('descripción')
      if (meta.dueDateChanged) {
        if (meta.newDueDate) {
          return `estableció la fecha de vencimiento de la tarjeta a ${formatDate(meta.newDueDate as string)}`
        }
        return 'eliminó la fecha de vencimiento de la tarjeta'
      }
      return changes.length > 0
        ? `actualizó el ${changes.join(', ')} de la tarjeta`
        : 'actualizó la tarjeta'
    }

    case 'card.moved':
      return meta.fromList && meta.toList
        ? `movió la tarjeta de "${meta.fromList as string}" a "${meta.toList as string}"`
        : 'movió la tarjeta'

    case 'card.deleted':
      return `eliminó la tarjeta "${(meta.previousTitle as string) || 'sin título'}"`

    // Label activities
    case 'label.created':
      return `creó la etiqueta "${(meta.labelName as string) || 'sin nombre'}"`

    case 'label.updated': {
      const changes: string[] = []
      if (meta.nameChanged) changes.push('nombre')
      if (meta.colorChanged) changes.push('color')
      return changes.length > 0
        ? `actualizó el ${changes.join(' y ')} de la etiqueta`
        : 'actualizó la etiqueta'
    }

    case 'label.deleted':
      return `eliminó la etiqueta "${(meta.labelName as string) || 'sin nombre'}"`

    case 'label.assigned':
      return `asignó la etiqueta "${meta.labelName as string}" a la tarjeta "${meta.cardTitle as string}"`

    case 'label.removed':
      return `eliminó la etiqueta "${meta.labelName as string}" de la tarjeta "${meta.cardTitle as string}"`

    // Member activities
    case 'member.added':
      return `agregó a ${(meta.memberName as string) || (meta.memberEmail as string)} como ${(meta.role as string) || 'miembro'}`

    case 'member.removed':
      return `eliminó a ${(meta.memberName as string) || (meta.memberEmail as string)} del tablero`

    // Attachment activities
    case 'card.attachment.added':
      return `adjuntó "${(meta.fileName as string) || 'archivo'}" a la tarjeta`

    case 'card.attachment.removed':
      return `eliminó el adjunto "${(meta.fileName as string) || 'archivo'}" de la tarjeta`

    default:
      return `realizó una acción en ${entityType.toLowerCase()}`
  }
}

/**
 * Formats a date string into a human-readable Spanish format
 */
function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'fecha desconocida'

  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr

  if (Number.isNaN(date.getTime())) return 'fecha inválida'

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Formats a timestamp into a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const activityDate = typeof date === 'string' ? new Date(date) : date

  if (Number.isNaN(activityDate.getTime())) return 'fecha inválida'

  const diffMs = now.getTime() - activityDate.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return 'hace un momento'
  }
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  }
  if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }
  if (diffDays < 7) {
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  }
  if (diffWeeks < 4) {
    return `hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`
  }
  if (diffMonths < 12) {
    return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
  }
  return `hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`
}

/**
 * Gets an icon name for an activity type (for use with Lucide icons)
 */
export function getActivityIcon(activityType: TActivityType): string {
  switch (activityType) {
    case ACTIVITY_TYPES.BOARD_CREATED:
    case ACTIVITY_TYPES.BOARD_UPDATED:
      return 'layout-dashboard'
    case ACTIVITY_TYPES.BOARD_DELETED:
      return 'trash-2'

    case ACTIVITY_TYPES.LIST_CREATED:
    case ACTIVITY_TYPES.LIST_UPDATED:
    case ACTIVITY_TYPES.LIST_REORDERED:
      return 'list'
    case ACTIVITY_TYPES.LIST_DELETED:
      return 'trash-2'

    case ACTIVITY_TYPES.CARD_CREATED:
    case ACTIVITY_TYPES.CARD_UPDATED:
      return 'file-text'
    case ACTIVITY_TYPES.CARD_MOVED:
      return 'move'
    case ACTIVITY_TYPES.CARD_DELETED:
      return 'trash-2'

    case ACTIVITY_TYPES.LABEL_CREATED:
    case ACTIVITY_TYPES.LABEL_UPDATED:
    case ACTIVITY_TYPES.LABEL_ASSIGNED:
    case ACTIVITY_TYPES.LABEL_REMOVED:
      return 'tag'
    case ACTIVITY_TYPES.LABEL_DELETED:
      return 'trash-2'

    case ACTIVITY_TYPES.MEMBER_ADDED:
      return 'user-plus'
    case ACTIVITY_TYPES.MEMBER_REMOVED:
      return 'user-minus'

    case ACTIVITY_TYPES.ATTACHMENT_ADDED:
      return 'paperclip'
    case ACTIVITY_TYPES.ATTACHMENT_REMOVED:
      return 'x'

    default:
      return 'activity'
  }
}

/**
 * Gets a color class for an activity type (for styling)
 */
export function getActivityColor(activityType: TActivityType): string {
  switch (activityType) {
    case ACTIVITY_TYPES.BOARD_CREATED:
    case ACTIVITY_TYPES.LIST_CREATED:
    case ACTIVITY_TYPES.CARD_CREATED:
    case ACTIVITY_TYPES.LABEL_CREATED:
    case ACTIVITY_TYPES.MEMBER_ADDED:
    case ACTIVITY_TYPES.LABEL_ASSIGNED:
    case ACTIVITY_TYPES.ATTACHMENT_ADDED:
      return 'text-green-600 dark:text-green-400'

    case ACTIVITY_TYPES.BOARD_DELETED:
    case ACTIVITY_TYPES.LIST_DELETED:
    case ACTIVITY_TYPES.CARD_DELETED:
    case ACTIVITY_TYPES.LABEL_DELETED:
    case ACTIVITY_TYPES.MEMBER_REMOVED:
    case ACTIVITY_TYPES.LABEL_REMOVED:
    case ACTIVITY_TYPES.ATTACHMENT_REMOVED:
      return 'text-red-600 dark:text-red-400'

    case ACTIVITY_TYPES.BOARD_UPDATED:
    case ACTIVITY_TYPES.LIST_UPDATED:
    case ACTIVITY_TYPES.CARD_UPDATED:
    case ACTIVITY_TYPES.LABEL_UPDATED:
      return 'text-blue-600 dark:text-blue-400'

    case ACTIVITY_TYPES.CARD_MOVED:
    case ACTIVITY_TYPES.LIST_REORDERED:
      return 'text-purple-600 dark:text-purple-400'

    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}
