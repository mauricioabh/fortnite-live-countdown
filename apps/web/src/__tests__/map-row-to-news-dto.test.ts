import { describe, expect, it } from "vitest";

import { mapEventRowToNewsDto } from "@/lib/news/map-row-to-news-dto";

describe("mapEventRowToNewsDto", () => {
  it("maps informational fields without countdown targetAt", () => {
    const dto = mapEventRowToNewsDto({
      id: "uuid-1",
      externalKey: "news:motd-1",
      kind: "other",
      title: "Hello",
      subtitle: "Tab",
      targetAt: new Date("2026-07-14T12:00:00.000Z"),
      startsAt: null,
      metadata: {
        newsId: "motd-1",
        body: "Full body text",
        bodyPreview: "Full body",
        tabTitle: "Tab",
        sortingPriority: 99,
        publishedAt: "2026-07-14T12:00:00.000Z",
        backgroundImageUrl: "https://example.com/n.jpg",
      },
      source: "news",
      sortPriority: 10,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(dto).toEqual({
      id: "uuid-1",
      externalKey: "news:motd-1",
      title: "Hello",
      tabTitle: "Tab",
      body: "Full body text",
      imageUrl: "https://example.com/n.jpg",
      sortingPriority: 99,
      publishedAt: "2026-07-14T12:00:00.000Z",
    });
    expect(dto).not.toHaveProperty("targetAt");
  });

  it("falls back to bodyPreview when body missing", () => {
    const dto = mapEventRowToNewsDto({
      id: "uuid-2",
      externalKey: "news:2",
      kind: "other",
      title: "T",
      subtitle: null,
      targetAt: new Date(),
      startsAt: null,
      metadata: { bodyPreview: "preview only" },
      source: "news",
      sortPriority: 11,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(dto.body).toBe("preview only");
    expect(dto.tabTitle).toBeNull();
  });
});
