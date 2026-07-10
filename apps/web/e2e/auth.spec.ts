import { test, expect } from "@playwright/test";

test.describe("Clerk auth (authenticated)", () => {
  test("home is reachable when signed in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("button", { name: "Open user menu" }),
    ).toBeVisible();
  });

  test("GET /api/favorites is authorized for signed-in user", async ({
    page,
  }) => {
    const res = await page.request.get("/api/favorites");
    // 200 when DATABASE_URL is set; 503 when DB is unavailable in CI (auth still passed).
    expect([200, 503]).toContain(res.status());
    expect(res.status()).not.toBe(401);
    const body = (await res.json()) as { items?: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  });
});
