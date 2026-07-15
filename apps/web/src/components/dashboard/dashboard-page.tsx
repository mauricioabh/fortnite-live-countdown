"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useEffect, useState } from "react";

import type { EventsApiResponse } from "@fortnite-live-countdown/types";
import { heatTierForIndex, msUntilUtc } from "@fortnite-live-countdown/utils";

import { AppHeader } from "@/components/dashboard/app-header";
import { EventHeroBanner } from "@/components/dashboard/event-hero-banner";

const EVENTS_LOADING_LABEL = "Loading events…";

async function fetchEvents(): Promise<EventsApiResponse> {
  const res = await fetch("/api/events", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load events");
  return res.json() as Promise<EventsApiResponse>;
}

export const DashboardPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const q = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  const showLoading =
    !mounted || q.isPending || (q.isFetching && q.data === undefined);

  const lastIngestLabel =
    q.data?.lastIngest?.finishedAt != null
      ? `Last updated ${formatDistanceToNow(new Date(q.data.lastIngest.finishedAt), { locale: enUS, addSuffix: true })}`
      : q.data?.lastIngest === null && (q.data?.events.length ?? 0) === 0
        ? "Run the ingest cron to populate Neon"
        : null;

  const statusLabel = showLoading ? EVENTS_LOADING_LABEL : lastIngestLabel;

  const sorted =
    q.data?.events
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt)) ?? [];

  return (
    <>
      <AppHeader isStatusLoading={showLoading} statusLabel={statusLabel} />

      {showLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border bg-secondary/30"
            />
          ))}
        </div>
      ) : null}

      {!showLoading && q.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
          <p className="font-medium text-foreground">Error</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {q.error instanceof Error ? q.error.message : "Unknown error"}
          </p>
        </div>
      ) : null}

      {!showLoading && q.isSuccess && sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium text-foreground">
            No countdown events right now
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Only milestones with real dates appear here (e.g. Item Shop
            rotation). BR MOTDs live under{" "}
            <span className="text-foreground">News</span>. If the shop banner is
            missing, run{" "}
            <code className="text-primary">POST /api/cron/ingest-fortnite</code>{" "}
            with{" "}
            <code className="text-primary">
              Authorization: Bearer CRON_SECRET
            </code>
            .
          </p>
        </div>
      ) : null}

      {!showLoading && q.isSuccess && sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-6">
          {sorted.map((event, index) => (
            <EventHeroBanner
              key={event.id}
              event={event}
              heat={heatTierForIndex(index, sorted.length)}
              isTopPriority={index === 0}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
