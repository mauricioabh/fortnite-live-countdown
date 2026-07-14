/** Stable upsert key: one current Item Shop rotation banner (not per API hash). */
export const SHOP_ROTATION_EXTERNAL_KEY = "shop:rotation";

export interface ShopEventCandidate {
  kind: string;
  externalKey: string;
  /** ISO string or epoch ms — used when picking among legacy hash-keyed rows. */
  updatedAt: string | number | Date;
}

/**
 * Whether a shop row is superseded by the single current rotation event.
 * Legacy keys looked like `shop:rotation:<hash>`.
 */
export function isSupersededShopRotation(
  kind: string,
  externalKey: string,
): boolean {
  return kind === "shop" && externalKey !== SHOP_ROTATION_EXTERNAL_KEY;
}

/**
 * Keep at most one shop event for the dashboard: prefer the stable key,
 * otherwise the most recently updated shop row (legacy cleanup).
 */
export function dedupeShopEventsForDashboard<T extends ShopEventCandidate>(
  events: T[],
): T[] {
  const shop = events.filter((e) => e.kind === "shop");
  if (shop.length <= 1) return events;

  const preferred =
    shop.find((e) => e.externalKey === SHOP_ROTATION_EXTERNAL_KEY) ??
    [...shop].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];

  if (!preferred) return events;

  return events.filter(
    (e) => e.kind !== "shop" || e.externalKey === preferred.externalKey,
  );
}
