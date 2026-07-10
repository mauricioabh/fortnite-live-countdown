import { test, expect } from "@playwright/test";

test.describe("Clerk auth (guest)", () => {
  test("GET /api/favorites returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/favorites", {
      headers: { Accept: "application/json" },
    });
    expect(res.status()).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Unauthorized");
  });
});
