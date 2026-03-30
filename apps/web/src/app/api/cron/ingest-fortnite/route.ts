import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { ingestionRuns, fortniteEvents } from "@/db/schema";
import { env } from "@/env";
import { archiveStaleFortniteEvents } from "@/lib/db/archive-stale-events";
import { getDb } from "@/lib/db";
import { buildIngestRows } from "@/lib/fortnite/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const secret = env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return unauthorized();
  }

  let db;
  try {
    db = getDb();
  } catch {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const [run] = await db
    .insert(ingestionRuns)
    .values({
      status: "partial",
      eventsUpserted: 0,
    })
    .returning();

  if (!run) {
    return NextResponse.json(
      { error: "Could not start ingestion run" },
      { status: 500 },
    );
  }

  const { rows, errors } = await buildIngestRows(env.FORTNITE_API_KEY);

  if (rows.length === 0) {
    await db
      .update(ingestionRuns)
      .set({
        finishedAt: new Date(),
        status: errors.length > 0 ? "failed" : "partial",
        errorMessage: errors.join(" | ") || "No rows produced",
        eventsUpserted: 0,
      })
      .where(eq(ingestionRuns.id, run.id));

    return NextResponse.json(
      {
        ok: false,
        eventsUpserted: 0,
        errors,
      },
      { status: errors.length > 0 ? 502 : 200 },
    );
  }

  try {
    for (const row of rows) {
      await db
        .insert(fortniteEvents)
        .values(row)
        .onConflictDoUpdate({
          target: fortniteEvents.externalKey,
          set: {
            kind: row.kind,
            title: row.title,
            subtitle: row.subtitle,
            targetAt: row.targetAt,
            startsAt: row.startsAt,
            metadata: row.metadata,
            source: row.source,
            sortPriority: row.sortPriority,
            visible: row.visible,
            updatedAt: new Date(),
          },
        });
    }

    const archived = await archiveStaleFortniteEvents(db);

    const status = errors.length > 0 ? "partial" : "success";
    await db
      .update(ingestionRuns)
      .set({
        finishedAt: new Date(),
        status,
        errorMessage: errors.length > 0 ? errors.join(" | ") : null,
        eventsUpserted: rows.length,
      })
      .where(eq(ingestionRuns.id, run.id));

    return NextResponse.json({
      ok: true,
      eventsUpserted: rows.length,
      archived,
      warnings: errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db
      .update(ingestionRuns)
      .set({
        finishedAt: new Date(),
        status: "failed",
        errorMessage: message,
        eventsUpserted: 0,
      })
      .where(eq(ingestionRuns.id, run.id));

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** Manual POST with same auth as GET (local triggers). */
export async function POST(request: Request) {
  return GET(request);
}
