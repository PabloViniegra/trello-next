import { relations } from 'drizzle-orm/relations'
import {
  account,
  activityLog,
  board,
  boardMember,
  card,
  cardLabel,
  label,
  list,
  notification,
  session,
  user,
  userNotificationPreferences,
} from './schema'

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  boardMembers: many(boardMember),
  boards: many(board),
  userNotificationPreferences: many(userNotificationPreferences),
  activityLogs: many(activityLog),
  notifications: many(notification),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const boardMemberRelations = relations(boardMember, ({ one }) => ({
  board: one(board, {
    fields: [boardMember.boardId],
    references: [board.id],
  }),
  user: one(user, {
    fields: [boardMember.userId],
    references: [user.id],
  }),
}))

export const boardRelations = relations(board, ({ one, many }) => ({
  boardMembers: many(boardMember),
  lists: many(list),
  labels: many(label),
  user: one(user, {
    fields: [board.ownerId],
    references: [user.id],
  }),
  activityLogs: many(activityLog),
}))

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
  cards: many(card),
}))

export const cardRelations = relations(card, ({ one, many }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }),
  cardLabels: many(cardLabel),
}))

export const cardLabelRelations = relations(cardLabel, ({ one }) => ({
  card: one(card, {
    fields: [cardLabel.cardId],
    references: [card.id],
  }),
  label: one(label, {
    fields: [cardLabel.labelId],
    references: [label.id],
  }),
}))

export const labelRelations = relations(label, ({ one, many }) => ({
  cardLabels: many(cardLabel),
  board: one(board, {
    fields: [label.boardId],
    references: [board.id],
  }),
}))

export const userNotificationPreferencesRelations = relations(
  userNotificationPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userNotificationPreferences.userId],
      references: [user.id],
    }),
  }),
)

export const activityLogRelations = relations(activityLog, ({ one, many }) => ({
  user: one(user, {
    fields: [activityLog.userId],
    references: [user.id],
  }),
  board: one(board, {
    fields: [activityLog.boardId],
    references: [board.id],
  }),
  notifications: many(notification),
}))

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  activityLog: one(activityLog, {
    fields: [notification.activityId],
    references: [activityLog.id],
  }),
}))
