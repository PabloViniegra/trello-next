import type { z } from 'zod'
import type {
  createBoardSchema,
  deleteBoardSchema,
  updateBoardSchema,
} from './schemas'

export type TCreateBoardInput = z.infer<typeof createBoardSchema>
export type TUpdateBoardInput = z.infer<typeof updateBoardSchema>
export type TDeleteBoardInput = z.infer<typeof deleteBoardSchema>

export type TBoard = {
  id: string
  title: string
  description: string | null
  backgroundColor: string | null
  backgroundImage: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export type TBoardResult = {
  success: boolean
  data?: TBoard
  error?: string
}

export type TDeleteBoardResult = {
  success: boolean
  error?: string
}

export type TBoardError =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'DB_ERROR'
  | 'UNKNOWN_ERROR'

export const DEFAULT_BOARD_COLOR = '#0079bf'

export const BOARD_COLORS = [
  { name: 'Azul', value: DEFAULT_BOARD_COLOR },
  { name: 'Naranja', value: '#d29034' },
  { name: 'Verde', value: '#519839' },
  { name: 'Rojo', value: '#b04632' },
  { name: 'Morado', value: '#89609e' },
  { name: 'Rosa', value: '#cd5a91' },
  { name: 'Verde Lima', value: '#4bbf6b' },
  { name: 'Celeste', value: '#00aecc' },
  { name: 'Gris', value: '#838c91' },
] as const

export type TBoardColor = (typeof BOARD_COLORS)[number]['value']
