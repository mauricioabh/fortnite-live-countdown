import { useQuery } from "@tanstack/react-query";
import type { EventsApiResponse, FortniteEventDTO } from "@fortnite-live-countdown/types";
import { heatTierForIndex, msUntilUtc } from "@fortnite-live-countdown/utils";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "@/components/app-header";
import { EventHeroBanner } from "@/components/event-hero-banner";
import { ScreenShell } from "@/components/screen-shell";
import { apiUrl } from "@/lib/api";

async function fetchEvents(): Promise<EventsApiResponse> {
  const res = await fetch(apiUrl("/api/events"));
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<EventsApiResponse>;
}

function heatTierFromIndex(index: number, total: number) {
  return heatTierForIndex(index, total);
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const q = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  const sorted =
    q.data?.events.slice().sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt)) ?? [];

  const lastIngestLabel =
    q.data?.lastIngest?.finishedAt != null
      ? `Last updated ${formatDistanceToNow(new Date(q.data.lastIngest.finishedAt), { locale: enUS, addSuffix: true })}`
      : q.data?.lastIngest === null && (q.data?.events.length ?? 0) === 0
        ? "Run the ingest cron to populate Neon"
        : null;

  if (q.isLoading) {
    return (
      <ScreenShell>
        <AppHeader isEventsLoading lastIngestLabel={null} sectionHint={null} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </ScreenShell>
    );
  }

  if (q.isError) {
    return (
      <ScreenShell>
        <AppHeader isEventsLoading={false} lastIngestLabel={null} sectionHint={null} />
        <View style={styles.center}>
          <Text style={styles.error}>{q.error instanceof Error ? q.error.message : "Error"}</Text>
          <Text style={styles.muted}>Check EXPO_PUBLIC_API_URL and that the web app is running.</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <AppHeader
        isEventsLoading={false}
        lastIngestLabel={lastIngestLabel}
        sectionHint="Main countdown — same data as the web app"
      />
      <FlatList<FortniteEventDTO>
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: spacing["2xl"] + insets.bottom }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No events in the database</Text>
            <Text style={styles.muted}>
              Set DATABASE_URL on the web app and run POST /api/cron/ingest-fortnite with Authorization: Bearer
              CRON_SECRET.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <EventHeroBanner
            event={item}
            heat={heatTierFromIndex(index, sorted.length)}
            isTopPriority={index === 0}
          />
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md, flexGrow: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  muted: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
  error: { color: colors.destructive, fontSize: 16, fontWeight: "600", textAlign: "center" },
  empty: { padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.foreground, textAlign: "center" },
});
