import { pgTable, index, text, timestamp, unique, boolean, foreignKey, varchar, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const boardPrivacy = pgEnum("board_privacy", ['public', 'private'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const boardMember = pgTable("board_member", {
	id: text().primaryKey().notNull(),
	boardId: text("board_id").notNull(),
	userId: text("user_id").notNull(),
	role: varchar({ length: 20 }).default('member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("board_member_board_id_idx").using("btree", table.boardId.asc().nullsLast().op("text_ops")),
	index("board_member_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.boardId],
			foreignColumns: [board.id],
			name: "board_member_board_id_board_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "board_member_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("board_member_unique").on(table.boardId, table.userId),
]);

export const list = pgTable("list", {
	id: text().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	position: integer().default(0).notNull(),
	boardId: text("board_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("list_board_id_idx").using("btree", table.boardId.asc().nullsLast().op("text_ops")),
	index("list_position_idx").using("btree", table.boardId.asc().nullsLast().op("int4_ops"), table.position.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.boardId],
			foreignColumns: [board.id],
			name: "list_board_id_board_id_fk"
		}).onDelete("cascade"),
]);

export const card = pgTable("card", {
	id: text().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	position: integer().default(0).notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	listId: text("list_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("card_due_date_idx").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("card_list_id_idx").using("btree", table.listId.asc().nullsLast().op("text_ops")),
	index("card_position_idx").using("btree", table.listId.asc().nullsLast().op("text_ops"), table.position.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "card_list_id_list_id_fk"
		}).onDelete("cascade"),
]);

export const cardLabel = pgTable("card_label", {
	id: text().primaryKey().notNull(),
	cardId: text("card_id").notNull(),
	labelId: text("label_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("card_label_card_id_idx").using("btree", table.cardId.asc().nullsLast().op("text_ops")),
	index("card_label_label_id_idx").using("btree", table.labelId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.cardId],
			foreignColumns: [card.id],
			name: "card_label_card_id_card_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.labelId],
			foreignColumns: [label.id],
			name: "card_label_label_id_label_id_fk"
		}).onDelete("cascade"),
	unique("card_label_unique").on(table.cardId, table.labelId),
]);

export const label = pgTable("label", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	color: varchar({ length: 7 }).notNull(),
	boardId: text("board_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("label_board_id_idx").using("btree", table.boardId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.boardId],
			foreignColumns: [board.id],
			name: "label_board_id_board_id_fk"
		}).onDelete("cascade"),
]);

export const board = pgTable("board", {
	id: text().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	backgroundColor: varchar("background_color", { length: 7 }).default('#0079bf'),
	backgroundImage: text("background_image"),
	ownerId: text("owner_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isPrivate: boardPrivacy("is_private").default('public').notNull(),
}, (table) => [
	index("board_access_idx").using("btree", table.isPrivate.asc().nullsLast().op("text_ops"), table.ownerId.asc().nullsLast().op("enum_ops")),
	index("board_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("board_is_private_idx").using("btree", table.isPrivate.asc().nullsLast().op("enum_ops")),
	index("board_owner_id_idx").using("btree", table.ownerId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "board_owner_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const userNotificationPreferences = pgTable("user_notification_preferences", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	emailNotifications: integer("email_notifications").default(1).notNull(),
	pushNotifications: integer("push_notifications").default(1).notNull(),
	notifyCardAssigned: integer("notify_card_assigned").default(1).notNull(),
	notifyCardDue: integer("notify_card_due").default(1).notNull(),
	notifyCardComments: integer("notify_card_comments").default(1).notNull(),
	notifyBoardUpdates: integer("notify_board_updates").default(0).notNull(),
	notifyMentions: integer("notify_mentions").default(1).notNull(),
	digestFrequency: varchar("digest_frequency", { length: 20 }).default('instant').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_notification_preferences_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_notification_preferences_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("user_notification_preferences_user_id_unique").on(table.userId),
]);

export const activityLog = pgTable("activity_log", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	actionType: varchar("action_type", { length: 50 }).notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: text("entity_id").notNull(),
	boardId: text("board_id").notNull(),
	metadata: text().default('{}').notNull(),
	previousValues: text("previous_values").default('{}').notNull(),
	newValues: text("new_values").default('{}').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("activity_board_created_idx").using("btree", table.boardId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("activity_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("activity_entity_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("text_ops")),
	index("activity_user_created_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "activity_log_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.boardId],
			foreignColumns: [board.id],
			name: "activity_log_board_id_board_id_fk"
		}).onDelete("cascade"),
]);

export const notification = pgTable("notification", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	activityId: text("activity_id"),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	notificationType: varchar("notification_type", { length: 50 }).notNull(),
	isRead: integer("is_read").default(0).notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	metadata: text().default('{}').notNull(),
	priority: varchar({ length: 20 }).default('normal').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notification_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("notification_user_unread_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.isRead.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.activityId],
			foreignColumns: [activityLog.id],
			name: "notification_activity_id_activity_log_id_fk"
		}).onDelete("cascade"),
]);
