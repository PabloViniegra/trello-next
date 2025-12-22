ALTER TABLE "board" ADD COLUMN "is_private" varchar(10) DEFAULT 'public' NOT NULL;--> statement-breakpoint
CREATE INDEX "board_is_private_idx" ON "board" USING btree ("is_private");