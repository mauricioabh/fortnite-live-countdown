"use client";

import { useQuery } from "@tanstack/react-query";
import { Fragment, useMemo } from "react";
import type {
  ShopOfferCardDTO,
  ShopOfferSection,
  ShopOffersResponse,
} from "@fortnite-live-countdown/types";
import {
  msUntilUtc,
  type CountdownParts,
} from "@fortnite-live-countdown/utils";

import { CountdownPastStatus } from "@/components/countdown/countdown-past-status";
import { FavoriteStarButton } from "@/components/dashboard/favorite-star-button";
import { useCountdown } from "@/hooks/use-countdown";
import { COUNTDOWN_PAST_SURFACE_CLASS } from "@/lib/countdown-past-surface";
import { isJamOfferCard, isOtherShopOfferCard } from "@/lib/shop/offer-section";

async function fetchShopOffers(): Promise<ShopOffersResponse> {
  const res = await fetch("/api/shop/daily-ops", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load the Item Shop");
  return res.json() as Promise<ShopOffersResponse>;
}

function labeledFromCard(
  card: ShopOfferCardDTO,
): { text: string; category: string | null }[] {
  if (card.labeledItems && card.labeledItems.length > 0)
    return card.labeledItems;
  return card.items.map((text) => ({ text, category: null as string | null }));
}

function splitTrack(line: string): { song: string; artist: string | null } {
  const parts = line.split(" — ");
  if (parts.length < 2) return { song: line, artist: null };
  const song = parts.slice(0, -1).join(" — ").trim();
  const artist = parts[parts.length - 1]?.trim() ?? null;
  return {
    song: song || line,
    artist: artist && artist.length > 0 ? artist : null,
  };
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

const shopCardBase =
  "group relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card/90 to-card/70 shadow-lg shadow-black/20 backdrop-blur-md";

const shopCardHover =
  "transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/45 hover:shadow-2xl hover:shadow-primary/15 hover:ring-2 hover:ring-primary/20 active:translate-y-0 active:scale-[0.99] active:shadow-lg";

const jamCardHover =
  "transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.02] hover:border-sky-400/40 hover:shadow-2xl hover:shadow-sky-500/20 hover:ring-2 hover:ring-sky-400/25 active:translate-y-0 active:scale-[0.99] active:shadow-lg";

function MiniBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 flex-1 rounded-md border border-border/80 bg-secondary/40 px-1 py-1 text-center transition-colors duration-300 group-hover:border-primary/35 group-hover:bg-secondary/55 sm:px-2">
      <div className="text-base font-semibold tabular-nums sm:text-lg">
        {pad2(value)}
      </div>
      <div className="text-[8px] font-medium uppercase leading-tight text-foreground/80 sm:text-[9px]">
        {label}
      </div>
    </div>
  );
}

function CountdownRow({
  parts,
  targetIso,
}: {
  parts: CountdownParts;
  targetIso: string;
}) {
  const { days, hours, minutes, seconds, isPast } = parts;
  const segments = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ] as const;

  return (
    <>
      <div
        className="mt-auto flex w-full min-w-0 flex-nowrap items-center justify-center gap-0 font-mono text-sm tabular-nums"
        role="timer"
        aria-live="polite"
      >
        {segments.map((seg, index) => (
          <Fragment key={seg.label}>
            {index > 0 ? (
              <span
                className="flex shrink-0 select-none items-center px-0.5 text-sm font-black leading-none text-primary sm:text-base"
                aria-hidden
              >
                :
              </span>
            ) : null}
            <MiniBlock label={seg.label} value={seg.value} />
          </Fragment>
        ))}
      </div>
      {isPast ? (
        <CountdownPastStatus
          kind="offer"
          targetIso={targetIso}
          className="mt-3 text-center"
        />
      ) : null}
    </>
  );
}

function PriceRow({
  price,
  vbuckIcon,
}: {
  price?: number | null;
  vbuckIcon?: string | null;
}) {
  if (!price) return null;
  return (
    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
      {vbuckIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={vbuckIcon}
          alt=""
          className="size-4 rounded-full"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-base leading-none">V</span>
      )}
      <span>{price} V-Bucks</span>
    </p>
  );
}

