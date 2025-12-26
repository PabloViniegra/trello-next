import type { z } from 'zod'
import type {
  assignCardMemberSchema,
  unassignCardMemberSchema,
} from './schemas'

export type TAssignCardMemberInput = z.infer<typeof assignCardMemberSchema>
export type TUnassignCardMemberInput = z.infer<typeof unassignCardMemberSchema>

export type TCardMember = {
  id: string
  cardId: string
  userId: string
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export type TCardMemberResult = {
  success: boolean
  data?: TCardMember
  error?: string
}

export type TUnassignCardMemberResult = {
  success: boolean
  error?: string
}

export type TCardMembersListResult = {
  success: boolean
  data?: TCardMember[]
  error?: string
}
