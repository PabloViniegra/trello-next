/**
 * Activity Formatters Tests
 * Tests for activity message formatting
 */

import { describe, expect, it } from 'vitest'
import {
  formatActivityMessage,
  formatRelativeTime,
  getActivityColor,
  getActivityIcon,
} from '@/lib/activity/formatters'
import type { TActivityLog } from '@/lib/activity/types'
import { ACTIVITY_TYPES, ENTITY_TYPES } from '@/lib/activity/types'

describe('Activity Formatters', () => {
  describe('formatActivityMessage', () => {
    it('should format board created message', () => {
      const activity: TActivityLog = {
        id: 'act-1',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.BOARD_CREATED,
        entityType: ENTITY_TYPES.BOARD,
        entityId: 'board-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ title: 'Mi Tablero' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('creó el tablero')
      expect(message).toContain('Mi Tablero')
    })

    it('should format card moved message', () => {
      const activity: TActivityLog = {
        id: 'act-2',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.CARD_MOVED,
        entityType: ENTITY_TYPES.CARD,
        entityId: 'card-1',
        boardId: 'board-1',
        metadata: JSON.stringify({
          fromList: 'Por Hacer',
          toList: 'En Progreso',
        }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('movió la tarjeta')
      expect(message).toContain('Por Hacer')
      expect(message).toContain('En Progreso')
    })

    it('should format label assigned message', () => {
      const activity: TActivityLog = {
        id: 'act-3',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.LABEL_ASSIGNED,
        entityType: ENTITY_TYPES.LABEL,
        entityId: 'label-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ labelName: 'Bug', cardTitle: 'Fix login' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('asignó la etiqueta')
      expect(message).toContain('Bug')
      expect(message).toContain('Fix login')
    })

    it('should handle unknown action types', () => {
      const activity: TActivityLog = {
        id: 'act-4',
        userId: 'user-1',
        actionType: 'unknown.action' as never,
        entityType: ENTITY_TYPES.BOARD,
        entityId: 'board-1',
        boardId: 'board-1',
        metadata: JSON.stringify({}),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('realizó una acción')
    })
  })

  describe('formatRelativeTime', () => {
    it('should format recent time as "hace X minutos"', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const formatted = formatRelativeTime(fiveMinutesAgo)
      expect(formatted).toContain('hace')
      expect(formatted).toContain('minuto')
    })

    it('should format hours as "hace X horas"', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const formatted = formatRelativeTime(twoHoursAgo)
      expect(formatted).toContain('hace')
      expect(formatted).toContain('hora')
    })

    it('should format days as "hace X días"', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const formatted = formatRelativeTime(threeDaysAgo)
      expect(formatted).toContain('hace')
      expect(formatted).toContain('día')
    })

    it('should accept string date', () => {
      const dateString = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const formatted = formatRelativeTime(dateString)
      expect(formatted).toContain('hace')
    })

    it('should format weeks', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      const formatted = formatRelativeTime(twoWeeksAgo)
      expect(formatted).toContain('hace')
    })

    it('should format months', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      const formatted = formatRelativeTime(twoMonthsAgo)
      expect(formatted).toContain('hace')
    })
  })

  describe('formatActivityMessage - additional cases', () => {
    it('should format list created', () => {
      const activity: TActivityLog = {
        id: 'act-5',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.LIST_CREATED,
        entityType: ENTITY_TYPES.LIST,
        entityId: 'list-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ listTitle: 'To Do' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('creó la lista')
      expect(message).toContain('To Do')
    })

    it('should format list updated', () => {
      const activity: TActivityLog = {
        id: 'act-6',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.LIST_UPDATED,
        entityType: ENTITY_TYPES.LIST,
        entityId: 'list-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ titleChanged: true }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('actualizó')
    })

    it('should format list deleted', () => {
      const activity: TActivityLog = {
        id: 'act-7',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.LIST_DELETED,
        entityType: ENTITY_TYPES.LIST,
        entityId: 'list-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ listTitle: 'Done' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('eliminó la lista')
    })

    it('should format card created', () => {
      const activity: TActivityLog = {
        id: 'act-8',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.CARD_CREATED,
        entityType: ENTITY_TYPES.CARD,
        entityId: 'card-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ cardTitle: 'New Task' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('creó la tarjeta')
      expect(message).toContain('New Task')
    })

    it('should format card deleted', () => {
      const activity: TActivityLog = {
        id: 'act-9',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.CARD_DELETED,
        entityType: ENTITY_TYPES.CARD,
        entityId: 'card-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ cardTitle: 'Old Task' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('eliminó la tarjeta')
    })

    it('should format member added', () => {
      const activity: TActivityLog = {
        id: 'act-10',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.MEMBER_ADDED,
        entityType: ENTITY_TYPES.MEMBER,
        entityId: 'member-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ memberName: 'John Doe' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('agregó a')
      expect(message).toContain('John Doe')
    })

    it('should format member removed', () => {
      const activity: TActivityLog = {
        id: 'act-11',
        userId: 'user-1',
        actionType: ACTIVITY_TYPES.MEMBER_REMOVED,
        entityType: ENTITY_TYPES.MEMBER,
        entityId: 'member-1',
        boardId: 'board-1',
        metadata: JSON.stringify({ memberName: 'Jane Smith' }),
        previousValues: JSON.stringify({}),
        newValues: JSON.stringify({}),
        createdAt: new Date(),
      }

      const message = formatActivityMessage(activity)
      expect(message).toContain('eliminó a')
      expect(message).toContain('Jane Smith')
    })
  })
})

describe('formatActivityMessage - comprehensive coverage', () => {
  it('should format board updated with title change', () => {
    const activity: TActivityLog = {
      id: 'act-12',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.BOARD_UPDATED,
      entityType: ENTITY_TYPES.BOARD,
      entityId: 'board-1',
      boardId: 'board-1',
      metadata: { titleChanged: true },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain(
      'actualizó el título del tablero',
    )
  })

  it('should format board updated with privacy change', () => {
    const activity: TActivityLog = {
      id: 'act-13',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.BOARD_UPDATED,
      entityType: ENTITY_TYPES.BOARD,
      entityId: 'board-1',
      boardId: 'board-1',
      metadata: { privacyChanged: true, newIsPrivate: true },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain(
      'privacidad del tablero a privado',
    )
  })

  it('should format board deleted', () => {
    const activity: TActivityLog = {
      id: 'act-14',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.BOARD_DELETED,
      entityType: ENTITY_TYPES.BOARD,
      entityId: 'board-1',
      boardId: 'board-1',
      metadata: { previousTitle: 'Old Board' },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain('eliminó el tablero')
  })

  it('should format list reordered', () => {
    const activity: TActivityLog = {
      id: 'act-15',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.LIST_REORDERED,
      entityType: ENTITY_TYPES.LIST,
      entityId: 'list-1',
      boardId: 'board-1',
      metadata: { fromPosition: 1, toPosition: 3 },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain('reordenó la lista')
  })

  it('should format card updated with due date added', () => {
    const activity: TActivityLog = {
      id: 'act-16',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.CARD_UPDATED,
      entityType: ENTITY_TYPES.CARD,
      entityId: 'card-1',
      boardId: 'board-1',
      metadata: { dueDateChanged: true, newDueDate: '2025-12-31' },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain('fecha de vencimiento')
  })

  it('should format card updated with due date removed', () => {
    const activity: TActivityLog = {
      id: 'act-17',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.CARD_UPDATED,
      entityType: ENTITY_TYPES.CARD,
      entityId: 'card-1',
      boardId: 'board-1',
      metadata: { dueDateChanged: true, newDueDate: null },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain(
      'eliminó la fecha de vencimiento',
    )
  })

  it('should format label created', () => {
    const activity: TActivityLog = {
      id: 'act-18',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.LABEL_CREATED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: 'label-1',
      boardId: 'board-1',
      metadata: { labelName: 'Priority' },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain('creó la etiqueta')
  })

  it('should format label updated', () => {
    const activity: TActivityLog = {
      id: 'act-19',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.LABEL_UPDATED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: 'label-1',
      boardId: 'board-1',
      metadata: { nameChanged: true, colorChanged: true },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain(
      'actualizó el nombre y color',
    )
  })

  it('should format label deleted', () => {
    const activity: TActivityLog = {
      id: 'act-20',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.LABEL_DELETED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: 'label-1',
      boardId: 'board-1',
      metadata: { labelName: 'Bug' },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain('eliminó la etiqueta')
  })

  it('should format label removed from card', () => {
    const activity: TActivityLog = {
      id: 'act-21',
      userId: 'user-1',
      actionType: ACTIVITY_TYPES.LABEL_REMOVED,
      entityType: ENTITY_TYPES.LABEL,
      entityId: 'label-1',
      boardId: 'board-1',
      metadata: { labelName: 'Bug', cardTitle: 'Task 1' },
      previousValues: {},
      newValues: {},
      createdAt: new Date(),
    }
    expect(formatActivityMessage(activity)).toContain('eliminó la etiqueta')
  })
})

describe('formatRelativeTime - edge cases', () => {
  it('should format very recent time as "hace un momento"', () => {
    const justNow = new Date(Date.now() - 30 * 1000)
    expect(formatRelativeTime(justNow)).toBe('hace un momento')
  })

  it('should format years correctly', () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
    const formatted = formatRelativeTime(twoYearsAgo)
    expect(formatted).toContain('hace')
    expect(formatted).toContain('año')
  })

  it('should handle invalid date string', () => {
    const formatted = formatRelativeTime('invalid-date')
    expect(formatted).toBe('fecha inválida')
  })

  it('should format singular minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 61 * 1000)
    const formatted = formatRelativeTime(oneMinuteAgo)
    expect(formatted).toContain('minuto')
  })

  it('should format singular hour', () => {
    const oneHourAgo = new Date(Date.now() - 61 * 60 * 1000)
    const formatted = formatRelativeTime(oneHourAgo)
    expect(formatted).toContain('hora')
  })

  it('should format singular day', () => {
    const oneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000)
    const formatted = formatRelativeTime(oneDayAgo)
    expect(formatted).toContain('día')
  })
})

describe('getActivityIcon', () => {
  it('should return correct icon for board created', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.BOARD_CREATED)).toBe(
      'layout-dashboard',
    )
  })

  it('should return correct icon for board updated', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.BOARD_UPDATED)).toBe(
      'layout-dashboard',
    )
  })

  it('should return correct icon for board deleted', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.BOARD_DELETED)).toBe('trash-2')
  })

  it('should return correct icon for list created', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.LIST_CREATED)).toBe('list')
  })

  it('should return correct icon for list deleted', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.LIST_DELETED)).toBe('trash-2')
  })

  it('should return correct icon for card created', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.CARD_CREATED)).toBe('file-text')
  })

  it('should return correct icon for card moved', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.CARD_MOVED)).toBe('move')
  })

  it('should return correct icon for label assigned', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.LABEL_ASSIGNED)).toBe('tag')
  })

  it('should return correct icon for member added', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.MEMBER_ADDED)).toBe('user-plus')
  })

  it('should return correct icon for member removed', () => {
    expect(getActivityIcon(ACTIVITY_TYPES.MEMBER_REMOVED)).toBe('user-minus')
  })

  it('should return default icon for unknown type', () => {
    expect(getActivityIcon('unknown.action' as never)).toBe('activity')
  })
})

