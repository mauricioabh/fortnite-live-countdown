import { and, asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import type {
  IngestionStatus,
  NewsApiResponse,
  NewsItemDTO,
} from "@fortnite-live-countdown/types";

import { fortniteEvents, ingestionRuns } from "@/db/schema";
import { env } from "@/env";
import { getDb } from "@/lib/db";
import { buildNewsMotdImageMapFromJson } from "@/lib/fortnite/fortnite-images";
import { mapEventRowToNewsDto } from "@/lib/news/map-row-to-news-dto";

export const dynamic = "force-dynamic";

function isIngestionStatus(value: string): value is IngestionStatus {
  return value === "success" || value === "partial" || value === "failed";
}

const FORTNITE_API_BASE = "https://fortnite-api.com";
const NEWS_IMAGE_CACHE_MS = 4 * 60 * 1000;

let newsImageCache: {
  expiresAt: number;
  byNewsId: Map<string, string>;
  brFallback: string | null;
} | null = null;

function apiHeaders(apiKey: string | undefined): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = apiKey;
  return headers;
}

async function getNewsImageLookup(apiKey: string | undefined) {
  const now = Date.now();
  if (newsImageCache && newsImageCache.expiresAt > now) {
    return newsImageCache;
  }
  const res = await fetch(`${FORTNITE_API_BASE}/v2/news`, {
    headers: apiHeaders(apiKey),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as unknown;
  const { byNewsId, brFallback } = buildNewsMotdImageMapFromJson(json);
  newsImageCache = {
    expiresAt: now + NEWS_IMAGE_CACHE_MS,
    byNewsId,
    brFallback,
  };
  return newsImageCache;
}

async function hydrateNewsImages(
  items: NewsItemDTO[],
  apiKey: string | undefined,
): Promise<NewsItemDTO[]> {
  const needs = items.some((i) => !i.imageUrl);
  if (!needs) return items;
  const lookup = await getNewsImageLookup(apiKey);
  if (!lookup) return items;
  return items.map((item) => {
    if (item.imageUrl) return item;
    const newsId = item.externalKey.startsWith("news:")
      ? item.externalKey.slice("news:".length)
      : null;
    const url =
      (newsId ? lookup.byNewsId.get(newsId) : null) ?? lookup.brFallback;
    if (!url) return item;
    return { ...item, imageUrl: url };
  });
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
          eq(fortniteEvents.source, "news"),
        ),
      )
      .orderBy(asc(fortniteEvents.sortPriority));

    const last = await db
      .select()
      .from(ingestionRuns)
      .orderBy(desc(ingestionRuns.finishedAt))
      .limit(1);

    const lastRow = last[0];
    const mapped = rows.map(mapEventRowToNewsDto);
    const items = await hydrateNewsImages(mapped, env.FORTNITE_API_KEY);
    const body: NewsApiResponse = {
      items,
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
      const empty: NewsApiResponse = { items: [], lastIngest: null };
      return NextResponse.json(empty, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
