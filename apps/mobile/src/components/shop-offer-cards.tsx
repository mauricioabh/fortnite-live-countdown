import { useQuery } from "@tanstack/react-query";
import type { ShopOfferCardDTO, ShopOfferSection, ShopOffersResponse } from "@fortnite-live-countdown/types";
import type { CountdownParts } from "@fortnite-live-countdown/utils";
import { getCountdownPastStatusText, msUntilUtc } from "@fortnite-live-countdown/utils";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { Fragment, useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FavoriteStarButton } from "@/components/favorite-star-button";
import { useCountdown } from "@/hooks/use-countdown";
import { apiUrl } from "@/lib/api";
import { isJamOfferCard, isOtherShopOfferCard } from "@/lib/shop-offer";

async function fetchShopOffers(): Promise<ShopOffersResponse> {
  const res = await fetch(apiUrl("/api/shop/daily-ops"));
  if (!res.ok) throw new Error("Could not load the Item Shop");
  return res.json() as Promise<ShopOffersResponse>;
}

function labeledFromCard(card: ShopOfferCardDTO): { text: string; category: string | null }[] {
  if (card.labeledItems && card.labeledItems.length > 0) return card.labeledItems;
  return card.items.map((text) => ({ text, category: null as string | null }));
}

function splitTrack(line: string): { song: string; artist: string | null } {
  const parts = line.split(" — ");
  if (parts.length < 2) return { song: line, artist: null };
  const song = parts.slice(0, -1).join(" — ").trim();
  const artist = parts[parts.length - 1]?.trim() ?? null;
  return { song: song || line, artist: artist && artist.length > 0 ? artist : null };
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function MiniBlock({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniValue}>{pad2(value)}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function CountdownRow({ parts, targetIso }: { parts: CountdownParts; targetIso: string }) {
  const { days, hours, minutes, seconds, isPast } = parts;
  const segments = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ] as const;

  return (
    <>
      <View style={styles.countRow}>
        {segments.map((seg, index) => (
          <Fragment key={seg.label}>
            {index > 0 ? (
              <Text style={styles.countSep} accessibilityElementsHidden>
                :
              </Text>
            ) : null}
            <MiniBlock label={seg.label} value={seg.value} />
          </Fragment>
        ))}
      </View>
      {isPast ? (
        <Text style={styles.pastShop}>{getCountdownPastStatusText("offer", targetIso)}</Text>
      ) : null}
    </>
  );
}

function PriceRow({ price, vbuckIcon }: { price?: number | null; vbuckIcon?: string | null }) {
  if (!price) return null;
  return (
    <View style={styles.priceRow}>
      {vbuckIcon ? <Image source={{ uri: vbuckIcon }} style={styles.vbIcon} /> : <Text style={styles.vbFallback}>V</Text>}
      <Text style={styles.priceText}>
        {price} V-Bucks
      </Text>
    </View>
  );
}

interface JamTrackCardProps {
  card: ShopOfferCardDTO;
  vbuckIcon?: string | null;
}

export function JamTrackCard({ card, vbuckIcon }: JamTrackCardProps) {
  const labeled = labeledFromCard(card);
  const base = labeled[0]?.text ?? card.title;
  const track = splitTrack(base);
  const countdownParts = useCountdown(card.targetAt);
  const isPast = countdownParts.isPast;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        styles.cardJam,
        isPast ? styles.cardPast : null,
        !isPast && pressed ? styles.cardPressed : null,
      ]}
    >
      {isPast ? <View style={styles.pastVeil} pointerEvents="none" /> : null}
      <FavoriteStarButton targetType="shop_offer" targetKey={card.id} />
      {card.imageUrl ? (
        <View style={styles.imgWrapJam}>
          <Image source={{ uri: card.imageUrl }} style={styles.img} resizeMode="contain" />
        </View>
      ) : (
        <View style={[styles.imgWrapJam, styles.imgPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHead}>
          {track.artist ? <Text style={styles.artist}>{track.artist}</Text> : null}
          <Text style={styles.jamTitle}>{track.song}</Text>
          <PriceRow price={card.vbucks} vbuckIcon={vbuckIcon} />
        </View>
        <CountdownRow parts={countdownParts} targetIso={card.targetAt} />
      </View>
    </Pressable>
  );
}

interface ShopCardProps {
  card: ShopOfferCardDTO;
  vbuckIcon?: string | null;
}

export function ShopCard({ card, vbuckIcon }: ShopCardProps) {
  const labeled = labeledFromCard(card);
  const showList = labeled.length > 1;
  const countdownParts = useCountdown(card.targetAt);
  const isPast = countdownParts.isPast;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        styles.cardShop,
        isPast ? styles.cardPast : null,
        !isPast && pressed ? styles.cardPressed : null,
      ]}
    >
      {isPast ? <View style={styles.pastVeil} pointerEvents="none" /> : null}
      <FavoriteStarButton targetType="shop_offer" targetKey={card.id} />
      {card.imageUrl ? (
        <View style={styles.imgWrapShop}>
          <Image source={{ uri: card.imageUrl }} style={styles.img} resizeMode="contain" />
        </View>
      ) : (
        <View style={[styles.imgWrapShop, styles.imgPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.layoutName}>{card.layoutName ?? card.subtitle ?? "Item Shop"}</Text>
          <Text style={styles.shopTitle}>{card.title}</Text>
          {!showList && labeled[0]?.category ? (
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>{labeled[0].category}</Text>
            </View>
          ) : null}
          <PriceRow price={card.vbucks} vbuckIcon={vbuckIcon} />
        </View>
        {showList ? (
          <View style={styles.list}>
            {labeled.map((line, i) => (
              <View
                key={`${i}-${line.text}`}
                style={[styles.listRow, i === labeled.length - 1 ? styles.listRowLast : null]}
              >
                <Text style={styles.listText}>{line.text}</Text>
                {line.category ? (
                  <View style={styles.catPill}>
                    <Text style={styles.catPillText}>{line.category}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
        <CountdownRow parts={countdownParts} targetIso={card.targetAt} />
      </View>
    </Pressable>
  );
}

interface ShopOffersSectionProps {
  filter: ShopOfferSection | "all";
  heading: string | null;
  emptyHint: string;
}

export function ShopOffersSection({ filter, heading, emptyHint }: ShopOffersSectionProps) {
  const q = useQuery({ queryKey: ["shop-offers"], queryFn: fetchShopOffers });

  const cards = useMemo(() => {
    const raw = q.data?.cards ?? [];
    const filtered =
      filter === "all"
        ? raw
        : filter === "jam"
          ? raw.filter((c) => isJamOfferCard(c))
          : raw.filter((c) => isOtherShopOfferCard(c));
    return filtered.slice().sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [q.data?.cards, filter]);

  const showHeading = heading != null && heading.trim().length > 0;

  if (q.isLoading) {
    return (
      <View style={styles.section}>
        {showHeading ? <Text style={styles.sectionTitle}>{heading}</Text> : null}
        <View style={styles.skeleton} />
        <View style={styles.skeleton} />
      </View>
    );
  }

  if (q.isError) {
    return (
      <View style={styles.errorBox}>
        {showHeading ? <Text style={styles.sectionTitle}>{heading}</Text> : null}
        <Text style={styles.errorText}>{q.error instanceof Error ? q.error.message : "Failed to load"}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.emptyBox}>
        {showHeading ? <Text style={styles.sectionTitle}>{heading}</Text> : null}
        <Text style={styles.emptyText}>{emptyHint}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {showHeading ? <Text style={styles.sectionTitle}>{heading}</Text> : null}
      <View style={styles.grid}>
        {cards.map((c) =>
          isJamOfferCard(c) ? (
            <JamTrackCard key={c.id} card={c} vbuckIcon={q.data?.vbuckIcon ?? null} />
          ) : (
            <ShopCard key={c.id} card={c} vbuckIcon={q.data?.vbuckIcon ?? null} />
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.foreground },
  grid: { gap: spacing.md },
  skeleton: {
    height: 320,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(24,24,27,0.5)",
  },
  errorBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  errorText: { color: colors.mutedForeground, fontSize: 14, marginTop: spacing.sm },
  emptyBox: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyText: { color: colors.mutedForeground, fontSize: 14, textAlign: "center", marginTop: spacing.sm },
  card: {
    position: "relative",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(12,12,15,0.9)",
    overflow: "hidden",
    minHeight: 320,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  cardJam: {
    borderColor: "rgba(56,189,248,0.35)",
  },
  cardShop: {
    borderColor: colors.border,
  },
  cardPast: {
    opacity: 0.88,
  },
  cardPressed: {
    transform: [{ translateY: -2 }, { scale: 1.01 }],
  },
  pastVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128,128,128,0.12)",
    zIndex: 5,
  },
  imgWrapJam: {
    aspectRatio: 16 / 10,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56,189,248,0.3)",
  },
  imgWrapShop: {
    aspectRatio: 16 / 10,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59,130,246,0.25)",
  },
  imgPlaceholder: {
    backgroundColor: "rgba(24,24,27,0.5)",
  },
  img: { width: "100%", height: "100%" },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
    justifyContent: "space-between",
  },
  cardHead: { gap: spacing.xs },
  artist: { fontSize: 14, fontWeight: "600", color: "rgba(59,130,246,0.9)" },
  jamTitle: { fontSize: 20, fontWeight: "800", color: colors.cardForeground, lineHeight: 26 },
  layoutName: {
    fontFamily: "monospace",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "rgba(244,244,245,0.75)",
  },
  shopTitle: { marginTop: 4, fontSize: 16, fontWeight: "700", color: colors.cardForeground, lineHeight: 22 },
  catBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.35)",
    backgroundColor: "rgba(59,130,246,0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  catBadgeText: { fontSize: 12, fontWeight: "500", color: colors.primary },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  vbIcon: { width: 16, height: 16, borderRadius: 8 },
  vbFallback: { fontSize: 16, color: colors.foreground },
  priceText: { fontSize: 14, fontWeight: "600", color: "#6ee7b7" },
  list: { gap: spacing.sm },
  listRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  listRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  listText: { flex: 1, minWidth: 0, color: "rgba(244,244,245,0.9)", fontSize: 14 },
  catPill: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(24,24,27,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  catPillText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "rgba(244,244,245,0.85)",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 4,
    marginTop: "auto",
  },
  countSep: { fontSize: 14, fontWeight: "900", color: colors.primary },
  mini: {
    flex: 1,
    minWidth: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(24,24,27,0.45)",
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  miniValue: { fontSize: 16, fontWeight: "600", color: colors.foreground },
  miniLabel: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "rgba(244,244,245,0.8)",
    marginTop: 2,
  },
  pastShop: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: 13,
    color: colors.mutedForeground,
  },
});
