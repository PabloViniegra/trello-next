/**
 * Activity Schemas
 * Zod validation schemas for activity logging
 */

import { z } from 'zod'
import { ACTIVITY_TYPES, ENTITY_TYPES } from './types'

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const logActivitySchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido'),
  actionType: z.enum([
    ACTIVITY_TYPES.BOARD_CREATED,
    ACTIVITY_TYPES.BOARD_UPDATED,
    ACTIVITY_TYPES.BOARD_DELETED,
    ACTIVITY_TYPES.LIST_CREATED,
    ACTIVITY_TYPES.LIST_UPDATED,
    ACTIVITY_TYPES.LIST_DELETED,
    ACTIVITY_TYPES.LIST_REORDERED,
    ACTIVITY_TYPES.CARD_CREATED,
    ACTIVITY_TYPES.CARD_UPDATED,
    ACTIVITY_TYPES.CARD_DELETED,
    ACTIVITY_TYPES.CARD_MOVED,
    ACTIVITY_TYPES.CARD_REORDERED,
    ACTIVITY_TYPES.LABEL_CREATED,
    ACTIVITY_TYPES.LABEL_UPDATED,
    ACTIVITY_TYPES.LABEL_DELETED,
    ACTIVITY_TYPES.LABEL_ASSIGNED,
    ACTIVITY_TYPES.LABEL_REMOVED,
    ACTIVITY_TYPES.MEMBER_ADDED,
    ACTIVITY_TYPES.MEMBER_REMOVED,
  ]),
  entityType: z.enum([
    ENTITY_TYPES.BOARD,
    ENTITY_TYPES.LIST,
    ENTITY_TYPES.CARD,
    ENTITY_TYPES.LABEL,
    ENTITY_TYPES.MEMBER,
  ]),
  entityId: z.string().min(1, 'El ID de entidad es requerido'),
  boardId: z.string().min(1, 'El ID de tablero es requerido'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  previousValues: z.record(z.string(), z.unknown()).optional(),
  newValues: z.record(z.string(), z.unknown()).optional(),
})

export type TLogActivitySchema = z.infer<typeof logActivitySchema>

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

export const getActivityByBoardSchema = z.object({
  boardId: z.string().min(1, 'El ID de tablero es requerido'),
  limit: z.number().default(50),
  offset: z.number().default(0),
})

export type TGetActivityByBoardSchema = z.infer<typeof getActivityByBoardSchema>

export const getActivityByUserSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido'),
  limit: z.number().default(50),
  offset: z.number().default(0),
})

export type TGetActivityByUserSchema = z.infer<typeof getActivityByUserSchema>

export const getActivityByEntitySchema = z.object({
  entityType: z.enum([
    ENTITY_TYPES.BOARD,
    ENTITY_TYPES.LIST,
    ENTITY_TYPES.CARD,
    ENTITY_TYPES.LABEL,
    ENTITY_TYPES.MEMBER,
  ]),
  entityId: z.string().min(1, 'El ID de entidad es requerido'),
  limit: z.number().default(50),
  offset: z.number().default(0),
})

export type TGetActivityByEntitySchema = z.infer<
  typeof getActivityByEntitySchema
>
