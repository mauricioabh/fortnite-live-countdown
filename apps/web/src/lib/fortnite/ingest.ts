import { addMinutes, parseISO } from "date-fns";

import type { FortniteEventKind } from "@fortnite-live-countdown/types";

import type { FortniteEventInsert } from "@/db/schema";
import { brItemCategoryFromRaw } from "@/lib/fortnite/br-item-category";
import {
  brNewsBannerUrl,
  imageUrlFromNested,
  motdImageUrl,
  shopEntryImageUrl,
} from "@/lib/fortnite/fortnite-images";
import { newsResponseSchema, shopResponseSchema } from "@/lib/fortnite/schemas";

const BASE = "https://fortnite-api.com";

interface CosmeticLookupValue {
  category: string | null;
  imageUrl: string | null;
}

interface CosmeticLookup {
  byId: Map<string, CosmeticLookupValue>;
  byName: Map<string, CosmeticLookupValue>;
}

function apiHeaders(apiKey: string | undefined): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = apiKey;
  return headers;
}

async function fetchJson(
  url: string,
  apiKey: string | undefined,
): Promise<unknown> {
  const res = await fetch(url, {
    headers: apiHeaders(apiKey),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`Fortnite API ${url} failed: ${res.status}`);
  }
  return res.json() as Promise<unknown>;
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function categoryFromCosmeticType(type: unknown): string | null {
  if (!type || typeof type !== "object") return null;
  const t = type as {
    backendValue?: unknown;
    displayValue?: unknown;
    value?: unknown;
    id?: unknown;
  };
  const raw =
    (typeof t.value === "string" ? t.value : null) ??
    (typeof t.backendValue === "string" ? t.backendValue : null) ??
    (typeof t.id === "string" ? t.id : null) ??
    (typeof t.displayValue === "string" ? t.displayValue : null);
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (key.includes("athenacharacter")) return "Outfit";
  if (key.includes("athenaitemwrap")) return "Wrap";
  if (key.includes("athenadance") || key.includes("emote")) return "Emote";
  if (key.includes("athenapickaxe")) return "Pickaxe";
  if (key.includes("musictrack") || key.includes("jamtrack"))
    return "Jam track";
  return null;
}

function imageFromCosmeticImages(images: unknown): string | null {
  if (!images || typeof images !== "object") return null;
  const i = images as Record<string, unknown>;
  return (
    imageUrlFromNested(i.albumArt) ??
    imageUrlFromNested(i.icon) ??
    imageUrlFromNested(i.featuredImage) ??
    imageUrlFromNested(i.featured) ??
    imageUrlFromNested(i.smallIcon)
  );
}

async function buildCosmeticLookup(
  apiKey: string | undefined,
): Promise<CosmeticLookup> {
  const byId = new Map<string, CosmeticLookupValue>();
  const byName = new Map<string, CosmeticLookupValue>();
  try {
    const cosmeticsJson = await fetchJson(`${BASE}/v2/cosmetics/br`, apiKey);
    const root = cosmeticsJson as { data?: unknown };
    const data = root.data;
    if (!Array.isArray(data)) return { byId, byName };
    for (const raw of data) {
      if (!raw || typeof raw !== "object") continue;
      const c = raw as Record<string, unknown>;
      const id = typeof c.id === "string" ? normalizeLookupKey(c.id) : null;
      const name =
        typeof c.name === "string" ? normalizeLookupKey(c.name) : null;
      const value: CosmeticLookupValue = {
        category: categoryFromCosmeticType(c.type),
        imageUrl: imageFromCosmeticImages(c.images),
      };
      if (id) byId.set(id, value);
      if (name) byName.set(name, value);
    }
  } catch {
    // Cosmetics enrichment is optional; shop ingest must still succeed.
  }
  return { byId, byName };
}

function entryLabeledItems(
  entry: Record<string, unknown>,
  lookup: CosmeticLookup,
): { text: string; category: string | null }[] {
  const out: { text: string; category: string | null }[] = [];
  const tracks = entry.tracks;
  if (Array.isArray(tracks)) {
    for (const raw of tracks) {
      if (!raw || typeof raw !== "object") continue;
      const t = raw as { title?: string; artist?: string };
      const title = t.title?.trim();
      if (!title) continue;
      const text = t.artist ? `${title} — ${t.artist}` : title;
      out.push({ text, category: "Jam track" });
    }
  }
  const brItems = entry.brItems;
  const layoutName = (
    (entry.layout as { name?: string } | undefined)?.name ?? ""
  ).toUpperCase();
  if (Array.isArray(brItems)) {
    for (const raw of brItems) {
      if (!raw || typeof raw !== "object") continue;
      const br = raw as Record<string, unknown>;
      const n = typeof br.name === "string" ? br.name.trim() : "";
      if (!n) continue;
      const byId =
        typeof br.id === "string"
          ? lookup.byId.get(normalizeLookupKey(br.id))
          : undefined;
      const byName = lookup.byName.get(normalizeLookupKey(n));
      const guessed =
        brItemCategoryFromRaw(br) ??
        byId?.category ??
        byName?.category ??
        (layoutName.includes("BUNDLE") || layoutName.includes("SET")
          ? "Bundle / set"
          : layoutName.includes("EMOTE") || layoutName.includes("VIBES")
            ? "Emote"
            : layoutName.includes("PICKAXE") || layoutName.includes("HARVEST")
              ? "Pickaxe"
              : layoutName.includes("WRAP")
                ? "Wrap"
                : layoutName.includes("OUTFIT") ||
                    layoutName.includes("BATTLE READY")
                  ? "Outfit"
                  : null);
      out.push({ text: n, category: guessed });
    }
  }
  if (out.length === 0 && typeof entry.devName === "string") {
    const cleaned = entry.devName.replace(/^\[VIRTUAL\]\d+\s*x\s*/i, "").trim();
    if (cleaned) out.push({ text: cleaned, category: null });
  }
  return out;
}

function entryVbucks(entry: Record<string, unknown>): number | null {
  const candidates: unknown[] = [];
  candidates.push(entry.finalPrice, entry.regularPrice);
  const brItems = entry.brItems;
  if (Array.isArray(brItems) && brItems.length > 0) {
    const first = brItems[0] as Record<string, unknown>;
    const price = first.price as Record<string, unknown> | undefined;
    candidates.push(price?.finalPrice, price?.regularPrice, first.finalPrice);
  }
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c))
      return Math.max(0, Math.round(c));
    if (typeof c === "string" && /^\d+$/.test(c)) return parseInt(c, 10);
  }
  return null;
}

