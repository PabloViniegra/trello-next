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
// FILTER BUILDERS
// =============================================================================

function buildTextFilter(
  field: 'title' | 'description',
  operator: TFilterOperator,
  value: string,
): SQL | undefined {
  if (!value.trim()) return undefined

  const column = board[field]

  switch (operator) {
    case 'contains':
      return ilike(column, `%${value}%`)
    case 'equals':
      return eq(column, value)
    case 'startsWith':
      return like(column, `${value}%`)
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

  const offset = (page - 1) * pageSize
  const whereClause = buildWhereClause(user.id, filters)

  try {
    // Execute both queries in parallel
    const [boardsResult, countResult] = await Promise.all([
      db
        .select()
        .from(board)
        .where(whereClause)
        .orderBy(desc(board.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: count() }).from(board).where(whereClause),
    ])

    const totalCount = countResult[0]?.count ?? 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      success: true,
      data: {
        boards: boardsResult,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
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

export async function getBoardById(
  boardId: string,
): Promise<{ success: boolean; data?: TBoard; error?: string }> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para ver este tablero',
    }
  }

  try {
    const [result] = await db
      .select()
      .from(board)
      .where(and(eq(board.id, boardId), eq(board.ownerId, user.id)))
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
