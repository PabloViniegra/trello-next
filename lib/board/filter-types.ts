// =============================================================================
// FILTER TYPES FOR BOARDS
// =============================================================================

export type TFilterFieldType = 'text' | 'date' | 'color'

export type TTextOperator = 'contains' | 'equals' | 'startsWith'
export type TDateOperator = 'before' | 'after' | 'equals'
export type TColorOperator = 'equals'

export type TFilterOperator = TTextOperator | TDateOperator | TColorOperator

export type TFilterField = {
  key: string
  label: string
  type: TFilterFieldType
  operators: TFilterOperator[]
}

export const BOARD_FILTER_FIELDS: TFilterField[] = [
  {
    key: 'title',
    label: 'Título',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
  },
  {
    key: 'description',
    label: 'Descripción',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
  },
  {
    key: 'backgroundColor',
    label: 'Color de fondo',
    type: 'color',
    operators: ['equals'],
  },
  {
    key: 'createdAt',
    label: 'Fecha de creación',
    type: 'date',
    operators: ['before', 'after', 'equals'],
  },
  {
    key: 'updatedAt',
    label: 'Fecha de actualización',
    type: 'date',
    operators: ['before', 'after', 'equals'],
  },
] as const

export type TBoardFilterKey = (typeof BOARD_FILTER_FIELDS)[number]['key']

export type TActiveFilter = {
  id: string
  field: TFilterField
  operator: TFilterOperator
  value: string
}

export type TFilterConfig = {
  filters: TActiveFilter[]
  page: number
  pageSize: number
}

export const OPERATOR_LABELS: Record<TFilterOperator, string> = {
  contains: 'contiene',
  equals: 'es igual a',
  startsWith: 'empieza con',
  before: 'antes de',
  after: 'después de',
}

export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [12, 24, 36] as const
