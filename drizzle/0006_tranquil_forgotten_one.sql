ALTER TABLE "activity_log" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "previous_values" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "previous_values" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "new_values" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "new_values" SET DEFAULT '{}'::jsonb;