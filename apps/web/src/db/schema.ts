import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const fortniteEvents = pgTable("fortnite_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalKey: text("external_key").notNull().unique(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  targetAt: timestamp("target_at", { withTimezone: true }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  source: text("source").notNull(),
  sortPriority: integer("sort_priority").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const ingestionRuns = pgTable("ingestion_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  eventsUpserted: integer("events_upserted").notNull().default(0),
});

/** Per-user favorites (Clerk `user_id`). */
export const userFavorites = pgTable(
  "user_favorite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    /** `event` | `shop_offer` | `history` */
    targetType: text("target_type").notNull(),
    /** Event/history UUID or stable offer id (`op-{hash}-{idx}`). */
    targetKey: text("target_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("user_favorite_user_target_unique").on(
      table.userId,
      table.targetType,
      table.targetKey,
    ),
    index("user_favorite_user_id_idx").on(table.userId),
  ],
);

export const fortniteEventHistory = pgTable(
  "fortnite_event_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    archivedAt: timestamp("archived_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    originalEventId: uuid("original_event_id"),
    externalKey: text("external_key").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    targetAt: timestamp("target_at", { withTimezone: true }).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    source: text("source").notNull(),
    sortPriority: integer("sort_priority").notNull().default(0),
  },
  (table) => [
    index("fortnite_event_history_archived_at_idx").on(table.archivedAt),
  ],
);

export type FortniteEventRow = typeof fortniteEvents.$inferSelect;
export type FortniteEventInsert = typeof fortniteEvents.$inferInsert;
export type FortniteEventHistoryRow = typeof fortniteEventHistory.$inferSelect;
export type FortniteEventHistoryInsert =
  typeof fortniteEventHistory.$inferInsert;
export type IngestionRunRow = typeof ingestionRuns.$inferSelect;
export type IngestionRunInsert = typeof ingestionRuns.$inferInsert;
export type UserFavoriteRow = typeof userFavorites.$inferSelect;
export type UserFavoriteInsert = typeof userFavorites.$inferInsert;
