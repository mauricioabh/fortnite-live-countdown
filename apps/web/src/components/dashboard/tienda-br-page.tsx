"use client";

import { AppHeader } from "@/components/dashboard/app-header";
import { ShopOffersGrid } from "@/components/dashboard/shop-offers-grid";

export const TiendaBrPage = () => {
  return (
    <>
      <AppHeader
        isEventsLoading={false}
        lastIngestLabel={null}
        sectionHint={null}
      />
      <ShopOffersGrid
        filter="other"
        heading={null}
        emptyHint="No offers in this category. Run ingest again if you just deployed changes."
      />
    </>
  );
};
