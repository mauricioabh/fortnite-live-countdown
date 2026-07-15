import { SITE_NAME } from "@/lib/seo/site";

import { OfflineRetryLink } from "@/components/pwa/offline-retry-link";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-lg bg-zinc-950 px-lg py-xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {SITE_NAME}
      </p>
      <h1 className="text-2xl font-bold text-foreground">You are offline</h1>
      <p className="max-w-md text-base text-muted-foreground">
        Live countdowns need a network connection. Check your connection and try
        again when you are back online.
      </p>
      <OfflineRetryLink />
    </main>
  );
}
