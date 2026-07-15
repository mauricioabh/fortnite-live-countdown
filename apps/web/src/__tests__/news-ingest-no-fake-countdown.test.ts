import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guard: MOTD ingest must not fabricate countdown ends via addMinutes offsets.
 * Source of truth is apps/web/src/lib/fortnite/ingest.ts.
 */
describe("news ingest source guard", () => {
  it("does not use addMinutes for news MOTD target_at", () => {
    const ingestPath = join(process.cwd(), "src/lib/fortnite/ingest.ts");
    const src = readFileSync(ingestPath, "utf8");
    expect(src).not.toMatch(/addMinutes\s*\(/);
    expect(src).toMatch(/publishedAt/);
    expect(src).toMatch(/Feed as-of only/);
  });
});
