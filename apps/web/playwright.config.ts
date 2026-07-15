import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

import { loadPlaywrightEnv } from "./e2e/env";

const appDir = __dirname;
loadPlaywrightEnv(appDir);

const authFile = path.join(appDir, "playwright/.clerk/user.json");

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      testMatch: /(ejemplo|observability|auth-guest|mobile-shell)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-authenticated",
      testMatch: /(auth|mobile-shell)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],
  // In CI the server is started by the workflow (next start &) before running Playwright.
  // Locally, we start it automatically via webServer for convenience.
  ...(!process.env.CI && {
    webServer: {
      command: "npm run dev",
      url: "http://localhost:3000/sign-in",
      reuseExistingServer: !process.env.PW_FRESH_SERVER,
      cwd: appDir,
      timeout: 180_000,
    },
  }),
});
