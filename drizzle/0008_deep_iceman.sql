CREATE TABLE "card_member" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "card_member_unique" UNIQUE("card_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "card_member" ADD CONSTRAINT "card_member_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_member" ADD CONSTRAINT "card_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_member_card_id_idx" ON "card_member" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "card_member_user_id_idx" ON "card_member" USING btree ("user_id");