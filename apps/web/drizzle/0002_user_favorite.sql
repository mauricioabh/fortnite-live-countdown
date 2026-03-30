CREATE TABLE "user_favorite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_favorite_user_target_unique" ON "user_favorite" USING btree ("user_id","target_type","target_key");
--> statement-breakpoint
CREATE INDEX "user_favorite_user_id_idx" ON "user_favorite" USING btree ("user_id");
