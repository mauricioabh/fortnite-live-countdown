import { spacing } from "@fortnite-live-countdown/ui";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { ScreenShell } from "@/components/screen-shell";
import { ShopOffersSection } from "@/components/shop-offer-cards";

export default function JamTracksScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing["2xl"] + insets.bottom,
        }}
      >
        <AppHeader isEventsLoading={false} lastIngestLabel={null} sectionHint={null} />
        <ShopOffersSection
          filter="jam"
          heading={null}
          emptyHint="No tracks in the current rotation, or the shop has not been re-ingested with the new classification yet."
        />
      </ScrollView>
    </ScreenShell>
  );
}
