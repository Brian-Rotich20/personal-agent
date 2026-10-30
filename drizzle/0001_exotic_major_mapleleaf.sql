ALTER TABLE "messages" ADD COLUMN "processing_status" text DEFAULT 'processed' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "next_attempt_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "processing_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "processed_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reply_to_message_id" uuid;