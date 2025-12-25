ALTER TABLE "notification" ALTER COLUMN "metadata" SET DATA TYPE jsonb USING metadata::jsonb;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;