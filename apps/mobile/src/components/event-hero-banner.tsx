import type { FortniteEventDTO, HeatTier } from "@fortnite-live-countdown/types";
import { getCountdownPastStatusText } from "@fortnite-live-countdown/utils";
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
import {
  backgroundImageFromMetadata,
  buildMetaLines,
  displaySubtitleForEvent,
  newsSummaryText,
} from "@/lib/event-display";

const HEAT_TO_NEON: Record<HeatTier, string> = {
  "red-intense": "#ff4d6d",
  "red-soft": "#fda4af",
  "orange-intense": "#fb923c",
  "orange-soft": "#fde047",
  "blue-intense": "#38bdf8",
  "blue-soft": "#93c5fd",
};

const HEAT_TO_TOKEN: Record<HeatTier, keyof typeof colors.heat> = {
  "red-intense": "redIntense",
  "red-soft": "redSoft",
  "orange-intense": "orangeIntense",
  "orange-soft": "orangeSoft",
  "blue-intense": "blueIntense",
  "blue-soft": "blueSoft",
};

const HEAT_TO_CELL_TINT: Record<HeatTier, string> = {
  "red-intense": "rgba(255, 77, 109, 0.45)",
  "red-soft": "rgba(253, 164, 175, 0.35)",
  "orange-intense": "rgba(251, 146, 60, 0.42)",
  "orange-soft": "rgba(253, 224, 71, 0.28)",
  "blue-intense": "rgba(56, 189, 248, 0.4)",
  "blue-soft": "rgba(147, 197, 253, 0.32)",
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

interface CountdownCellProps {
  heat: HeatTier;
  value: string;
  unitLabel: string;
  neon: string;
  backgroundUrl?: string;
}

function CountdownCell({ heat, value, unitLabel, neon, backgroundUrl }: CountdownCellProps) {
  const tint = HEAT_TO_CELL_TINT[heat];
  return (
    <View style={[styles.cell, { borderColor: "rgba(255,255,255,0.15)", shadowColor: neon }]}>
      {backgroundUrl ? (
        <Image source={{ uri: backgroundUrl }} style={styles.cellBg} blurRadius={24} />
      ) : null}
      <View
        style={[styles.cellTint, { backgroundColor: tint }]}
        pointerEvents="none"
      />
      <View style={styles.cellInner}>
        <Text
          style={[
            styles.cellValue,
            {
              color: "#e8f4ff",
              textShadowColor: neon,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            },
          ]}
        >
          {value}
        </Text>
        <Text style={styles.cellUnit}>{unitLabel}</Text>
      </View>
    </View>
  );
}

interface EventHeroBannerProps {
  event: FortniteEventDTO;
  heat: HeatTier;
  isTopPriority: boolean;
}

export function EventHeroBanner({ event, heat, isTopPriority }: EventHeroBannerProps) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(event.targetAt);
  const bgUrl = backgroundImageFromMetadata(event.metadata);
  const metaLines = useMemo(() => buildMetaLines(event), [event]);
  const summary = useMemo(
    () => (event.source === "news" ? newsSummaryText(event.metadata) : null),
    [event.metadata, event.source],
  );
  const displaySubtitle = useMemo(() => displaySubtitleForEvent(event), [event]);

  const borderColor = colors.heat[HEAT_TO_TOKEN[heat]];
  const neon = HEAT_TO_NEON[heat];

  const segments = [
    { id: "d", value: pad2(days), unitLabel: "Days" },
    { id: "h", value: pad2(hours), unitLabel: "Hours" },
    { id: "m", value: pad2(minutes), unitLabel: "Minutes" },
    { id: "s", value: pad2(seconds), unitLabel: "Seconds" },
  ] as const;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.article,
        {
          borderColor,
          opacity: isPast ? 0.88 : 1,
        },
        isTopPriority && !isPast ? styles.ring : null,
        !isPast && pressed ? styles.articlePressed : null,
      ]}
    >
      {isPast ? <View style={styles.pastVeil} pointerEvents="none" /> : null}
      <FavoriteStarButton targetType="event" targetKey={event.id} />
      <View style={styles.bgWrap} pointerEvents="none">
        {bgUrl ? (
          <Image source={{ uri: bgUrl }} style={styles.bgImage} resizeMode="cover" />
        ) : null}
        <View style={styles.bgFade} />
      </View>

      <View style={styles.body}>
        <View style={styles.headerBlock}>
          {isTopPriority && !isPast ? (
            <View style={[styles.badge, { borderColor: `${neon}66` }]}>
              <Text style={[styles.badgeText, { color: neon }]}>Next milestone</Text>
            </View>
          ) : null}
          <Text style={styles.eventTitle}>{event.title}</Text>
          {displaySubtitle ? <Text style={styles.subtitle}>{displaySubtitle}</Text> : null}
        </View>

        <View style={styles.timerRow}>
          {segments.map((seg, index) => (
            <Fragment key={seg.id}>
              {index > 0 ? (
                <Text style={[styles.colon, { color: neon }]} accessibilityElementsHidden>
                  :
                </Text>
              ) : null}
              <CountdownCell
                heat={heat}
                value={seg.value}
                unitLabel={seg.unitLabel}
                neon={neon}
                backgroundUrl={bgUrl}
              />
            </Fragment>
          ))}
        </View>

        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        <View style={styles.metaBlock}>
          {metaLines.map((c) => (
            <Text key={c.label} style={styles.metaLine}>
              <Text style={styles.metaLabel}>{c.label}: </Text>
              <Text style={styles.metaValue}>{c.value}</Text>
            </Text>
          ))}
        </View>

        {isPast ? (
          <Text style={styles.pastLine}>{getCountdownPastStatusText("event", event.targetAt)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  article: {
    position: "relative",
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: "rgba(12,12,15,0.85)",
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  ring: {
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  articlePressed: {
    transform: [{ scale: 1.008 }],
  },
  pastVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128,128,128,0.12)",
    zIndex: 5,
  },
  bgWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: "hidden",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
  },
  bgFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,5,8,0.5)",
  },
  body: {
    position: "relative",
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerBlock: { gap: spacing.xs },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  eventTitle: {
    color: colors.cardForeground,
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 15,
    fontWeight: "500",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 2,
    paddingVertical: spacing.xs,
  },
  colon: {
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 2,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  cellBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },
  cellTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  cellInner: {
    alignItems: "center",
    gap: 2,
    zIndex: 2,
    paddingHorizontal: 4,
  },
  cellValue: {
    fontFamily: "monospace",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 2,
  },
  cellUnit: {
    fontSize: 8,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
  },
  summaryBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: spacing.sm,
  },
  summaryText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  metaBlock: { gap: 4 },
  metaLine: { fontSize: 12 },
  metaLabel: { fontWeight: "600", color: colors.foreground },
  metaValue: { color: colors.foreground },
  pastLine: {
    marginTop: spacing.xs,
    fontFamily: "monospace",
    fontSize: 13,
    color: colors.mutedForeground,
  },
});
