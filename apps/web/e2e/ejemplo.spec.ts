import { test, expect } from "@playwright/test";

/** Public Clerk route — HTTP smoke (no browser binary required). */
test("sign-in page is publicly reachable", async ({ request }) => {
  const res = await request.get("/sign-in");
  expect(res.ok()).toBeTruthy();
});