export function JamTrackCard({
  card,
  vbuckIcon,
}: {
  card: ShopOfferCardDTO;
  vbuckIcon?: string | null;
}) {
  const labeled = labeledFromCard(card);
  const base = labeled[0]?.text ?? card.title;
  const track = splitTrack(base);
  const countdown = useCountdown(card.targetAt);

  return (
    <div
      className={`${shopCardBase} ${!countdown.isPast ? jamCardHover : ""} ${countdown.isPast ? COUNTDOWN_PAST_SURFACE_CLASS : ""}`}
    >
      <FavoriteStarButton
        targetType="shop_offer"
        targetKey={card.id}
        className="absolute right-2 top-2 z-20"
      />
      {card.imageUrl ? (
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-border/50 bg-black/45 transition-colors duration-300 group-hover:border-sky-400/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageUrl}
            alt=""
            className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/15 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full shrink-0 border-b border-border/40 bg-secondary/10" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          {track.artist ? (
            <p className="line-clamp-1 text-sm font-semibold text-primary/90">
              {track.artist}
            </p>
          ) : null}
          <h3 className="line-clamp-2 text-xl font-extrabold leading-tight text-card-foreground">
            {track.song}
          </h3>
          <PriceRow price={card.vbucks} vbuckIcon={vbuckIcon} />
        </div>
        <CountdownRow parts={countdown} targetIso={card.targetAt} />
      </div>
    </div>
  );
}

export function ShopCard({
  card,
  vbuckIcon,
}: {
  card: ShopOfferCardDTO;
  vbuckIcon?: string | null;
}) {
  const labeled = labeledFromCard(card);
  const showList = labeled.length > 1;
  const countdown = useCountdown(card.targetAt);

  return (
    <div
      className={`${shopCardBase} ${!countdown.isPast ? shopCardHover : ""} ${countdown.isPast ? COUNTDOWN_PAST_SURFACE_CLASS : ""}`}
    >
      <FavoriteStarButton
        targetType="shop_offer"
        targetKey={card.id}
        className="absolute right-2 top-2 z-20"
      />
      {card.imageUrl ? (
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-border/50 bg-black/45 transition-colors duration-300 group-hover:border-primary/35">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageUrl}
            alt=""
            className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/15 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full shrink-0 border-b border-border/40 bg-secondary/10" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/75">
            {card.layoutName ?? card.subtitle ?? "Item Shop"}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-card-foreground">
            {card.title}
          </h3>
          {!showList && labeled[0]?.category ? (
            <p className="mt-1.5">
              <span className="inline-block rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                {labeled[0].category}
              </span>
            </p>
          ) : null}
          <PriceRow price={card.vbucks} vbuckIcon={vbuckIcon} />
        </div>

        {showList ? (
          <ul className="space-y-2 text-sm">
            {labeled.map((line, i) => (
              <li
                key={`${i}-${line.text}`}
                className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-2 last:border-0 last:pb-0"
              >
                <span className="min-w-0 flex-1 text-foreground/90">
                  {line.text}
                </span>
                {line.category ? (
                  <span className="shrink-0 rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/85">
                    {line.category}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <CountdownRow parts={countdown} targetIso={card.targetAt} />
      </div>
    </div>
  );
}

interface ShopOffersGridProps {
  filter?: ShopOfferSection | "all";
  heading?: string | null;
  emptyHint?: string;
}

export const ShopOffersGrid = ({
  filter = "all",
  heading = "Item Shop",
  emptyHint,
}: ShopOffersGridProps) => {
  const q = useQuery({ queryKey: ["shop-offers"], queryFn: fetchShopOffers });

  const cards = useMemo(() => {
    const raw = q.data?.cards ?? [];
    const filtered =
      filter === "all"
        ? raw
        : filter === "jam"
          ? raw.filter((c) => isJamOfferCard(c))
          : raw.filter((c) => isOtherShopOfferCard(c));
    return filtered
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [q.data?.cards, filter]);

  const showHeading = heading != null && heading.trim().length > 0;

  if (q.isLoading) {
    return (
      <section className="mt-12">
        {showHeading ? (
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl border border-border bg-secondary/30"
            />
          ))}
        </div>
      </section>
    );
  }

  if (q.isError) {
    return (
      <section className="mt-12 rounded-xl border border-destructive/40 bg-destructive/5 p-6">
        {showHeading ? (
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          {q.error instanceof Error ? q.error.message : "Failed to load"}
        </p>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <section className="mt-12 rounded-xl border border-dashed border-border p-8 text-center">
        {showHeading ? (
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          {emptyHint ??
            "After the first cron ingest you will see offers with their countdown here. If you filter by section, run ingest again for data with images and categories."}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      {showHeading ? (
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) =>
          isJamOfferCard(c) ? (
            <JamTrackCard
              key={c.id}
              card={c}
              vbuckIcon={q.data?.vbuckIcon ?? null}
            />
          ) : (
            <ShopCard
              key={c.id}
              card={c}
              vbuckIcon={q.data?.vbuckIcon ?? null}
            />
          ),
        )}
      </div>
    </section>
  );
};
