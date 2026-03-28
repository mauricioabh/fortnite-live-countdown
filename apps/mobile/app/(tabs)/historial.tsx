import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import type { HistoryApiResponse } from "@fortnite-live-countdown/types";
import { msUntilUtc } from "@fortnite-live-countdown/utils";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { HistoryTable } from "@/components/history-table";
import { ScreenShell } from "@/components/screen-shell";
import { fetchWithAuth } from "@/lib/auth-api";

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

export default function HistorialScreen() {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const q = useQuery({ queryKey: ["event-history"], queryFn: () => fetchHistory(getToken) });

  const sortedRows = useMemo(() => {
    const rows = q.data?.rows ?? [];
    return rows.slice().sort((a, b) => msUntilUtc(a.targetAt) - msUntilUtc(b.targetAt));
  }, [q.data?.rows]);

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: spacing["2xl"] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          isEventsLoading={q.isLoading}
          lastIngestLabel={null}
          sectionHint="Archived events (target more than 24h ago)"
        />

        {q.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {q.isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{q.error instanceof Error ? q.error.message : "Error"}</Text>
          </View>
        ) : null}

        {q.isSuccess ? <HistoryTable rows={sortedRows} formatCell={formatCell} /> : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, flexGrow: 1 },
  loading: { paddingVertical: spacing["2xl"], alignItems: "center" },
  errorBox: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  errorText: { color: colors.mutedForeground, fontSize: 14 },
});
