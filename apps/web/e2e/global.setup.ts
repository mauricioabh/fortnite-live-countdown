import {
  clerk,
  clerkSetup,
  setupClerkTestingToken,
} from "@clerk/testing/playwright";
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { getE2EClerkEmail, loadPlaywrightEnv } from "./env";

const appDir = path.join(__dirname, "..");
loadPlaywrightEnv(appDir);

setup.describe.configure({ mode: "serial" });

const authDir = path.join(appDir, "playwright/.clerk");
const authFile = path.join(authDir, "user.json");

setup("clerk auth storage state", async ({ page, context }) => {
  const email = getE2EClerkEmail();
  if (!email) {
    throw new Error("Set CLERK_E2E_USER_EMAIL in apps/web/.env.local.");
  }

  fs.mkdirSync(authDir, { recursive: true });
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
  }

  await clerkSetup({ dotenv: false });
  await context.clearCookies();
  await setupClerkTestingToken({ page });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await clerk.signIn({ page, emailAddress: email });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Open user menu" }),
  ).toBeVisible({
    timeout: 90_000,
  });

  await page.context().storageState({ path: authFile });
});
