import type { HistoryEventDTO } from "@fortnite-live-countdown/types";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface HistoryTableProps {
  rows: HistoryEventDTO[];
  formatCell: (iso: string) => string;
}

export function HistoryTable({ rows, formatCell }: HistoryTableProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={styles.table}>
        <View style={styles.thead}>
          <Text style={[styles.th, styles.c1]}>Archived</Text>
          <Text style={[styles.th, styles.c2]}>Target</Text>
          <Text style={[styles.th, styles.c3]}>Title</Text>
          <Text style={[styles.th, styles.c4]}>Kind</Text>
          <Text style={[styles.th, styles.c5]}>Source</Text>
          <Text style={[styles.th, styles.c6]}>Key</Text>
        </View>
        {rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>
              No history rows yet. After migrating the table and running ingestion, events whose countdown ended more
              than 24 hours ago will appear here.
            </Text>
          </View>
        ) : (
          rows.map((r) => (
            <Pressable key={r.id} style={({ pressed }) => [styles.tr, pressed && styles.trPressed]}>
              <Text style={[styles.td, styles.c1]}>{formatCell(r.archivedAt)}</Text>
              <Text style={[styles.td, styles.c2]}>{formatCell(r.targetAt)}</Text>
              <Text style={[styles.td, styles.c3]} numberOfLines={2}>
                {r.title}
              </Text>
              <Text style={[styles.td, styles.c4]}>{r.kind}</Text>
              <Text style={[styles.td, styles.c5]}>{r.source}</Text>
              <Text style={[styles.td, styles.c6]} numberOfLines={1}>
                {r.externalKey}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const MIN_W = 720;

const styles = StyleSheet.create({
  table: {
    minWidth: MIN_W,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(12,12,15,0.4)",
    overflow: "hidden",
  },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "rgba(24,24,27,0.5)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  th: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.mutedForeground,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.8)",
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  trPressed: {
    backgroundColor: "rgba(24,24,27,0.35)",
  },
  td: {
    fontSize: 12,
    color: colors.foreground,
  },
  c1: { width: 120 },
  c2: { width: 120 },
  c3: { flex: 1, minWidth: 160, maxWidth: 220, fontWeight: "500" },
  c4: { width: 100 },
  c5: { width: 90 },
  c6: { width: 160, fontFamily: "monospace", fontSize: 11, color: colors.mutedForeground },
  emptyRow: { padding: spacing.xl },
  emptyText: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
});
