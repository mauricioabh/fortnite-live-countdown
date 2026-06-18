import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo has lockfiles at root + apps/web; without this, Next.js may trace the
  // wrong tree and appear hung after the Sentry clientTraceMetadata banner (Windows).
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT ?? "fortnite-live-countdown",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
