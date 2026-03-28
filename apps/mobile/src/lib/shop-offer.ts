import type { ShopOfferCardDTO } from "@fortnite-live-countdown/types";

export function isJamOfferCard(card: Pick<ShopOfferCardDTO, "offerSection">): boolean {
  return card.offerSection === "jam";
}

export function isOtherShopOfferCard(card: Pick<ShopOfferCardDTO, "offerSection">): boolean {
  return !isJamOfferCard(card);
}
