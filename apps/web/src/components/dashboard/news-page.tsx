"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { NewsApiResponse } from "@fortnite-live-countdown/types";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/dashboard/app-header";
import { NewsCard } from "@/components/dashboard/news-card";

const NEWS_LOADING_LABEL = "Loading news…";

async function fetchNews(): Promise<NewsApiResponse> {
  const res = await fetch("/api/news", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load news");
  return res.json() as Promise<NewsApiResponse>;
}

export const NewsPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const q = useQuery({ queryKey: ["news"], queryFn: fetchNews });

  // Keep SSR + first client paint identical (avoid React Query / HMR hydration drift).
  const showLoading =
    !mounted || q.isPending || (q.isFetching && q.data === undefined);

  const statusLabel = showLoading
    ? NEWS_LOADING_LABEL
    : q.data?.lastIngest?.finishedAt != null
      ? `Last updated ${formatDistanceToNow(new Date(q.data.lastIngest.finishedAt), { addSuffix: true })}`
      : null;

  return (
    <>
      <AppHeader
        isStatusLoading={showLoading}
        statusLabel={statusLabel}
        sectionHint="BR news and MOTDs — informational, no countdown"
      />

      {q.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-lg text-sm text-muted-foreground">
          {q.error instanceof Error ? q.error.message : "Failed to load news"}
        </div>
      ) : null}

      {showLoading ? (
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border bg-secondary/30"
            />
          ))}
        </div>
      ) : null}

      {!showLoading && q.isSuccess && q.data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium text-foreground">
            No news right now
          </p>
          <p className="mt-sm text-sm text-muted-foreground">
            BR MOTDs will appear here after the next successful news ingest.
          </p>
        </div>
      ) : null}

      {!showLoading && q.isSuccess && q.data.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          {q.data.items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </>
  );
};