/**
 * Epic groups the shop in `layout.name` (e.g. JAM TRACKS, VICTORY VIBES).
 * Tracks use `tracks[]`; outfits/emotes in `brItems` (type in raw JSON when present).
 */
function shopOfferSectionFromEntry(
  entry: Record<string, unknown>,
): "jam" | "other" {
  const tracks = entry.tracks;
  if (Array.isArray(tracks) && tracks.length > 0) return "jam";
  const brItems = entry.brItems;
  if (Array.isArray(brItems)) {
    for (const raw of brItems) {
      if (!raw || typeof raw !== "object") continue;
      const cat = brItemCategoryFromRaw(raw as Record<string, unknown>);
      if (cat?.toLowerCase() === "jam track") return "jam";
    }
  }
  return "other";
}

function shopOfferCardFromEntry(
  entry: Record<string, unknown>,
  lookup: CosmeticLookup,
  hash: string,
  idx: number,
): {
  id: string;
  title: string;
  subtitle: string | null;
  targetAt: string;
  layoutName: string | null;
  items: string[];
  labeledItems: { text: string; category: string | null }[];
  offerSection: "jam" | "other";
  imageUrl: string | null;
  vbucks: number | null;
} {
  const labeledItems = entryLabeledItems(entry, lookup);
  const items = labeledItems.map((l) => l.text);
  const layoutObj = entry.layout as { name?: string } | undefined;
  const layoutName =
    typeof layoutObj?.name === "string" ? layoutObj.name : null;
  const outDate = entry.outDate;
  if (typeof outDate !== "string") {
    throw new Error("shop entry missing outDate");
  }
  let title: string;
  if (items.length === 0) {
    title = layoutName ?? "Offer";
  } else if (items.length === 1) {
    title = items[0]!;
  } else {
    title = layoutName ?? `Bundle · ${items.length} items`;
  }
  let imageUrl = shopEntryImageUrl(entry);
  if (!imageUrl) {
    const tracks = entry.tracks;
    if (Array.isArray(tracks) && tracks.length > 0) {
      const firstTrack = tracks[0] as Record<string, unknown>;
      const trackId = typeof firstTrack.id === "string" ? firstTrack.id : null;
      const trackTitle =
        typeof firstTrack.title === "string" ? firstTrack.title : null;
      imageUrl =
        (trackId
          ? lookup.byId.get(normalizeLookupKey(trackId))?.imageUrl
          : null) ??
        (trackTitle
          ? lookup.byName.get(normalizeLookupKey(trackTitle))?.imageUrl
          : null) ??
        null;
    }
  }
  const vbucks = entryVbucks(entry);
  return {
    id: `op-${hash}-${idx}`,
    title,
    subtitle: layoutName,
    targetAt: parseISO(outDate).toISOString(),
    layoutName,
    items,
    labeledItems,
    offerSection: shopOfferSectionFromEntry(entry),
    imageUrl: imageUrl ?? null,
    vbucks,
  };
}

