import { describe, expect, it } from "vitest";

import {
  SHOP_ROTATION_EXTERNAL_KEY,
  dedupeShopEventsForDashboard,
  isSupersededShopRotation,
} from "@/lib/fortnite/shop-rotation";

describe("isSupersededShopRotation", () => {
  it("keeps the stable shop rotation key", () => {
    expect(isSupersededShopRotation("shop", SHOP_ROTATION_EXTERNAL_KEY)).toBe(
      false,
    );
  });

  it("marks legacy hash-scoped shop keys as superseded", () => {
    expect(isSupersededShopRotation("shop", "shop:rotation:abc123")).toBe(true);
  });

  it("ignores non-shop events", () => {
    expect(isSupersededShopRotation("news", "shop:rotation:abc123")).toBe(
      false,
    );
  });
});

describe("dedupeShopEventsForDashboard", () => {
  it("prefers the stable shop:rotation row", () => {
    const events = [
      {
        kind: "shop",
        externalKey: "shop:rotation:old",
        updatedAt: "2026-07-10T00:00:00.000Z",
        id: "1",
      },
      {
        kind: "shop",
        externalKey: SHOP_ROTATION_EXTERNAL_KEY,
        updatedAt: "2026-07-01T00:00:00.000Z",
        id: "2",
      },
      {
        kind: "news",
        externalKey: "news:1",
        updatedAt: "2026-07-14T00:00:00.000Z",
        id: "3",
      },
    ];

    const next = dedupeShopEventsForDashboard(events);
    expect(next).toHaveLength(2);
    expect(next.map((e) => e.id).sort()).toEqual(["2", "3"]);
  });

  it("falls back to the newest shop row when stable key is missing", () => {
    const events = [
      {
        kind: "shop",
        externalKey: "shop:rotation:a",
        updatedAt: "2026-07-01T00:00:00.000Z",
        id: "a",
      },
      {
        kind: "shop",
        externalKey: "shop:rotation:b",
        updatedAt: "2026-07-14T00:00:00.000Z",
        id: "b",
      },
    ];

    const next = dedupeShopEventsForDashboard(events);
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe("b");
  });

  it("leaves a single shop event untouched", () => {
    const events = [
      {
        kind: "shop",
        externalKey: SHOP_ROTATION_EXTERNAL_KEY,
        updatedAt: "2026-07-14T00:00:00.000Z",
        id: "only",
      },
    ];
    expect(dedupeShopEventsForDashboard(events)).toEqual(events);
  });
});
