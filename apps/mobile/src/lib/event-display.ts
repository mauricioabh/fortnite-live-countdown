import type { FortniteEventDTO } from "@fortnite-live-countdown/types";
import { formatCountdownTargetLocal } from "@fortnite-live-countdown/utils";

export function backgroundImageFromMetadata(metadata: Record<string, unknown>): string | undefined {
  const keys = ["backgroundImageUrl", "imageUrl", "tileImageUrl"] as const;
  for (const k of keys) {
    const u = metadata[k];
    if (typeof u === "string" && u.length > 0) return u;
  }
  return undefined;
}

export function newsSummaryText(metadata: Record<string, unknown>): string | null {
  const preview = typeof metadata.bodyPreview === "string" ? metadata.bodyPreview : "";
  if (preview.length === 0) return null;
  const max = 220;
  return preview.length > max ? `${preview.slice(0, max)}…` : preview;
}

export function displaySubtitleForEvent(ev: FortniteEventDTO): string | null {
  const m = ev.metadata;
  if (ev.source === "shop" && typeof m.shopDate === "string") {
    return `BR • ${formatCountdownTargetLocal(m.shopDate)}`;
  }
  if (ev.subtitle == null || ev.subtitle.trim() === "") return null;
  const cleaned = ev.subtitle
    .replace(/\s*\bUTC\b\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function buildMetaLines(event: FortniteEventDTO): { label: string; value: string }[] {
  const m = event.metadata;
  const lines: { label: string; value: string }[] = [
    { label: "Target time", value: formatCountdownTargetLocal(event.targetAt) },
  ];
  if (event.startsAt) {
    lines.push({ label: "Start time", value: formatCountdownTargetLocal(event.startsAt) });
  }
  if (event.source === "shop") {
    if (typeof m.entryCount === "number") {
      lines.push({ label: "Entries", value: String(m.entryCount) });
    }
  }
  return lines;
}
