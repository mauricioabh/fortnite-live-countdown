import { describe, expect, it } from "vitest";

import { isNewsEvent } from "@/lib/fortnite/is-news-event";

describe("isNewsEvent", () => {
  it("matches source news", () => {
    expect(isNewsEvent({ source: "news", externalKey: "other:1" })).toBe(true);
  });

  it("matches externalKey news: prefix", () => {
    expect(isNewsEvent({ source: "other", externalKey: "news:abc" })).toBe(
      true,
    );
  });

  it("matches snake_case external_key", () => {
    expect(isNewsEvent({ source: "x", external_key: "news:1" })).toBe(true);
  });

  it("rejects shop and other sources", () => {
    expect(isNewsEvent({ source: "shop", externalKey: "shop:rotation" })).toBe(
      false,
    );
    expect(isNewsEvent({ source: "derived", externalKey: "season:1" })).toBe(
      false,
    );
  });
});
