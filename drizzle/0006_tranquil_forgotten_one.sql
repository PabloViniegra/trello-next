ALTER TABLE "activity_log" ALTER COLUMN "metadata" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "metadata" SET DATA TYPE jsonb USING metadata::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "previous_values" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "previous_values" SET DATA TYPE jsonb USING previous_values::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "previous_values" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "new_values" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "new_values" SET DATA TYPE jsonb USING new_values::jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "new_values" SET DEFAULT '{}'::jsonb;