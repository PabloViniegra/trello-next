'use server'

import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  like,
  lt,
  lte,
  type SQL,
} from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { board } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import {
  DEFAULT_PAGE_SIZE,
  type TActiveFilter,
  type TFilterOperator,
} from './filter-types'
import type { TBoard } from './types'

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_PAGE_SIZE = 100
const MAX_FILTER_VALUE_LENGTH = 500

// =============================================================================
// TYPES
// =============================================================================

export type TBoardsQueryParams = {
  page?: number
  pageSize?: number
  filters?: TActiveFilter[]
}

export type TBoardsQueryResult = {
  success: boolean
  data?: {
    boards: TBoard[]
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  error?: string
}

// =============================================================================
// SECURITY HELPERS
// =============================================================================

/**
 * Escapes special characters for LIKE/ILIKE patterns to prevent SQL injection.
 * Characters %, _, and \ have special meaning in LIKE patterns.
 */
function escapeForLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&')
}

/**
 * Validates and sanitizes a filter value.
 */
function sanitizeFilterValue(value: string): string {
  return value.trim().slice(0, MAX_FILTER_VALUE_LENGTH)
}

// =============================================================================
// FILTER BUILDERS
// =============================================================================

function buildTextFilter(
  field: 'title' | 'description',
  operator: TFilterOperator,
  value: string,
): SQL | undefined {
  const sanitizedValue = sanitizeFilterValue(value)
  if (!sanitizedValue) return undefined

  const column = board[field]
  const escapedValue = escapeForLike(sanitizedValue)

  switch (operator) {
    case 'contains':
      return ilike(column, `%${escapedValue}%`)
    case 'equals':
      return eq(column, sanitizedValue) // equals no necesita escape
    case 'startsWith':
      return like(column, `${escapedValue}%`)
    default:
      return undefined
  }
}

function buildDateFilter(
  field: 'createdAt' | 'updatedAt',
  operator: TFilterOperator,
  value: string,
): SQL | undefined {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  const column = board[field]

  switch (operator) {
    case 'before':
      return lt(column, date)
    case 'after':
      return gte(column, date)
    case 'equals': {
      // For date equality, match the entire day
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      return and(gte(column, startOfDay), lte(column, endOfDay))
    }
    default:
      return undefined
  }
}

function buildColorFilter(
  operator: TFilterOperator,
  value: string,
): SQL | undefined {
  if (!value) return undefined

  if (operator === 'equals') {
    return eq(board.backgroundColor, value)
  }

  return undefined
}

function buildFilterCondition(filter: TActiveFilter): SQL | undefined {
  const { field, operator, value } = filter

  switch (field.type) {
    case 'text':
      return buildTextFilter(
        field.key as 'title' | 'description',
        operator,
        value,
      )
    case 'date':
      return buildDateFilter(
        field.key as 'createdAt' | 'updatedAt',
        operator,
        value,
      )
    case 'color':
      return buildColorFilter(operator, value)
    default:
      return undefined
  }
}

function buildWhereClause(
  userId: string,
  filters: TActiveFilter[],
): SQL | undefined {
  const conditions: (SQL | undefined)[] = [eq(board.ownerId, userId)]

  for (const filter of filters) {
    const condition = buildFilterCondition(filter)
    if (condition) {
      conditions.push(condition)
    }
  }

  const validConditions = conditions.filter(Boolean) as SQL[]
  return validConditions.length > 0 ? and(...validConditions) : undefined
}

// =============================================================================
// QUERIES
// =============================================================================

async function _getBoardsWithFilters(
  userId: string,
  page: number,
  pageSize: number,
  filters: TActiveFilter[],
): Promise<TBoardsQueryResult> {
  const validatedPage = Math.max(1, Math.floor(page))
  const validatedPageSize = Math.min(
    Math.max(1, Math.floor(pageSize)),
    MAX_PAGE_SIZE,
  )

  const offset = (validatedPage - 1) * validatedPageSize
  const whereClause = buildWhereClause(userId, filters)

  try {
    // Execute both queries in parallel
    const [boardsResult, countResult] = await Promise.all([
      db
        .select()
        .from(board)
        .where(whereClause)
        .orderBy(desc(board.createdAt))
        .limit(validatedPageSize)
        .offset(offset),
      db.select({ count: count() }).from(board).where(whereClause),
    ])

    const totalCount = countResult[0]?.count ?? 0
    const totalPages = Math.ceil(totalCount / validatedPageSize)

    return {
      success: true,
      data: {
        boards: boardsResult,
        totalCount,
        totalPages,
        currentPage: validatedPage,
        pageSize: validatedPageSize,
      },
    }
  } catch (error) {
    logError(error, 'getBoardsWithFilters')

    return {
      success: false,
      error: 'Error al obtener los tableros. Por favor, intenta de nuevo.',
    }
  }
}

export async function getBoardsWithFilters(
  params: TBoardsQueryParams = {},
): Promise<TBoardsQueryResult> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para ver tus tableros',
    }
  }

  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, filters = [] } = params

  // Solo cachear queries SIN filtros (queries de listado simple)
  // Queries con filtros no se cachean porque son muy específicas y cambian frecuentemente
  const hasFilters = filters.length > 0

  if (hasFilters) {
    // No cachear queries con filtros - ejecutar directamente
    return _getBoardsWithFilters(user.id, page, pageSize, filters)
  }

  // Cachear queries sin filtros (listado completo)
  return unstable_cache(
    async () => _getBoardsWithFilters(user.id, page, pageSize, filters),
    [`boards-list-${user.id}-p${page}-ps${pageSize}`],
    {
      tags: ['boards-list'],
      revalidate: false, // Only revalidate on-demand via revalidateTag
    },
  )()
}

const uuidSchema = z.string().uuid('ID de tablero inválido')

async function _getBoardById(
  boardId: string,
  userId: string,
): Promise<{ success: boolean; data?: TBoard; error?: string }> {
  try {
    const [result] = await db
      .select()
      .from(board)
      .where(and(eq(board.id, boardId), eq(board.ownerId, userId)))
      .limit(1)

    if (!result) {
      return {
        success: false,
        error: 'Tablero no encontrado',
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    logError(error, 'getBoardById')

    return {
      success: false,
      error: 'Error al obtener el tablero',
    }
  }
}

export async function getBoardById(
  boardId: string,
): Promise<{ success: boolean; data?: TBoard; error?: string }> {
  // Validar formato de UUID
  const validatedId = uuidSchema.safeParse(boardId)
  if (!validatedId.success) {
    return {
      success: false,
      error: 'ID de tablero inválido',
    }
  }

  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para ver este tablero',
    }
  }

  // Cache the board query with tags for granular invalidation
  return unstable_cache(
    async () => _getBoardById(boardId, user.id),
    [`board-${boardId}-${user.id}`],
    {
      tags: [`board:${boardId}`],
      revalidate: false, // Only revalidate on-demand via revalidateTag
    },
  )()
}
