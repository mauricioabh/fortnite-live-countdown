/** Shared URL extraction for Fortnite API payloads (ingest + /api/events hydration). */

const SKIP_WALK_KEYS = new Set(["body"]);

export function coerceHttpUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return null;
}

export function imageUrlFromNested(raw: unknown): string | null {
  if (raw == null) return null;
  const asString = coerceHttpUrl(raw);
  if (asString) return asString;
  if (typeof raw === "object" && raw !== null && "url" in raw) {
    return coerceHttpUrl((raw as { url: unknown }).url);
  }
  return null;
}

function isLikelyImageUrl(s: string): boolean {
  if (!/^https?:\/\//i.test(s)) return false;
  if (/\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i.test(s)) return true;
  if (
    /epicgames|fortnite-api\.com|akamaized|unrealengine|prm\.ol\.epicgames|cdn\.fortnite/i.test(
      s,
    )
  ) {
    return true;
  }
  return false;
}

function deepExtractImageUrl(root: unknown, maxDepth: number): string | null {
  const found: string[] = [];

  function walk(val: unknown, depth: number): void {
    if (depth <= 0 || val == null) return;
    if (typeof val === "string") {
      if (isLikelyImageUrl(val)) found.push(val);
      return;
    }
    if (Array.isArray(val)) {
      for (const item of val) walk(item, depth - 1);
      return;
    }
    if (typeof val === "object") {
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (SKIP_WALK_KEYS.has(k)) continue;
        walk(v, depth - 1);
      }
    }
  }

  walk(root, maxDepth);
  return found[0] ?? null;
}

/** Image for a single BR MOTD object from /v2/news. */
export function motdImageUrl(m: Record<string, unknown>): string | null {
  return (
    imageUrlFromNested(m.image) ??
    imageUrlFromNested(m.tileImage) ??
    imageUrlFromNested(
      (m.spotlight as Record<string, unknown> | undefined)?.image,
    ) ??
    deepExtractImageUrl(m, 6)
  );
}

/** BR news section banner (shared GIF/JPEG) — fallback when a MOTD has no dedicated art. */
export function brNewsBannerUrl(br: Record<string, unknown>): string | null {
  return imageUrlFromNested(br.image);
}

export function shopEntryImageUrl(
  entry: Record<string, unknown>,
): string | null {
  const tracks = entry.tracks;
  if (Array.isArray(tracks) && tracks.length > 0) {
    const firstTrack = tracks[0] as Record<string, unknown>;
    const trackImages = firstTrack.images as
      | Record<string, unknown>
      | undefined;
    const trackImage =
      imageUrlFromNested(trackImages?.smallArt) ??
      imageUrlFromNested(trackImages?.albumArt) ??
      imageUrlFromNested(trackImages?.featuredImage) ??
      imageUrlFromNested(trackImages?.featured) ??
      imageUrlFromNested(trackImages?.smallIcon) ??
      imageUrlFromNested(firstTrack.albumArt) ??
      imageUrlFromNested(firstTrack.coverArt) ??
      imageUrlFromNested(firstTrack.image);
    if (trackImage) return trackImage;
  }
  const brItems = entry.brItems;
  if (Array.isArray(brItems) && brItems.length > 0) {
    const first = brItems[0] as Record<string, unknown>;
    const images = first.images as Record<string, unknown> | undefined;
    if (images) {
      const fromBr =
        imageUrlFromNested(images.smallArt) ??
        imageUrlFromNested(images.large) ??
        imageUrlFromNested(images.background) ??
        imageUrlFromNested(images.featuredImage) ??
        imageUrlFromNested(images.featured) ??
        imageUrlFromNested(images.icon) ??
        imageUrlFromNested(images.smallIcon);
      if (fromBr) return fromBr;
    }
  }
  const nda = entry.newDisplayAsset as Record<string, unknown> | undefined;
  const renderImages = nda?.renderImages;
  if (Array.isArray(renderImages) && renderImages.length > 0) {
    const firstImg = renderImages[0] as Record<string, unknown>;
    const u = imageUrlFromNested(firstImg.image);
    if (u) return u;
  }
  return deepExtractImageUrl(entry, 5);
}

export function buildNewsMotdImageMapFromJson(json: unknown): {
  byNewsId: Map<string, string>;
  brFallback: string | null;
} {
  const byNewsId = new Map<string, string>();
  const root = json as { data?: { br?: Record<string, unknown> } };
  const br = root?.data?.br;
  if (!br || typeof br !== "object") return { byNewsId, brFallback: null };

  const brFallback = brNewsBannerUrl(br);
  const motds = br.motds;
  if (!Array.isArray(motds)) return { byNewsId, brFallback };

  for (const raw of motds) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as Record<string, unknown>;
    const id = m.id;
    if (typeof id !== "string") continue;
    const url = motdImageUrl(m) ?? brFallback;
    if (url) byNewsId.set(id, url);
  }
  return { byNewsId, brFallback };
}
