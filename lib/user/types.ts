/**
 * User statistics for profile display
 */
export type TUserStats = {
  totalBoardsOwned: number
  totalBoardsCollaborating: number
  totalCardsAssigned: number
}

/**
 * Detailed user information including timestamps
 */
export type TUserDetails = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
}
