import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import type {
  HistoryApiResponse,
  HistoryEventDTO,
} from "@fortnite-live-countdown/types";

import { fortniteEventHistory } from "@/db/schema";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const LIMIT = 500;

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(fortniteEventHistory)
      .orderBy(desc(fortniteEventHistory.archivedAt))
      .limit(LIMIT);

    const mapped: HistoryEventDTO[] = rows.map((r) => ({
      id: r.id,
      archivedAt: r.archivedAt.toISOString(),
      originalEventId: r.originalEventId,
      externalKey: r.externalKey,
      kind: r.kind,
      title: r.title,
      subtitle: r.subtitle,
      targetAt: r.targetAt.toISOString(),
      startsAt: r.startsAt ? r.startsAt.toISOString() : null,
      source: r.source,
      sortPriority: r.sortPriority,
    }));

    const body: HistoryApiResponse = { rows: mapped };
    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("DATABASE_URL")) {
      const empty: HistoryApiResponse = { rows: [] };
      return NextResponse.json(empty, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
