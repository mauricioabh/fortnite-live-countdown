import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import type {
  EventsApiResponse,
  FortniteEventDTO,
  FavoritesListResponse,
  HistoryApiResponse,
  HistoryEventDTO,
  ShopOffersResponse,
} from "@fortnite-live-countdown/types";
import { heatTierForIndex, msUntilUtc } from "@fortnite-live-countdown/utils";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { EventHeroBanner } from "@/components/event-hero-banner";
import { FavoriteHistoryCard } from "@/components/favorite-history-card";
import { ScreenShell } from "@/components/screen-shell";
import { JamTrackCard, ShopCard } from "@/components/shop-offer-cards";
import { apiUrl } from "@/lib/api";
import { fetchWithAuth } from "@/lib/auth-api";
import { isJamOfferCard, isOtherShopOfferCard } from "@/lib/shop-offer";

async function fetchFavorites(getToken: () => Promise<string | null>): Promise<FavoritesListResponse> {
  const res = await fetchWithAuth("/api/favorites", getToken, { method: "GET" });
  if (!res.ok) throw new Error("Could not load favorites");
  return res.json() as Promise<FavoritesListResponse>;
}

async function fetchEvents(): Promise<EventsApiResponse> {
  const res = await fetch(apiUrl("/api/events"));
  if (!res.ok) throw new Error("Could not load events");
  return res.json() as Promise<EventsApiResponse>;
}

async function fetchShop(): Promise<ShopOffersResponse> {
  const res = await fetch(apiUrl("/api/shop/daily-ops"));
  if (!res.ok) throw new Error("Could not load the shop");
  return res.json() as Promise<ShopOffersResponse>;
}

async function fetchHistory(getToken: () => Promise<string | null>): Promise<HistoryApiResponse> {
  const res = await fetchWithAuth("/api/history", getToken, { method: "GET" });
  if (!res.ok) throw new Error("Could not load history");
  return res.json() as Promise<HistoryApiResponse>;
}

function formatCell(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default function FavoritosScreen() {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();

  const favQ = useQuery({ queryKey: ["favorites"], queryFn: () => fetchFavorites(getToken) });
  const eventsQ = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const shopQ = useQuery({ queryKey: ["shop-offers"], queryFn: fetchShop });
  const historyQ = useQuery({ queryKey: ["event-history"], queryFn: () => fetchHistory(getToken) });

  const eventIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const i of favQ.data?.items ?? []) {
      if (i.targetType === "event") ids.add(i.targetKey);
    }
    return ids;
  }, [favQ.data?.items]);

  const shopIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const i of favQ.data?.items ?? []) {
      if (i.targetType === "shop_offer") ids.add(i.targetKey);
    }
    return ids;
  }, [favQ.data?.items]);

  const historyIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const i of favQ.data?.items ?? []) {
      if (i.targetType === "history") ids.add(i.targetKey);
    }
    return ids;
  }, [favQ.data?.items]);

  const favoritedEvents = useMemo(() => {
    const all = eventsQ.data?.events ?? [];
    const filtered = all.filter((e) => eventIdSet.has(e.id));
    return filtered.slice().sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [eventsQ.data?.events, eventIdSet]);

  const favoritedJam = useMemo(() => {
    const cards = shopQ.data?.cards ?? [];
    return cards
      .filter((c) => shopIdSet.has(c.id) && isJamOfferCard(c))
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [shopQ.data?.cards, shopIdSet]);

  const favoritedShopOther = useMemo(() => {
    const cards = shopQ.data?.cards ?? [];
    return cards
      .filter((c) => shopIdSet.has(c.id) && isOtherShopOfferCard(c))
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [shopQ.data?.cards, shopIdSet]);

  const favoritedHistory = useMemo(() => {
    const rows = historyQ.data?.rows ?? [];
    return rows
      .filter((r) => historyIdSet.has(r.id))
      .slice()
      .sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [historyQ.data?.rows, historyIdSet]);

  const isLoading = favQ.isLoading || eventsQ.isLoading || shopQ.isLoading || historyQ.isLoading;
  const isError = favQ.isError || eventsQ.isError || shopQ.isError || historyQ.isError;

  const totalCount =
    favoritedEvents.length + favoritedJam.length + favoritedShopOther.length + favoritedHistory.length;

  return (
    <ScreenShell>
      <AppHeader
        isEventsLoading={isLoading}
        lastIngestLabel={null}
        sectionHint="Your saved events, offers, and history items"
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: spacing["2xl"] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {favQ.error instanceof Error
                ? favQ.error.message
                : eventsQ.error instanceof Error
                  ? eventsQ.error.message
                  : shopQ.error instanceof Error
                    ? shopQ.error.message
                    : historyQ.error instanceof Error
                      ? historyQ.error.message
                      : "Failed to load favorites"}
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!isLoading && !isError && totalCount === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyHint}>Use the heart on event or shop cards to save them here.</Text>
          </View>
        ) : null}

        {!isLoading && !isError && favoritedEvents.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.h2}>Events</Text>
            {favoritedEvents.map((event: FortniteEventDTO, index: number) => (
              <EventHeroBanner
                key={event.id}
                event={event}
                heat={heatTierForIndex(index, favoritedEvents.length)}
                isTopPriority={index === 0}
              />
            ))}
          </View>
        ) : null}

        {!isLoading && !isError && (favoritedJam.length > 0 || favoritedShopOther.length > 0) ? (
          <View style={styles.block}>
            <Text style={styles.h2}>Shop and Jam tracks</Text>
            {favoritedJam.length > 0 ? (
              <>
                <Text style={styles.h3}>Jam tracks</Text>
                {favoritedJam.map((c) => (
                  <JamTrackCard key={c.id} card={c} vbuckIcon={shopQ.data?.vbuckIcon ?? null} />
                ))}
              </>
            ) : null}
            {favoritedShopOther.length > 0 ? (
              <>
                <Text style={styles.h3}>Item Shop</Text>
                {favoritedShopOther.map((c) => (
                  <ShopCard key={c.id} card={c} vbuckIcon={shopQ.data?.vbuckIcon ?? null} />
                ))}
              </>
            ) : null}
          </View>
        ) : null}

        {!isLoading && !isError && favoritedHistory.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.h2}>History</Text>
            {favoritedHistory.map((r: HistoryEventDTO) => (
              <FavoriteHistoryCard key={r.id} row={r} formatCell={formatCell} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md },
  loading: { paddingVertical: spacing["2xl"], alignItems: "center" },
  errorBox: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(239,68,68,0.05)",
    marginBottom: spacing.md,
  },
  errorText: { color: colors.mutedForeground, fontSize: 14 },
  emptyBox: {
    padding: spacing["2xl"],
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.foreground },
  emptyHint: { marginTop: spacing.sm, fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
  block: { marginBottom: spacing.xl },
  h2: { fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md },
  h3: { fontSize: 16, fontWeight: "500", color: colors.mutedForeground, marginBottom: spacing.sm },
});
