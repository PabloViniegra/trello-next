/**
 * Activity Formatters Tests
 * Tests for activity message formatting
 */

import { describe, expect, it } from 'vitest'
import {
  formatActivityMessage,
  formatRelativeTime,
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
