import type { HistoryEventDTO } from "@fortnite-live-countdown/types";
import { colors, spacing } from "@fortnite-live-countdown/ui";
import { StyleSheet, Text, View } from "react-native";

import { FavoriteStarButton } from "@/components/favorite-star-button";

interface FavoriteHistoryCardProps {
  row: HistoryEventDTO;
  formatCell: (iso: string) => string;
}

export function FavoriteHistoryCard({ row, formatCell }: FavoriteHistoryCardProps) {
  return (
    <View style={styles.card}>
      <FavoriteStarButton targetType="history" targetKey={row.id} />
      <Text style={styles.title}>{row.title}</Text>
      <Text style={styles.meta}>
        {row.kind} · {row.source}
      </Text>
      <Text style={styles.mono}>Target: {formatCell(row.targetAt)}</Text>
      <Text style={styles.mono}>Archived: {formatCell(row.archivedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(12,12,15,0.8)",
    padding: spacing.md,
    paddingRight: 52,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: { fontWeight: "600", color: colors.foreground, paddingRight: 4 },
  meta: { fontSize: 12, color: colors.mutedForeground },
  mono: { fontFamily: "monospace", fontSize: 12, color: colors.mutedForeground },
});
