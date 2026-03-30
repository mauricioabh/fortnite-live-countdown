import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import type {
  FavoriteTargetType,
  FavoritesListResponse,
  UserFavoriteItemDTO,
} from "@fortnite-live-countdown/types";

import { userFavorites } from "@/db/schema";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const targetTypeSchema = z.enum(["event", "shop_offer", "history"]);

const postBodySchema = z.object({
  targetType: targetTypeSchema,
  targetKey: z.string().min(1).max(512),
});

function mapRowToDto(row: {
  targetType: string;
  targetKey: string;
  createdAt: Date;
}): UserFavoriteItemDTO {
  return {
    targetType: row.targetType as FavoriteTargetType,
    targetKey: row.targetKey,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .orderBy(asc(userFavorites.createdAt));

    const body: FavoritesListResponse = {
      items: rows.map(mapRowToDto),
    };
    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("DATABASE_URL")) {
      const empty: FavoritesListResponse = { items: [] };
      return NextResponse.json(empty, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json: unknown = await req.json().catch(() => null);
    const parsed = postBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { targetType, targetKey } = parsed.data;
    const db = getDb();

    await db
      .insert(userFavorites)
      .values({
        userId,
        targetType,
        targetKey,
      })
      .onConflictDoNothing({
        target: [
          userFavorites.userId,
          userFavorites.targetType,
          userFavorites.targetKey,
        ],
      });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const targetTypeRaw = url.searchParams.get("targetType");
    const targetKey = url.searchParams.get("targetKey");
    const parsedType = targetTypeSchema.safeParse(targetTypeRaw);
    if (
      !parsedType.success ||
      !targetKey ||
      targetKey.length === 0 ||
      targetKey.length > 512
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    const db = getDb();
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.targetType, parsedType.data),
          eq(userFavorites.targetKey, targetKey),
        ),
      );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
