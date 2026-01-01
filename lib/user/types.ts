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

/**
 * Card status over time data point
 */
export type TCardStatusData = {
  date: string
  total: number
  completed: number
  pending: number
}

/**
 * Board activity data
 */
export type TBoardActivityData = {
  boardName: string
  totalCards: number
  completedCards: number
  activeMembers: number
}

/**
 * Label usage statistics
 */
export type TLabelUsageData = {
  labelName: string
  color: string
  count: number
}

/**
 * Activity timeline data
 */
export type TActivityTimelineData = {
  week: string
  cards: number
  comments: number
  boards: number
}

/**
 * Complete analytics data for user profile
 */
export type TUserAnalytics = {
  cardStatusOverTime: TCardStatusData[]
  boardActivity: TBoardActivityData[]
  labelUsage: TLabelUsageData[]
  activityTimeline: TActivityTimelineData[]
}
