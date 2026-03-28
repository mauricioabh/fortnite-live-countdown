CREATE TABLE "fortnite_event_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archived_at" timestamp with time zone DEFAULT now() NOT NULL,
	"original_event_id" uuid,
	"external_key" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"target_at" timestamp with time zone NOT NULL,
	"starts_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text NOT NULL,
	"sort_priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "fortnite_event_history_archived_at_idx" ON "fortnite_event_history" USING btree ("archived_at");