describe('getActivityColor', () => {
  it('should return green for created actions', () => {
    expect(getActivityColor(ACTIVITY_TYPES.BOARD_CREATED)).toContain('green')
    expect(getActivityColor(ACTIVITY_TYPES.LIST_CREATED)).toContain('green')
    expect(getActivityColor(ACTIVITY_TYPES.CARD_CREATED)).toContain('green')
  })

  it('should return red for deleted actions', () => {
    expect(getActivityColor(ACTIVITY_TYPES.BOARD_DELETED)).toContain('red')
    expect(getActivityColor(ACTIVITY_TYPES.LIST_DELETED)).toContain('red')
    expect(getActivityColor(ACTIVITY_TYPES.CARD_DELETED)).toContain('red')
  })

  it('should return blue for updated actions', () => {
    expect(getActivityColor(ACTIVITY_TYPES.BOARD_UPDATED)).toContain('blue')
    expect(getActivityColor(ACTIVITY_TYPES.LIST_UPDATED)).toContain('blue')
    expect(getActivityColor(ACTIVITY_TYPES.CARD_UPDATED)).toContain('blue')
  })

  it('should return purple for moved actions', () => {
    expect(getActivityColor(ACTIVITY_TYPES.CARD_MOVED)).toContain('purple')
    expect(getActivityColor(ACTIVITY_TYPES.LIST_REORDERED)).toContain('purple')
  })

  it('should return gray for unknown actions', () => {
    expect(getActivityColor('unknown.action' as never)).toContain('gray')
  })
})