export interface IngestBuildResult {
  rows: FortniteEventInsert[];
  errors: string[];
}

export async function buildIngestRows(
  apiKey: string | undefined,
): Promise<IngestBuildResult> {
  const errors: string[] = [];
  const rows: FortniteEventInsert[] = [];

  let newsParsed: ReturnType<typeof newsResponseSchema.safeParse> | null = null;
  let shopParsed: ReturnType<typeof shopResponseSchema.safeParse> | null = null;
  const cosmeticLookup = await buildCosmeticLookup(apiKey);

  try {
    const newsJson = await fetchJson(`${BASE}/v2/news`, apiKey);
    newsParsed = newsResponseSchema.safeParse(newsJson);
    if (!newsParsed.success) {
      errors.push(`news: ${newsParsed.error.message}`);
    }
  } catch (e) {
    errors.push(`news: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const shopJson = await fetchJson(`${BASE}/v2/shop`, apiKey);
    shopParsed = shopResponseSchema.safeParse(shopJson);
    if (!shopParsed.success) {
      errors.push(`shop: ${shopParsed.error.message}`);
    }
  } catch (e) {
    errors.push(`shop: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (shopParsed?.success) {
    const { data } = shopParsed.data;
    const entries = data.entries;
    const rotationTarget =
      entries.length > 0
        ? entries.reduce((latest, e) => {
            const t = parseISO(e.outDate).getTime();
            return t > latest ? t : latest;
          }, parseISO(entries[0]!.outDate).getTime())
        : parseISO(data.date).getTime();

    const rotationIso = new Date(rotationTarget).toISOString();

    const shopOfferCards = entries.map((entry, idx) =>
      shopOfferCardFromEntry(
        entry as unknown as Record<string, unknown>,
        cosmeticLookup,
        data.hash,
        idx,
      ),
    );
    const shopBg = entries[0]
      ? shopEntryImageUrl(entries[0] as Record<string, unknown>)
      : null;
    const vbuckIcon =
      typeof data.vbuckIcon === "string" ? data.vbuckIcon : null;

    rows.push({
      externalKey: `shop:rotation:${data.hash}`,
      kind: "shop" satisfies FortniteEventKind,
      title: "Item Shop rotation",
      subtitle: `BR • ${data.date.slice(0, 10)}`,
      targetAt: new Date(rotationIso),
      startsAt: entries[0]?.inDate ? parseISO(entries[0].inDate) : null,
      metadata: {
        hash: data.hash,
        shopDate: data.date,
        entryCount: entries.length,
        dailyOps: shopOfferCards,
        ...(vbuckIcon ? { vbuckIcon } : {}),
        ...(shopBg ? { backgroundImageUrl: shopBg } : {}),
      },
      source: "shop",
      sortPriority: 0,
      visible: true,
    });
  }

  if (newsParsed?.success) {
    const br = newsParsed.data.data.br;
    const brRecord = br as unknown as Record<string, unknown>;
    const brBannerFallback = brNewsBannerUrl(brRecord);
    const baseDate = parseISO(br.date);
    const motds = [...(br.motds ?? [])]
      .filter((m) => !m.hidden)
      .sort((a, b) => (b.sortingPriority ?? 0) - (a.sortingPriority ?? 0))
      .slice(0, 6);

    motds.forEach((m, index) => {
      const priority = m.sortingPriority ?? 100 - index;
      const targetAt = addMinutes(baseDate, Math.max(30, 720 - priority));
      const motdRecord = m as Record<string, unknown>;
      const newsBg = motdImageUrl(motdRecord) ?? brBannerFallback;
      rows.push({
        externalKey: `news:${m.id}`,
        kind: "other" satisfies FortniteEventKind,
        title: m.title,
        subtitle: m.tabTitle ?? null,
        targetAt,
        startsAt: null,
        metadata: {
          newsId: m.id,
          bodyPreview: (m.body ?? "").slice(0, 280),
          sortingPriority: m.sortingPriority ?? null,
          ...(newsBg ? { backgroundImageUrl: newsBg } : {}),
        },
        source: "news",
        sortPriority: 10 + index,
        visible: true,
      });
    });
  }

  return { rows, errors };
}
