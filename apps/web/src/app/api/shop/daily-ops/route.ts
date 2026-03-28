import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { ShopOffersResponse } from "@fortnite-live-countdown/types";

import { fortniteEvents } from "@/db/schema";
import { getDb } from "@/lib/db";
import { isJamOfferCard } from "@/lib/shop/offer-section";

export const dynamic = "force-dynamic";

const labeledItemSchema = z.object({
  text: z.string(),
  category: z.string().nullable(),
});

const dailyOpSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  targetAt: z.string(),
  layoutName: z.string().nullable(),
  items: z.array(z.string()).optional(),
  offerSection: z.enum(["jam", "other"]).optional(),
  labeledItems: z.array(labeledItemSchema).optional(),
  imageUrl: z.string().nullable().optional(),
  vbucks: z.number().nullable().optional(),
});

const metadataDailyOpsSchema = z.object({
  dailyOps: z.array(dailyOpSchema).optional(),
  shopDate: z.string().optional(),
  hash: z.string().optional(),
  vbuckIcon: z.string().optional(),
});

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(fortniteEvents)
      .where(
        and(eq(fortniteEvents.visible, true), eq(fortniteEvents.kind, "shop")),
      )
      .orderBy(desc(fortniteEvents.updatedAt))
      .limit(1);

    const shop = rows[0];
    if (!shop) {
      const empty: ShopOffersResponse = {
        shopDate: null,
        shopHash: null,
        cards: [],
      };
      return NextResponse.json(empty);
    }

    const parsed = metadataDailyOpsSchema.safeParse(shop.metadata);
    const rawCards = parsed.success ? (parsed.data.dailyOps ?? []) : [];
    const cards = rawCards.map((c) => {
      const items = c.items ?? [];
      const labeledItems =
        c.labeledItems ??
        items.map((text) => ({ text, category: null as string | null }));
      const base = {
        ...c,
        items,
        labeledItems,
        imageUrl: c.imageUrl ?? null,
        vbucks: c.vbucks ?? null,
        offerSection: (c.offerSection ?? "other") as "jam" | "other",
      };
      const offerSection: "jam" | "other" = isJamOfferCard(base)
        ? "jam"
        : "other";
      return { ...base, offerSection };
    });

    const body: ShopOffersResponse = {
      shopDate: parsed.success ? (parsed.data.shopDate ?? null) : null,
      shopHash: parsed.success ? (parsed.data.hash ?? null) : null,
      vbuckIcon: parsed.success ? (parsed.data.vbuckIcon ?? null) : null,
      cards,
    };

    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("DATABASE_URL")) {
      const empty: ShopOffersResponse = {
        shopDate: null,
        shopHash: null,
        cards: [],
      };
      return NextResponse.json(empty, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
