"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => (
      <div
        className="size-9 shrink-0 rounded-full bg-muted animate-pulse"
        aria-hidden
      />
    ),
  },
);

export const AppHeader = ({
  isEventsLoading,
  lastIngestLabel,
  sectionHint = null,
}: {
  isEventsLoading: boolean;
  lastIngestLabel: string | null;
  /** Optional subtitle for the current section (e.g. Jam tracks). */
  sectionHint?: string | null;
}) => {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Image
          src="/favicon.ico"
          alt=""
          width={40}
          height={40}
          className="mt-0.5 size-10 shrink-0 rounded-md border border-white/25 shadow-md"
          priority
        />
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className="inline-block -skew-x-[4deg] font-black italic leading-none tracking-[-0.02em] text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.65)] sm:text-[1.65rem]"
              style={{ WebkitTextStroke: "0.3px rgba(0,0,0,0.35)" }}
            >
              LIVE COUNTDOWN:
            </span>
            <span className="text-base font-semibold tracking-tight text-muted-foreground sm:text-xl">
              FOR FORTNITE FANS
            </span>
          </h1>
          {sectionHint ? (
            <p className="mt-1 text-sm font-medium text-foreground/90">
              {sectionHint}
            </p>
          ) : null}
          {isEventsLoading || lastIngestLabel ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground sm:text-sm">
              {isEventsLoading ? (
                <span className="animate-pulse">Loading events…</span>
              ) : (
                lastIngestLabel
              )}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
};
