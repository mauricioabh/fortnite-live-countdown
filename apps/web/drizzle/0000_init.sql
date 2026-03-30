CREATE TABLE "fortnite_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_key" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"target_at" timestamp with time zone NOT NULL,
	"starts_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text NOT NULL,
	"sort_priority" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fortnite_event_external_key_unique" UNIQUE("external_key")
);
--> statement-breakpoint
CREATE TABLE "ingestion_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text NOT NULL,
	"error_message" text,
	"events_upserted" integer DEFAULT 0 NOT NULL
);
