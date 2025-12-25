import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import { user } from '@/auth-schema'

// =============================================================================
// ENUMS
// =============================================================================

export const boardPrivacyEnum = pgEnum('board_privacy', ['public', 'private'])

// =============================================================================
// BOARDS
// =============================================================================

export const board = pgTable(
  'board',
  {
    id: text('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    backgroundColor: varchar('background_color', { length: 7 }).default(
      '#0079bf',
    ),
    backgroundImage: text('background_image'),
    isPrivate: boardPrivacyEnum('is_private').notNull().default('public'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('board_owner_id_idx').on(table.ownerId),
    index('board_created_at_idx').on(table.createdAt),
    index('board_is_private_idx').on(table.isPrivate),
    index('board_access_idx').on(table.isPrivate, table.ownerId),
  ],
)

// =============================================================================
// LISTS (Columns)
// =============================================================================

export const list = pgTable(
  'list',
  {
    id: text('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    position: integer('position').notNull().default(0),
    boardId: text('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('list_board_id_idx').on(table.boardId),
    index('list_position_idx').on(table.boardId, table.position),
  ],
)

// =============================================================================
// CARDS (Tasks)
// =============================================================================

export const card = pgTable(
  'card',
  {
    id: text('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    position: integer('position').notNull().default(0),
    dueDate: timestamp('due_date'),
    listId: text('list_id')
      .notNull()
      .references(() => list.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('card_list_id_idx').on(table.listId),
    index('card_position_idx').on(table.listId, table.position),
    index('card_due_date_idx').on(table.dueDate),
  ],
)

// =============================================================================
// LABELS
// =============================================================================

export const label = pgTable(
  'label',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 100 }),
    color: varchar('color', { length: 7 }).notNull(),
    boardId: text('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('label_board_id_idx').on(table.boardId)],
)

// =============================================================================
// CARD LABELS (Many-to-Many)
// =============================================================================

export const cardLabel = pgTable(
  'card_label',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => card.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('card_label_card_id_idx').on(table.cardId),
    index('card_label_label_id_idx').on(table.labelId),
    unique('card_label_unique').on(table.cardId, table.labelId),
  ],
)

// =============================================================================
// BOARD MEMBERS (Many-to-Many for collaboration)
// =============================================================================

export const boardMember = pgTable(
  'board_member',
  {
    id: text('id').primaryKey(),
    boardId: text('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull().default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('board_member_board_id_idx').on(table.boardId),
    index('board_member_user_id_idx').on(table.userId),
    unique('board_member_unique').on(table.boardId, table.userId),
  ],
)

// =============================================================================
// RELATIONS
// =============================================================================

// =============================================================================
// ACTIVITY LOG (Audit trail)
// =============================================================================

export const activityLog = pgTable(
  'activity_log',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    actionType: varchar('action_type', { length: 50 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: text('entity_id').notNull(),
    boardId: text('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    metadata: jsonb('metadata').notNull().default({}),
    previousValues: jsonb('previous_values').notNull().default({}),
    newValues: jsonb('new_values').notNull().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('activity_board_created_idx').on(table.boardId, table.createdAt),
    index('activity_user_created_idx').on(table.userId, table.createdAt),
    index('activity_entity_idx').on(table.entityType, table.entityId),
    index('activity_created_idx').on(table.createdAt),
  ],
)

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export const notification = pgTable(
  'notification',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activityId: text('activity_id').references(() => activityLog.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    notificationType: varchar('notification_type', { length: 50 }).notNull(),
    isRead: integer('is_read').notNull().default(0), // 0 = false, 1 = true
    readAt: timestamp('read_at'),
    metadata: jsonb('metadata').notNull().default({}),
    priority: varchar('priority', { length: 20 }).notNull().default('normal'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notification_user_unread_idx').on(
      table.userId,
      table.isRead,
      table.createdAt,
    ),
    index('notification_created_idx').on(table.createdAt),
  ],
)

// =============================================================================
// USER NOTIFICATION PREFERENCES
// =============================================================================

export const userNotificationPreferences = pgTable(
  'user_notification_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    emailNotifications: integer('email_notifications').notNull().default(1), // 0 = false, 1 = true
    pushNotifications: integer('push_notifications').notNull().default(1),
    notifyCardAssigned: integer('notify_card_assigned').notNull().default(1),
    notifyCardDue: integer('notify_card_due').notNull().default(1),
    notifyCardComments: integer('notify_card_comments').notNull().default(1),
    notifyBoardUpdates: integer('notify_board_updates').notNull().default(0),
    notifyMentions: integer('notify_mentions').notNull().default(1),
    digestFrequency: varchar('digest_frequency', { length: 20 })
      .notNull()
      .default('instant'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('user_notification_preferences_user_idx').on(table.userId)],
)

export const boardRelations = relations(board, ({ one, many }) => ({
  owner: one(user, {
    fields: [board.ownerId],
    references: [user.id],
  }),
  lists: many(list),
  labels: many(label),
  members: many(boardMember),
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

export const labelRelations = relations(label, ({ one, many }) => ({
  board: one(board, {
    fields: [label.boardId],
    references: [board.id],
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

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(user, {
    fields: [activityLog.userId],
    references: [user.id],
  }),
  board: one(board, {
    fields: [activityLog.boardId],
    references: [board.id],
  }),
}))

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  activity: one(activityLog, {
    fields: [notification.activityId],
    references: [activityLog.id],
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
