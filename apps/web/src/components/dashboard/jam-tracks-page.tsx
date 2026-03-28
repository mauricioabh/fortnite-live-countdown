"use client";

import { AppHeader } from "@/components/dashboard/app-header";
import { ShopOffersGrid } from "@/components/dashboard/shop-offers-grid";

export const JamTracksPage = () => {
  return (
    <>
      <AppHeader
        isEventsLoading={false}
        lastIngestLabel={null}
        sectionHint={null}
      />
      <ShopOffersGrid
        filter="jam"
        heading={null}
        emptyHint="No tracks in the current rotation, or the shop has not been re-ingested with the new classification yet."
      />
    </>
  );
};
