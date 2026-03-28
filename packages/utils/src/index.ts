import { differenceInMilliseconds } from "date-fns";

import type { HeatTier } from "@fortnite-live-countdown/types";

const HEAT_ORDER: HeatTier[] = [
  "red-intense",
  "red-soft",
  "orange-intense",
  "orange-soft",
  "blue-intense",
  "blue-soft",
];

/** Milliseconds from now until target ISO string (both instants are UTC-safe). */
export function msUntilUtc(targetIso: string, nowMs: number = Date.now()): number {
  return differenceInMilliseconds(new Date(targetIso), new Date(nowMs));
}

/**
 * Assign heat tiers by relative urgency among visible events (0 = soonest).
 * Single event maps to the most urgent stop.
 */
export function heatTierForIndex(index: number, total: number): HeatTier {
  if (total <= 0) return "blue-soft";
  if (total === 1) return "red-intense";
  const maxIdx = HEAT_ORDER.length - 1;
  const t = total > 1 ? index / (total - 1) : 0;
  const stop = Math.round(t * maxIdx);
  return HEAT_ORDER[stop] ?? "blue-soft";
}

export interface CountdownParts {
  totalMs: number;
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Break remaining milliseconds into non-negative parts (UTC clock display). */
export function splitCountdownMs(remainingMs: number): Omit<CountdownParts, "totalMs" | "isPast"> {
  const safe = Math.max(0, remainingMs);
  const days = Math.floor(safe / 86_400_000);
  let rest = safe - days * 86_400_000;
  const hours = Math.floor(rest / 3_600_000);
  rest -= hours * 3_600_000;
  const minutes = Math.floor(rest / 60_000);
  rest -= minutes * 60_000;
  const seconds = Math.floor(rest / 1000);
  return { days, hours, minutes, seconds };
}

export function countdownPartsFromTarget(
  targetIso: string,
  nowMs: number = Date.now(),
): CountdownParts {
  const totalMs = msUntilUtc(targetIso, nowMs);
  const isPast = totalMs <= 0;
  const parts = splitCountdownMs(totalMs);
  return { totalMs, isPast, ...parts };
}

/** Human-readable local formatting for ISO instants (countdown targets, references). */
export function formatCountdownTargetLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

export type CountdownPastSurfaceKind = "event" | "offer";

/**
 * Unified copy when the countdown is in the past (hero events vs shop/Jam offers).
 * Offers: includes "Expired" and "window closed" plus the time reference.
 */
export function getCountdownPastStatusText(kind: CountdownPastSurfaceKind, targetIso: string): string {
  const ref = formatCountdownTargetLocal(targetIso);
  if (kind === "event") {
    return `Past event · reference: ${ref}`;
  }
  return `Expired · window closed · reference: ${ref}`;
}
