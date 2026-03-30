import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // In CI: use `next start` (production build already done by workflow) — starts instantly.
    // Locally: use `npm run dev` for hot-reload convenience.
    command: process.env.CI ? "npx next start" : "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    cwd: __dirname,
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION ?? "1",
    },
  },
});
