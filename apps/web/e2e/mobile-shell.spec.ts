import { test, expect, type Page } from "@playwright/test";

async function assertNoDocumentHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
    };
  });
  expect(
    overflow.scrollWidth,
    `document horizontal overflow (scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth})`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test.describe("Mobile shell @ 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sign-in has no document-level horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading").first()).toBeVisible({
      timeout: 20_000,
    });
    await assertNoDocumentHorizontalOverflow(page);
  });

  test("offline page has no document-level horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/offline");
    await expect(
      page.getByRole("heading", { name: "You are offline" }),
    ).toBeVisible();
    await assertNoDocumentHorizontalOverflow(page);
  });

  test("home or auth redirect has no document-level horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/");
    // With storageState: stays on `/`. Guest projects redirect to `/sign-in`.
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    await assertNoDocumentHorizontalOverflow(page);
  });

  test("historial table scroll is container-scoped when reachable", async ({
    page,
  }) => {
    await page.goto("/historial");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("sign-in")) {
      await assertNoDocumentHorizontalOverflow(page);
      return;
    }

    const tableScroller = page.locator(
      "div.min-w-0.max-w-full.overflow-x-auto",
    );
    if ((await tableScroller.count()) === 0) {
      await assertNoDocumentHorizontalOverflow(page);
      return;
    }

    const scoped = await tableScroller.first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        overflowX: style.overflowX,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    });
    expect(["auto", "scroll"]).toContain(scoped.overflowX);
    await assertNoDocumentHorizontalOverflow(page);
  });
});
