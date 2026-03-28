"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  EventsApiResponse,
  FavoritesListResponse,
  FortniteEventDTO,
  HistoryApiResponse,
  HistoryEventDTO,
  ShopOffersResponse,
} from "@fortnite-live-countdown/types";
import { heatTierForIndex, msUntilUtc } from "@fortnite-live-countdown/utils";
import { useMemo } from "react";

import { AppHeader } from "@/components/dashboard/app-header";
import { EventHeroBanner } from "@/components/dashboard/event-hero-banner";
import { FavoriteStarButton } from "@/components/dashboard/favorite-star-button";
import {
  JamTrackCard,
  ShopCard,
} from "@/components/dashboard/shop-offers-grid";
import { isJamOfferCard, isOtherShopOfferCard } from "@/lib/shop/offer-section";

async function fetchFavorites(): Promise<FavoritesListResponse> {
  const res = await fetch("/api/favorites", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load favorites");
  return res.json() as Promise<FavoritesListResponse>;
}

async function fetchEvents(): Promise<EventsApiResponse> {
  const res = await fetch("/api/events", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load events");
  return res.json() as Promise<EventsApiResponse>;
}

async function fetchShop(): Promise<ShopOffersResponse> {
  const res = await fetch("/api/shop/daily-ops", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load the shop");
  return res.json() as Promise<ShopOffersResponse>;
}

async function fetchHistory(): Promise<HistoryApiResponse> {
  const res = await fetch("/api/history", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load history");
  return res.json() as Promise<HistoryApiResponse>;
}

function formatCell(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function FavoriteHistoryCard({ row }: { row: HistoryEventDTO }) {
  return (
    <article className="relative flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-4 shadow-md backdrop-blur-sm">
      <FavoriteStarButton
        targetType="history"
        targetKey={row.id}
        className="absolute right-2 top-2 z-10"
      />
      <p className="pr-10 font-semibold text-foreground">{row.title}</p>
      <p className="text-xs text-muted-foreground">
        {row.kind} · {row.source}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Target: {formatCell(row.targetAt)}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Archived: {formatCell(row.archivedAt)}
      </p>
    </article>
  );
}

export const FavoritosPage = () => {
  const favQ = useQuery({ queryKey: ["favorites"], queryFn: fetchFavorites });
  const eventsQ = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const shopQ = useQuery({ queryKey: ["shop-offers"], queryFn: fetchShop });
  const historyQ = useQuery({
    queryKey: ["event-history"],
    queryFn: fetchHistory,
  });

  const eventIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const i of favQ.data?.items ?? []) {
      if (i.targetType === "event") ids.add(i.targetKey);
    }
    return ids;
  }, [favQ.data?.items]);

  const shopIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const i of favQ.data?.items ?? []) {
      if (i.targetType === "shop_offer") ids.add(i.targetKey);
    }
    return ids;
  }, [favQ.data?.items]);

  const historyIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const i of favQ.data?.items ?? []) {
      if (i.targetType === "history") ids.add(i.targetKey);
    }
    return ids;
  }, [favQ.data?.items]);

  const favoritedEvents = useMemo(() => {
    const all = eventsQ.data?.events ?? [];
    const filtered = all.filter((e) => eventIdSet.has(e.id));
    return filtered
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [eventsQ.data?.events, eventIdSet]);

  const favoritedJam = useMemo(() => {
    const cards = shopQ.data?.cards ?? [];
    return cards
      .filter((c) => shopIdSet.has(c.id) && isJamOfferCard(c))
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [shopQ.data?.cards, shopIdSet]);

  const favoritedShopOther = useMemo(() => {
    const cards = shopQ.data?.cards ?? [];
    return cards
      .filter((c) => shopIdSet.has(c.id) && isOtherShopOfferCard(c))
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [shopQ.data?.cards, shopIdSet]);

  const favoritedHistory = useMemo(() => {
    const rows = historyQ.data?.rows ?? [];
    return rows
      .filter((r) => historyIdSet.has(r.id))
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [historyQ.data?.rows, historyIdSet]);

  const isLoading =
    favQ.isLoading ||
    eventsQ.isLoading ||
    shopQ.isLoading ||
    historyQ.isLoading;
  const isError =
    favQ.isError || eventsQ.isError || shopQ.isError || historyQ.isError;

  const totalCount =
    favoritedEvents.length +
    favoritedJam.length +
    favoritedShopOther.length +
    favoritedHistory.length;

  return (
    <>
      <AppHeader
        isEventsLoading={isLoading}
        lastIngestLabel={null}
        sectionHint="Your saved events, offers, and history items"
      />

      {isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-muted-foreground">
          {favQ.error instanceof Error
            ? favQ.error.message
            : eventsQ.error instanceof Error
              ? eventsQ.error.message
              : shopQ.error instanceof Error
                ? shopQ.error.message
                : historyQ.error instanceof Error
                  ? historyQ.error.message
                  : "Failed to load favorites"}
        </div>
      ) : null}

      {!isLoading && !isError && totalCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium text-foreground">
            No favorites yet
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the heart on event or shop cards to save them here.
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-border bg-secondary/30"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && favoritedEvents.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Events</h2>
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-6">
            {favoritedEvents.map((event: FortniteEventDTO, index: number) => (
              <EventHeroBanner
                key={event.id}
                event={event}
                heat={heatTierForIndex(index, favoritedEvents.length)}
                isTopPriority={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading &&
      !isError &&
      (favoritedJam.length > 0 || favoritedShopOther.length > 0) ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Shop and Jam tracks
          </h2>
          {favoritedJam.length > 0 ? (
            <>
              <h3 className="mb-3 text-base font-medium text-muted-foreground">
                Jam tracks
              </h3>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoritedJam.map((c) => (
                  <JamTrackCard
                    key={c.id}
                    card={c}
                    vbuckIcon={shopQ.data?.vbuckIcon ?? null}
                  />
                ))}
              </div>
            </>
          ) : null}
          {favoritedShopOther.length > 0 ? (
            <>
              <h3 className="mb-3 text-base font-medium text-muted-foreground">
                Item Shop
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoritedShopOther.map((c) => (
                  <ShopCard
                    key={c.id}
                    card={c}
                    vbuckIcon={shopQ.data?.vbuckIcon ?? null}
                  />
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {!isLoading && !isError && favoritedHistory.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            History
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoritedHistory.map((r) => (
              <FavoriteHistoryCard key={r.id} row={r} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
};
