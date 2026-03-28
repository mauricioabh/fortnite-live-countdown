import { spacing } from "@fortnite-live-countdown/ui";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { ScreenShell } from "@/components/screen-shell";
import { ShopOffersSection } from "@/components/shop-offer-cards";

export default function TiendaScreen() {
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
          filter="other"
          heading={null}
          emptyHint="No offers in this category. Run ingest again if you just deployed changes."
        />
      </ScrollView>
    </ScreenShell>
  );
}
