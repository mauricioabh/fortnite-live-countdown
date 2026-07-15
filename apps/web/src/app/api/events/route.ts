import { and, asc, desc, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

import type {
  EventsApiResponse,
  FortniteEventDTO,
  IngestionStatus,
} from "@fortnite-live-countdown/types";

import { fortniteEvents, ingestionRuns } from "@/db/schema";
import { env } from "@/env";
import { getDb } from "@/lib/db";
import { mapEventRowToDto } from "@/lib/events/map-row-to-dto";
import { shopEntryImageUrl } from "@/lib/fortnite/fortnite-images";
import { dedupeShopEventsForDashboard } from "@/lib/fortnite/shop-rotation";

export const dynamic = "force-dynamic";

function isIngestionStatus(value: string): value is IngestionStatus {
  return value === "success" || value === "partial" || value === "failed";
}

const FORTNITE_API_BASE = "https://fortnite-api.com";

function hasBackgroundImage(meta: Record<string, unknown>): boolean {
  const u = meta.backgroundImageUrl;
  return typeof u === "string" && u.length > 0;
}

function apiHeaders(apiKey: string | undefined): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = apiKey;
  return headers;
}

async function hydrateEventBackgrounds(
  events: FortniteEventDTO[],
  apiKey: string | undefined,
): Promise<FortniteEventDTO[]> {
  let next = events;

  const needsShop = next.some(
    (e) => e.source === "shop" && !hasBackgroundImage(e.metadata),
  );
  if (needsShop) {
    try {
      const res = await fetch(`${FORTNITE_API_BASE}/v2/shop`, {
        headers: apiHeaders(apiKey),
        cache: "no-store",
      });
      if (!res.ok) return next;
      const payload = (await res.json()) as {
        data?: { hash?: string; entries?: Record<string, unknown>[] };
      };
      const hash = payload?.data?.hash;
      const first = payload?.data?.entries?.[0];
      const bgUrl = first ? shopEntryImageUrl(first) : null;
      if (!bgUrl || typeof hash !== "string") return next;
      next = next.map((e) => {
        if (e.source !== "shop" || hasBackgroundImage(e.metadata)) return e;
        const rowHash = e.metadata.hash;
        if (typeof rowHash === "string" && rowHash === hash) {
          return {
            ...e,
            metadata: { ...e.metadata, backgroundImageUrl: bgUrl },
          };
        }
        return e;
      });
    } catch {
      /* ignore shop hydration */
    }
  }

  return next;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(fortniteEvents)
      .where(
        and(
          eq(fortniteEvents.visible, true),
          ne(fortniteEvents.source, "news"),
        ),
      )
      .orderBy(asc(fortniteEvents.sortPriority), asc(fortniteEvents.targetAt));

    const last = await db
      .select()
      .from(ingestionRuns)
      .orderBy(desc(ingestionRuns.finishedAt))
      .limit(1);

    const lastRow = last[0];
    const mapped = dedupeShopEventsForDashboard(rows).map(mapEventRowToDto);
    const events = await hydrateEventBackgrounds(mapped, env.FORTNITE_API_KEY);
    const body: EventsApiResponse = {
      events,
      lastIngest: lastRow
        ? {
            finishedAt: lastRow.finishedAt
              ? lastRow.finishedAt.toISOString()
              : null,
            status: isIngestionStatus(lastRow.status)
              ? lastRow.status
              : "failed",
            eventsUpserted: lastRow.eventsUpserted,
          }
        : null,
    };

    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("DATABASE_URL")) {
      const empty: EventsApiResponse = { events: [], lastIngest: null };
      return NextResponse.json(empty, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
