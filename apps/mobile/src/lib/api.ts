export function getApiBaseUrl(): string {
  const base = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3000";
  return base.replace(/\/$/, "");
}

export function apiUrl(pathname: string): string {
  const base = getApiBaseUrl();
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${p}`;
}
