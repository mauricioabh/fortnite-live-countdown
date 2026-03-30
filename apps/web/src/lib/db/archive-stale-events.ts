import { eq, lt } from "drizzle-orm";

import { fortniteEventHistory, fortniteEvents } from "@/db/schema";
import { getDb } from "@/lib/db";

/** Moves rows whose `target_at` is older than 24h into history and removes them from `fortnite_event`. */
export async function archiveStaleFortniteEvents(
  db: ReturnType<typeof getDb>,
): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stale = await db
    .select()
    .from(fortniteEvents)
    .where(lt(fortniteEvents.targetAt, cutoff));

  let moved = 0;
  for (const r of stale) {
    await db.insert(fortniteEventHistory).values({
      originalEventId: r.id,
      externalKey: r.externalKey,
      kind: r.kind,
      title: r.title,
      subtitle: r.subtitle,
      targetAt: r.targetAt,
      startsAt: r.startsAt,
      metadata: r.metadata,
      source: r.source,
      sortPriority: r.sortPriority,
    });
    await db.delete(fortniteEvents).where(eq(fortniteEvents.id, r.id));
    moved += 1;
  }
  return moved;
}
