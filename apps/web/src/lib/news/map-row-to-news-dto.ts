import type { NewsItemDTO } from "@fortnite-live-countdown/types";

import type { fortniteEvents } from "@/db/schema";

type FortniteEventRow = typeof fortniteEvents.$inferSelect;

function metaString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function metaNumber(meta: Record<string, unknown>, key: string): number | null {
  const v = meta[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function mapEventRowToNewsDto(row: FortniteEventRow): NewsItemDTO {
  const meta = row.metadata ?? {};
  const body =
    metaString(meta, "body") ?? metaString(meta, "bodyPreview") ?? "";
  return {
    id: row.id,
    externalKey: row.externalKey,
    title: row.title,
    tabTitle: metaString(meta, "tabTitle") ?? row.subtitle ?? null,
    body,
    imageUrl: metaString(meta, "backgroundImageUrl"),
    sortingPriority: metaNumber(meta, "sortingPriority"),
    publishedAt: metaString(meta, "publishedAt"),
  };
}
