"use client";

import type {
  FortniteEventDTO,
  HeatTier,
} from "@fortnite-live-countdown/types";
import { formatCountdownTargetLocal } from "@fortnite-live-countdown/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Orbitron } from "next/font/google";
import { Fragment, useMemo } from "react";

import { CountdownPastStatus } from "@/components/countdown/countdown-past-status";
import { FavoriteStarButton } from "@/components/dashboard/favorite-star-button";
import { useCountdown } from "@/hooks/use-countdown";
import { COUNTDOWN_PAST_SURFACE_CLASS } from "@/lib/countdown-past-surface";

const countdownDigital = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const heatToGlow: Record<HeatTier, string> = {
  "red-intense": "0 0 32px 2px rgba(185, 28, 28, 0.55)",
  "red-soft": "0 0 28px 2px rgba(248, 113, 113, 0.45)",
  "orange-intense": "0 0 28px 2px rgba(194, 65, 12, 0.5)",
  "orange-soft": "0 0 24px 2px rgba(253, 186, 116, 0.4)",
  "blue-intense": "0 0 28px 2px rgba(29, 78, 216, 0.45)",
  "blue-soft": "0 0 22px 2px rgba(147, 197, 253, 0.35)",
};

const heatToHoverGlow: Record<HeatTier, string> = {
  "red-intense":
    "0 0 52px 8px rgba(248, 113, 113, 0.65), 0 0 100px 6px rgba(185, 28, 28, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
  "red-soft":
    "0 0 48px 8px rgba(252, 165, 165, 0.55), 0 0 90px 5px rgba(248, 113, 113, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
  "orange-intense":
    "0 0 50px 8px rgba(251, 146, 60, 0.6), 0 0 95px 5px rgba(194, 65, 12, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
  "orange-soft":
    "0 0 46px 8px rgba(253, 224, 71, 0.45), 0 0 85px 5px rgba(253, 186, 116, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
  "blue-intense":
    "0 0 50px 8px rgba(56, 189, 248, 0.55), 0 0 95px 5px rgba(29, 78, 216, 0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
  "blue-soft":
    "0 0 44px 8px rgba(147, 197, 253, 0.5), 0 0 80px 5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const heatToBorder: Record<HeatTier, string> = {
  "red-intense": "var(--heat-red-intense)",
  "red-soft": "var(--heat-red-soft)",
  "orange-intense": "var(--heat-orange-intense)",
  "orange-soft": "var(--heat-orange-soft)",
  "blue-intense": "var(--heat-blue-intense)",
  "blue-soft": "var(--heat-blue-soft)",
};

const heatToNeon: Record<HeatTier, string> = {
  "red-intense": "#ff4d6d",
  "red-soft": "#fda4af",
  "orange-intense": "#fb923c",
  "orange-soft": "#fde047",
  "blue-intense": "#38bdf8",
  "blue-soft": "#93c5fd",
};

