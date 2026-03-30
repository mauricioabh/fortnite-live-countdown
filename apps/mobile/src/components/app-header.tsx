import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@fortnite-live-countdown/ui";

import { HeaderUserMenu } from "@/components/header-user-menu";

const LOGO = require("../../assets/icon.png") as ImageSourcePropType;

interface AppHeaderProps {
  isEventsLoading?: boolean;
  lastIngestLabel?: string | null;
  sectionHint?: string | null;
}

export const AppHeader = ({
  isEventsLoading = false,
  lastIngestLabel = null,
  sectionHint = null,
}: AppHeaderProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={LOGO} style={styles.logo} accessibilityIgnoresInvertColors />
        <View style={styles.titles}>
          <View style={styles.titleRow}>
            <Text style={styles.fortnite}>FORTNITE</Text>
            <Text style={styles.live}>LIVE COUNTDOWN</Text>
          </View>
          {sectionHint ? <Text style={styles.hint}>{sectionHint}</Text> : null}
          {isEventsLoading || lastIngestLabel ? (
            <Text style={styles.ingest}>
              {isEventsLoading ? (
                <Text>Loading events…</Text>
              ) : (
                <Text>{lastIngestLabel}</Text>
              )}
            </Text>
          ) : null}
        </View>
      </View>
      <HeaderUserMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  left: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, minWidth: 0 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  titles: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: spacing.sm },
  fortnite: {
    color: "#ffffff",
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 22,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  live: {
    color: colors.mutedForeground,
    fontWeight: "600",
    fontSize: 16,
  },
  hint: { marginTop: spacing.xs, fontSize: 14, fontWeight: "500", color: colors.foreground },
  ingest: {
    marginTop: spacing.xs,
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.mutedForeground,
  },
});
