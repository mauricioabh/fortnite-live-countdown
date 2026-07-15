/** Discriminator for BR MOTD rows persisted as `fortnite_event`. */
export function isNewsEvent(row: {
  source?: string | null;
  externalKey?: string | null;
  external_key?: string | null;
}): boolean {
  if (row.source === "news") return true;
  const key = row.externalKey ?? row.external_key ?? "";
  return key.startsWith("news:");
}
