"use client";

import { useQuery } from "@tanstack/react-query";
import type { HistoryApiResponse } from "@fortnite-live-countdown/types";
import { msUntilUtc } from "@fortnite-live-countdown/utils";
import { useMemo } from "react";

import { AppHeader } from "@/components/dashboard/app-header";

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

export const HistorialPage = () => {
  const q = useQuery({ queryKey: ["event-history"], queryFn: fetchHistory });

  const sortedRows = useMemo(() => {
    const rows = q.data?.rows ?? [];
    return rows
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [q.data?.rows]);

  return (
    <>
      <AppHeader
        isEventsLoading={false}
        lastIngestLabel={null}
        sectionHint="Archived events (target more than 24h ago)"
      />

      {q.isLoading ? (
        <div className="h-48 animate-pulse rounded-xl border border-border bg-secondary/30" />
      ) : null}

      {q.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-muted-foreground">
          {q.error instanceof Error ? q.error.message : "Error"}
        </div>
      ) : null}

      {q.isSuccess ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card/40 shadow-sm backdrop-blur-sm">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Archived</th>
                <th className="px-3 py-3 font-semibold">Target</th>
                <th className="px-3 py-3 font-semibold">Title</th>
                <th className="px-3 py-3 font-semibold">Kind</th>
                <th className="px-3 py-3 font-semibold">Source</th>
                <th className="px-3 py-3 font-semibold">Key</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-muted-foreground"
                  >
                    No history rows yet. After migrating the table and running
                    ingestion, events whose countdown ended more than 24 hours
                    ago will appear here.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/80 transition-colors hover:bg-secondary/20"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-foreground/90">
                      {formatCell(r.archivedAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-foreground/90">
                      {formatCell(r.targetAt)}
                    </td>
                    <td className="max-w-[220px] px-3 py-2.5 font-medium text-foreground">
                      <span className="line-clamp-2">{r.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {r.kind}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {r.source}
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      {r.externalKey}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};