const heatToCellTint: Record<HeatTier, string> = {
  "red-intense": "rgba(255, 77, 109, 0.45)",
  "red-soft": "rgba(253, 164, 175, 0.35)",
  "orange-intense": "rgba(251, 146, 60, 0.42)",
  "orange-soft": "rgba(253, 224, 71, 0.28)",
  "blue-intense": "rgba(56, 189, 248, 0.4)",
  "blue-soft": "rgba(147, 197, 253, 0.32)",
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function backgroundImageFromMetadata(
  metadata: Record<string, unknown>,
): string | undefined {
  const keys = ["backgroundImageUrl", "imageUrl", "tileImageUrl"] as const;
  for (const k of keys) {
    const u = metadata[k];
    if (typeof u === "string" && u.length > 0) return u;
  }
  return undefined;
}

function newsSummaryText(metadata: Record<string, unknown>): string | null {
  const preview =
    typeof metadata.bodyPreview === "string" ? metadata.bodyPreview : "";
  if (preview.length === 0) return null;
  const max = 220;
  return preview.length > max ? `${preview.slice(0, max)}…` : preview;
}

/** Subtitle without “UTC”; BR shop uses the user’s local date/time. */
function displaySubtitleForEvent(event: FortniteEventDTO): string | null {
  const m = event.metadata;
  if (event.source === "shop" && typeof m.shopDate === "string") {
    return `BR • ${formatCountdownTargetLocal(m.shopDate)}`;
  }
  if (event.subtitle == null || event.subtitle.trim() === "") return null;
  const cleaned = event.subtitle
    .replace(/\s*\bUTC\b\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

function buildMetaLines(
  event: FortniteEventDTO,
): { label: string; value: string }[] {
  const m = event.metadata;
  const lines: { label: string; value: string }[] = [
    { label: "Target time", value: formatCountdownTargetLocal(event.targetAt) },
  ];
  if (event.startsAt) {
    lines.push({
      label: "Start time",
      value: formatCountdownTargetLocal(event.startsAt),
    });
  }
  if (event.source === "shop") {
    if (typeof m.entryCount === "number") {
      lines.push({ label: "Entries", value: String(m.entryCount) });
    }
  }
  return lines;
}

export function EventHeroBanner({
  event,
  heat,
  isTopPriority,
}: {
  event: FortniteEventDTO;
  heat: HeatTier;
  isTopPriority: boolean;
}) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(
    event.targetAt,
  );
  const bgUrl = backgroundImageFromMetadata(event.metadata);
  const metaLines = useMemo(() => buildMetaLines(event), [event]);
  const summary = useMemo(
    () => (event.source === "news" ? newsSummaryText(event.metadata) : null),
    [event.metadata, event.source],
  );

  const displaySubtitle = useMemo(
    () => displaySubtitleForEvent(event),
    [event],
  );

  const segments = [
    {
      id: "d",
      value: pad2(days),
      unitLabel: "Days",
      ariaLabel: "Days remaining",
    },
    {
      id: "h",
      value: pad2(hours),
      unitLabel: "Hours",
      ariaLabel: "Hours remaining",
    },
    {
      id: "m",
      value: pad2(minutes),
      unitLabel: "Minutes",
      ariaLabel: "Minutes remaining",
    },
    {
      id: "s",
      value: pad2(seconds),
      unitLabel: "Seconds",
      ariaLabel: "Seconds remaining",
    },
  ] as const;

  const neon = heatToNeon[heat];

  return (
    <motion.article
      className={`group relative overflow-visible rounded-2xl border-2 bg-card/85 shadow-xl backdrop-blur-md transition-all ${
        isTopPriority && !isPast
          ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
          : ""
      } ${isPast ? COUNTDOWN_PAST_SURFACE_CLASS : ""}`}
      style={{ borderColor: heatToBorder[heat] }}
      initial={false}
      animate={{ boxShadow: heatToGlow[heat] }}
      whileHover={
        isPast
          ? undefined
          : {
              boxShadow: heatToHoverGlow[heat],
              scale: 1.008,
              transition: { type: "spring", stiffness: 420, damping: 26 },
            }
      }
    >
      <FavoriteStarButton
        targetType="event"
        targetKey={event.id}
        className="absolute right-2 top-2 z-20 md:right-3 md:top-3"
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden
      >
        {bgUrl ? (
          <div
            className="absolute inset-0 opacity-[0.14] transition-opacity duration-500 group-hover:opacity-[0.22]"
            style={{
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-background/80" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col gap-3 px-4 pb-5 pt-3 md:gap-4 md:px-5 md:pb-6 md:pt-4">
        <header className="w-full min-w-0 space-y-1.5 md:space-y-2">
          {isTopPriority && !isPast ? (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest"
                style={{
                  borderColor: `${neon}66`,
                  color: neon,
                  boxShadow: `0 0 20px ${neon}33`,
                }}
              >
                Next milestone
              </span>
            </div>
          ) : null}
          <h2 className="text-balance text-lg font-black uppercase leading-tight tracking-tight text-card-foreground drop-shadow-sm sm:text-xl lg:text-2xl">
            {event.title}
          </h2>
          {displaySubtitle ? (
            <p className="text-pretty text-sm font-medium text-muted-foreground md:text-base">
              {displaySubtitle}
            </p>
          ) : null}
        </header>

        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-md">
          <div className="w-full min-w-0 overflow-x-auto overflow-y-visible py-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
            <div
              className="mx-auto flex w-full min-w-0 flex-nowrap items-center justify-evenly gap-0.5 px-0.5 sm:gap-2 md:gap-3"
              role="timer"
              aria-live="polite"
              aria-label="Countdown to target (same instant worldwide; dates below in your time zone)"
            >
              {segments.map((seg, index) => (
                <Fragment key={seg.id}>
                  {index > 0 ? (
                    <span
                      className="flex shrink-0 select-none items-center px-0.5 font-black leading-none sm:px-1"
                      style={{
                        color: neon,
                        fontSize: "clamp(1rem, 2.5vw, 1.65rem)",
                        textShadow: `0 0 12px ${neon}99`,
                      }}
                      aria-hidden
                    >
                      :
                    </span>
                  ) : null}
                  <CountdownCell
                    heat={heat}
                    index={index}
                    value={seg.value}
                    unitLabel={seg.unitLabel}
                    ariaLabel={seg.ariaLabel}
                    backgroundUrl={bgUrl}
                    neon={neon}
                  />
                </Fragment>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-md">
            {summary ? (
              <div className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 backdrop-blur-sm md:px-4 md:py-3">
                <p className="text-sm font-medium leading-relaxed text-foreground md:text-base">
                  {summary}
                </p>
              </div>
            ) : null}

            <ul className="flex w-full min-w-0 flex-col gap-1 text-left text-xs md:text-sm">
              {metaLines.map((c) => (
                <li key={c.label} className="break-words">
                  <span className="font-semibold text-foreground">
                    {c.label}:
                  </span>{" "}
                  <span className="text-foreground/95">{c.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isPast ? (
          <CountdownPastStatus kind="event" targetIso={event.targetAt} />
        ) : null}
      </div>
    </motion.article>
  );
}

function CountdownCell({
  heat,
  index,
  value,
  unitLabel,
  ariaLabel,
  backgroundUrl,
  neon,
}: {
  heat: HeatTier;
  index: number;
  value: string;
  unitLabel: string;
  ariaLabel: string;
  backgroundUrl?: string;
  neon: string;
}) {
  const tint = heatToCellTint[heat];

  return (
    <motion.div
      className="relative isolate flex min-h-[4rem] min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 border-white/15 px-1.5 py-1 shadow-lg sm:min-h-[4.25rem] sm:px-2 sm:py-1.5"
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 360,
        damping: 26,
      }}
      style={{
        boxShadow: `0 0 0 1px ${neon}40, 0 16px 40px -10px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.18)`,
      }}
    >
      {backgroundUrl ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-[-20%] bg-cover bg-center opacity-[0.18] blur-lg"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
        </div>
      ) : null}
      <div
        className="absolute inset-0 opacity-50 mix-blend-overlay"
        style={{
          background: `linear-gradient(135deg, ${tint} 0%, transparent 40%, ${neon}18 100%)`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/8 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-0.5">
        <div className="relative w-full overflow-hidden rounded-md px-1 py-0.5 sm:px-1.5 sm:py-0.5">
          <div className="relative flex min-h-[1.55rem] w-full items-center justify-center sm:min-h-[1.7rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={{ y: 10, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -8, opacity: 0, filter: "blur(3px)" }}
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
                className={`${countdownDigital.className} absolute font-bold tabular-nums tracking-[0.12em] text-[#e8f4ff]`}
                style={{
                  fontSize: "clamp(1.1rem, 2.8vw, 1.75rem)",
                  lineHeight: 1,
                  textShadow: `
                    0 0 1px rgba(255,255,255,0.9),
                    0 0 12px ${neon}cc,
                    0 0 22px ${neon}55,
                    0 1px 0 rgba(0,0,0,0.9)
                  `,
                }}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <span className="max-w-full text-center text-[7px] font-semibold uppercase leading-tight tracking-wide text-white/80 sm:text-[8px] md:text-[9px]">
          {unitLabel}
        </span>
      </div>
    </motion.div>
  );
}
