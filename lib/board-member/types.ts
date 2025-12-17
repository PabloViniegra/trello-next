import type { z } from 'zod'
import type { addBoardMemberSchema, removeBoardMemberSchema } from './schemas'

export type TAddBoardMemberInput = z.infer<typeof addBoardMemberSchema>
export type TRemoveBoardMemberInput = z.infer<typeof removeBoardMemberSchema>

export type TBoardMember = {
  id: string
  boardId: string
  userId: string
  role: 'owner' | 'member'
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export type TBoardMemberResult = {
  success: boolean
  data?: TBoardMember
  error?: string
}

export type TRemoveBoardMemberResult = {
  success: boolean
  error?: string
}

export type TUsersListResult = {
  success: boolean
  data?: Array<{
    id: string
    name: string
    email: string
    image?: string | null
  }>
  error?: string
}
