import { and, eq, lt, ne } from "drizzle-orm";

import { fortniteEventHistory, fortniteEvents } from "@/db/schema";
import { getDb } from "@/lib/db";
import { SHOP_ROTATION_EXTERNAL_KEY } from "@/lib/fortnite/shop-rotation";

type Db = ReturnType<typeof getDb>;

async function moveEventToHistory(
  db: Db,
  r: typeof fortniteEvents.$inferSelect,
): Promise<void> {
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
}

/** Moves rows whose `target_at` is older than 24h into history and removes them from `fortnite_event`. */
export async function archiveStaleFortniteEvents(db: Db): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stale = await db
    .select()
    .from(fortniteEvents)
    .where(lt(fortniteEvents.targetAt, cutoff));

  let moved = 0;
  for (const r of stale) {
    await moveEventToHistory(db, r);
    moved += 1;
  }
  return moved;
}

/**
 * Archives legacy per-hash shop rows (`shop:rotation:<hash>`) so only the
 * stable `shop:rotation` event remains on the dashboard.
 */
export async function archiveSupersededShopRotations(db: Db): Promise<number> {
  const superseded = await db
    .select()
    .from(fortniteEvents)
    .where(
      and(
        eq(fortniteEvents.kind, "shop"),
        ne(fortniteEvents.externalKey, SHOP_ROTATION_EXTERNAL_KEY),
      ),
    );

  let moved = 0;
  for (const r of superseded) {
    await moveEventToHistory(db, r);
    moved += 1;
  }
  return moved;
}
