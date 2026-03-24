"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

import type { EventsApiResponse } from "@fortnite-live-countdown/types";
import { heatTierForIndex, msUntilUtc } from "@fortnite-live-countdown/utils";

import { AppHeader } from "@/components/dashboard/app-header";
import { EventHeroBanner } from "@/components/dashboard/event-hero-banner";

async function fetchEvents(): Promise<EventsApiResponse> {
  const res = await fetch("/api/events", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load events");
  return res.json() as Promise<EventsApiResponse>;
}

export const DashboardPage = () => {
  const q = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  const lastIngestLabel =
    q.data?.lastIngest?.finishedAt != null
      ? `Last updated ${formatDistanceToNow(new Date(q.data.lastIngest.finishedAt), { locale: enUS, addSuffix: true })}`
      : q.data?.lastIngest === null && (q.data?.events.length ?? 0) === 0
        ? "Run the ingest cron to populate Neon"
        : null;

  const sorted =
    q.data?.events
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt)) ?? [];

  return (
    <>
      <AppHeader
        isEventsLoading={q.isLoading}
        lastIngestLabel={lastIngestLabel}
      />

      {q.isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border bg-secondary/30"
            />
          ))}
        </div>
      ) : null}

      {q.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
          <p className="font-medium text-foreground">Error</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {q.error instanceof Error ? q.error.message : "Unknown error"}
          </p>
        </div>
      ) : null}

      {q.isSuccess && sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium text-foreground">
            No events in the database
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Set <code className="text-primary">DATABASE_URL</code> and run{" "}
            <code className="text-primary">POST /api/cron/ingest-fortnite</code>{" "}
            con{" "}
            <code className="text-primary">
              Authorization: Bearer CRON_SECRET
            </code>
            .
          </p>
        </div>
      ) : null}

      {q.isSuccess && sorted.length > 0 ? (
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
