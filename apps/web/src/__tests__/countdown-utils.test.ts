import { describe, expect, it } from "vitest";

import {
  getCountdownPastStatusText,
  heatTierForIndex,
  msUntilUtc,
  splitCountdownMs,
} from "@fortnite-live-countdown/utils";

describe("msUntilUtc", () => {
  it("returns positive ms for future target", () => {
    const now = Date.UTC(2030, 0, 1, 12, 0, 0);
    const target = new Date(Date.UTC(2030, 0, 1, 13, 0, 0)).toISOString();
    expect(msUntilUtc(target, now)).toBe(3_600_000);
  });
});

describe("splitCountdownMs", () => {
  it("splits 90061s worth of ms", () => {
    const ms = 90_061_000;
    const p = splitCountdownMs(ms);
    expect(p.days).toBe(1);
    expect(p.hours).toBe(1);
    expect(p.minutes).toBe(1);
    expect(p.seconds).toBe(1);
  });
});

describe("heatTierForIndex", () => {
  it("maps single event to most urgent", () => {
    expect(heatTierForIndex(0, 1)).toBe("red-intense");
  });

  it("spreads across scale for many events", () => {
    expect(heatTierForIndex(0, 10)).toBe("red-intense");
    expect(heatTierForIndex(9, 10)).toBe("blue-soft");
  });
});

describe("getCountdownPastStatusText", () => {
  it("labels events vs offers with reference date", () => {
    const iso = "2030-01-01T12:00:00.000Z";
    expect(getCountdownPastStatusText("event", iso)).toContain("Past event");
    expect(getCountdownPastStatusText("event", iso)).toContain("reference:");
    expect(getCountdownPastStatusText("offer", iso)).toContain("Expired");
    expect(getCountdownPastStatusText("offer", iso)).toContain("window closed");
  });
});
