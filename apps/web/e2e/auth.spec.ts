import { test, expect } from "@playwright/test";

test.describe("Clerk auth (authenticated)", () => {
  test("home is reachable when signed in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("button", { name: "Open user menu" }),
    ).toBeVisible();
  });

  test("GET /api/favorites returns 200 for signed-in user", async ({
    page,
  }) => {
    const res = await page.request.get("/api/favorites");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { items?: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  });
});
