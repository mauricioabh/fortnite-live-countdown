import type {
  FortniteEventDTO,
  FortniteEventKind,
} from "@fortnite-live-countdown/types";

import type { FortniteEventRow } from "@/db/schema";

const KINDS = new Set<FortniteEventKind>([
  "live_event",
  "season",
  "chapter",
  "patch",
  "competitive",
  "shop",
  "other",
]);

function parseKind(value: string): FortniteEventKind {
  return (
    KINDS.has(value as FortniteEventKind) ? value : "other"
  ) as FortniteEventKind;
}

export function mapEventRowToDto(row: FortniteEventRow): FortniteEventDTO {
  return {
    id: row.id,
    kind: parseKind(row.kind),
    title: row.title,
    subtitle: row.subtitle ?? null,
    targetAt: row.targetAt.toISOString(),
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    metadata: row.metadata,
    source: row.source,
    sortPriority: row.sortPriority,
  };
}
