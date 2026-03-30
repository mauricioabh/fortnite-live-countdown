/** Maps `type` from brItems (fortnite-api / Epic) to an English display label. */

const TYPE_TO_LABEL: Record<string, string> = {
  athenacharacter: "Outfit",
  athenaoutfit: "Outfit",
  outfit: "Outfit",
  athenaemote: "Emote",
  athenadance: "Emote",
  emote: "Emote",
  athenapickaxe: "Pickaxe",
  pickaxe: "Pickaxe",
  athenabackpack: "Back bling",
  backpack: "Back bling",
  backbling: "Back bling",
  athenaglider: "Glider",
  glider: "Glider",
  athenawrap: "Wrap",
  wrap: "Wrap",
  loadingscreen: "Loading screen",
  loading_screen: "Loading screen",
  musictrack: "Jam track",
  jamtrack: "Jam track",
  music: "Music",
  contrail: "Contrail",
  athenaitembundle: "Bundle / set",
  bundle: "Bundle / set",
  itembundle: "Bundle / set",
  spray: "Spray",
  emoji: "Emoji",
  toy: "Toy",
  banner: "Banner icon",
  pet: "Pet",
};

function normalizeTypeKey(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
}

export function brItemCategoryFromRaw(
  item: Record<string, unknown>,
): string | null {
  const t = item.type;
  let key = "";
  if (typeof t === "string") key = normalizeTypeKey(t);
  else if (t && typeof t === "object") {
    const o = t as {
      value?: unknown;
      displayValue?: unknown;
      backendValue?: unknown;
      name?: unknown;
    };
    const v = o.value ?? o.backendValue ?? o.displayValue ?? o.name;
    if (typeof v === "string") key = normalizeTypeKey(v);
  }
  if (!key) return null;
  if (TYPE_TO_LABEL[key]) return TYPE_TO_LABEL[key];
  const singular = key.replace(/s$/, "");
  if (TYPE_TO_LABEL[singular]) return TYPE_TO_LABEL[singular];
  return key.replace(/_/g, " ");
}
