CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" text NOT NULL,
	"board_id" text NOT NULL,
	"metadata" text DEFAULT '{}' NOT NULL,
	"previous_values" text DEFAULT '{}' NOT NULL,
	"new_values" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity_id" text,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"is_read" integer DEFAULT 0 NOT NULL,
	"read_at" timestamp,
	"metadata" text DEFAULT '{}' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_notifications" integer DEFAULT 1 NOT NULL,
	"push_notifications" integer DEFAULT 1 NOT NULL,
	"notify_card_assigned" integer DEFAULT 1 NOT NULL,
	"notify_card_due" integer DEFAULT 1 NOT NULL,
	"notify_card_comments" integer DEFAULT 1 NOT NULL,
	"notify_board_updates" integer DEFAULT 0 NOT NULL,
	"notify_mentions" integer DEFAULT 1 NOT NULL,
	"digest_frequency" varchar(20) DEFAULT 'instant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_activity_id_activity_log_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity_log"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_board_created_idx" ON "activity_log" USING btree ("board_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_user_created_idx" ON "activity_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_entity_idx" ON "activity_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "activity_created_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notification_user_unread_idx" ON "notification" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "notification_created_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_notification_preferences_user_idx" ON "user_notification_preferences" USING btree ("user_id");