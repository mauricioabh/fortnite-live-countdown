import type { ShopOfferCardDTO } from "@fortnite-live-countdown/types";

/** Jam si la API ya lo marcó o hay ítems categorizados explícitamente como Jam track. */
export function isJamOfferCard(
  card: Pick<ShopOfferCardDTO, "offerSection" | "layoutName">,
): boolean {
  return card.offerSection === "jam";
}

export function isOtherShopOfferCard(
  card: Pick<ShopOfferCardDTO, "offerSection" | "layoutName">,
): boolean {
  return !isJamOfferCard(card);
}
