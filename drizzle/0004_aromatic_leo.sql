CREATE TYPE "public"."board_privacy" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "is_private" SET DEFAULT 'public'::"public"."board_privacy";--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "is_private" SET DATA TYPE "public"."board_privacy" USING "is_private"::"public"."board_privacy";--> statement-breakpoint
CREATE INDEX "board_access_idx" ON "board" USING btree ("is_private","owner_id");