export type FortniteEventKind =
  | "live_event"
  | "season"
  | "chapter"
  | "patch"
  | "competitive"
  | "shop"
  | "other";

export type IngestionStatus = "success" | "partial" | "failed";

export interface FortniteEventDTO {
  id: string;
  kind: FortniteEventKind;
  title: string;
  subtitle: string | null;
  targetAt: string;
  startsAt: string | null;
  metadata: Record<string, unknown>;
  source: string;
  sortPriority: number;
}

/** Heat tier for banner styling (maps to design tokens / Tailwind `heat.*`). */
export type HeatTier =
  | "red-intense"
  | "red-soft"
  | "orange-intense"
  | "orange-soft"
  | "blue-intense"
  | "blue-soft";

/** Jam tracks (Festival) vs other BR cosmetics and bundles. */
export type ShopOfferSection = "jam" | "other";

export interface ShopLabeledItemDTO {
  text: string;
  /** Display type (outfit, emote, pickaxe, …) when the API provides `brItems[].type`. */
  category: string | null;
}

export interface ShopOfferCardDTO {
  id: string;
  title: string;
  subtitle: string | null;
  targetAt: string;
  layoutName: string | null;
  /** All track / BR item names for this offer (empty if API only gave devName / layout). */
  items: string[];
  /** Set during ingest: tracks (`tracks` or Jam Track layout) vs general shop. */
  offerSection: ShopOfferSection;
  /** Per-item detail with category; if missing, the UI falls back to `items`. */
  labeledItems?: ShopLabeledItemDTO[];
  /** Offer thumbnail (same heuristic as the shop banner). */
  imageUrl?: string | null;
  /** Estimated offer price in V-Bucks when present in the shop payload. */
  vbucks?: number | null;
}

export interface ShopOffersResponse {
  shopDate: string | null;
  shopHash: string | null;
  vbuckIcon?: string | null;
  cards: ShopOfferCardDTO[];
}

/** @deprecated Use ShopOfferCardDTO */
export type DailyOperationCardDTO = ShopOfferCardDTO;
/** @deprecated Use ShopOffersResponse */
export type DailyOperationsResponse = ShopOffersResponse;

export interface EventsApiResponse {
  events: FortniteEventDTO[];
  lastIngest: {
    finishedAt: string | null;
    status: IngestionStatus;
    eventsUpserted: number;
  } | null;
}

/** Row archived from `fortnite_event` (target more than 24h ago). */
export interface HistoryEventDTO {
  id: string;
  archivedAt: string;
  originalEventId: string | null;
  externalKey: string;
  kind: string;
  title: string;
  subtitle: string | null;
  targetAt: string;
  startsAt: string | null;
  source: string;
  sortPriority: number;
}

export interface HistoryApiResponse {
  rows: HistoryEventDTO[];
}

/** Kind of item saved as a favorite (persisted in Neon). */
export type FavoriteTargetType = "event" | "shop_offer" | "history";

export interface UserFavoriteItemDTO {
  targetType: FavoriteTargetType;
  targetKey: string;
  createdAt: string;
}

export interface FavoritesListResponse {
  items: UserFavoriteItemDTO[];
}
