CREATE TABLE "card_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"download_url" text NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_attachment" ADD CONSTRAINT "card_attachment_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_attachment" ADD CONSTRAINT "card_attachment_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_attachment_card_id_idx" ON "card_attachment" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "card_attachment_uploaded_by_idx" ON "card_attachment" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "card_attachment_created_at_idx" ON "card_attachment" USING btree ("card_id","created_at");