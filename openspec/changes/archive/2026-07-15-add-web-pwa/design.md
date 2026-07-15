## Context

`apps/web` is a Next.js 15 App Router dashboard with Clerk, Tailwind responsive layouts (horizontal nav under `lg`, stacked grids), and SEO/icons via `rootLayoutMetadata` + `scripts/generate-assets.ts` (favicon, apple-touch-icon, OG). There is **no** Web App Manifest, no 192/512 PWA icons, no `viewport`/`themeColor` export, and no service worker. Clerk middleware already excludes `webmanifest` from the protected matcher.

Product priority for this change: **installable web** over further Expo investment. Offline is intentionally minimal (shell / assets + fallback), not offline data.

Constraints: no secrets in repo; do not break Clerk auth or cron APIs; avoid SW interference with Next dev HMR; design tokens from `@fortnite-live-countdown/ui`; prefer extending `generate-assets` over a second icon pipeline.

## Goals / Non-Goals

**Goals:**

- Make the production site **installable** as a PWA (`standalone`) on Android Chrome and usable via **Add to Home Screen** on iOS Safari.
- Ship **minimal offline**: static asset caching + a clear offline fallback page when navigation fails offline.
- Polish authenticated shell and primary routes for ~390px width and safe areas in standalone mode.
- Keep install assets and middleware/public routes coherent with Clerk.

**Non-Goals:**

- Offline caching of `/api/*` or authenticated HTML “offline dashboard”.
- Web Push / notification preferences (PRD Fase 2).
- Reworking or removing `apps/mobile` Expo.
- Changing event/news domain rules or DB schema.
- Full redesign of desktop layout.

## Decisions

### D1 — Manifest via Next App Router `manifest.ts`

**Decisión:** Use Next Metadata Routes (`src/app/manifest.ts`) to serve the web app manifest (name, short_name, start_url `/`, `display: standalone`, theme/background colors aligned with the dark zinc/primary UI, icon entries pointing at generated PNGs).

**Alternativas:**

| Opción                                            | Pros                                                          | Contras                                                       |
| ------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| A. Static `public/manifest.webmanifest`           | Simple                                                        | Duplicates site name/colors; easy to drift from SEO constants |
| B. **`app/manifest.ts` (elegida)**                | Typed, colocated with App Router, shares `SITE_NAME` / colors | Next version quirks possible                                  |
| C. Third-party PWA plugin generates manifest only | Less code                                                     | Heavier dep for a small file                                  |

**Rationale:** Fits existing `lib/seo/site` + metadata patterns; middleware already allows `webmanifest`.

### D2 — Icons from `generate-assets`

**Decisión:** Extend `scripts/generate-assets.ts` to emit at least `icon-192.png`, `icon-512.png`, and a maskable 512 (safe-zone padding on brand canvas, background `#0c0c0f` or token-equivalent). Wire them in the manifest and in root metadata icons as needed. Keep existing apple-touch-icon.

**Alternativa descartada:** Hand-checkin binary icons only — diverges from isotipo SVG source of truth.

### D3 — Service worker: production-only, assets + offline fallback

**Decisión:** Add a Next-compatible SW integration (prefer **Serwist** or `@ducanh2912/next-pwa` if compatible with Next 15 in this repo; otherwise a minimal custom SW registered only in production). Strategy:

- Precache / cache-first for static assets (`_next/static`, public icons, offline page).
- Network-first or network-only for navigations and `/api/*` (no stale authenticated data).
- Dedicated `/offline` (or equivalent) fallback document for failed navigations when offline.
- **Do not register** the SW in `next dev` (or guard registration with `NODE_ENV === "production"`).

**Alternativas:**

| Opción                                     | Pros                        | Contras                                                                 |
| ------------------------------------------ | --------------------------- | ----------------------------------------------------------------------- |
| A. No SW                                   | Fewer moving parts          | Weaker installability/history on some Chrome versions; no offline shell |
| B. **Minimal SW (elegida)**                | Install + honest offline UX | Config + cache busting                                                  |
| C. Full Workbox runtime cache of pages/API | Feels “app-like” offline    | Conflicts with Clerk + `force-dynamic`; stale private data risk         |

**Rationale:** Matches agreed “offline mínimo” and avoids lying that countdowns work offline.

### D4 — Metadata: theme color, Apple web app, viewport

**Decisión:** Export Next `viewport` (including `themeColor`, `viewportFit: "cover"`) and Apple web app fields on the root layout metadata path. Align theme color with the dark shell (`#0c0c0f` / existing Clerk bg).

**Nota:** Root layout uses `dynamic = "force-dynamic"`; that stays for SSR/auth reasons. SW does not attempt to make the app fully offline-first.

### D5 — Mobile / standalone UX polish (targeted)

**Decisión:** Focus polish on:

1. **Shell:** `min-h-dvh` (or equivalent), padding with `env(safe-area-inset-*)` on main layout / sticky mobile nav.
2. **Nav:** Keep horizontal chip nav under `lg`; make it sticky (or sticky enough) with safe-area top; ensure labels remain tappable.
3. **Countdowns:** Raise minimum type size / spacing on hero units so digits remain readable at 390px (avoid ultra-tiny labels as the only hint).
4. **Historial:** Keep scrollable table as acceptable mobile pattern (`overflow-x-auto`); optional card layout is **nice-to-have**, not required for MVP of this change.
5. **Auth pages:** Ensure sign-in/up containers don’t overflow small viewports.

Primary routes to smoke: `/`, `/news`, `/favoritos`, `/tienda`, `/jam-tracks`, `/historial`, `/sign-in`.

### D6 — Testing & verify install

**Decisión:**

- Extend or add Playwright checks at viewport **390** for: no horizontal document overflow on shell + Events (and ideally Historial scrolls inside container, not the window).
- Manual / checklist: production or Vercel preview → Android Install; iOS Safari A2HS; offline → fallback page (airplane mode after first visit).
- Optional: Lighthouse PWA installability criteria on preview URL.

## Risks / Trade-offs

- **[Risk] SW breaks local/dev or serves stale bundles after deploy** → Mitigation: production-only registration; sensible cache versioning / update strategy from chosen SW lib.
- **[Risk] Install prompt never shows on HTTP localhost** → Mitigation: document testing via `dev:lan` + HTTPS preview/production; criteria verified on deployed URL.
- **[Risk] Clerk + SW cache authenticated HTML** → Mitigation: do not cache navigations/API offline beyond offline fallback.
- **[Risk] iOS A2HS UX differs from Android Install** → Mitigation: apple-touch-icon + `appleWebApp` metadata; acceptance criteria distinguish both platforms.
- **[Trade-off] Historial remains horizontal-scroll table** → Acceptable for MVP polish; cards deferred.
- **[Trade-off] Expo deprioritized** → Explicit product call; no Expo work in this change.

## Migration Plan

1. Generate PWA icons in CI/`generate-assets` (already part of `web` build).
2. Ship manifest + metadata + offline page + SW behind production build.
3. Deploy to Vercel preview → validate install + mobile smoke → promote.
4. Rollback: remove SW registration / revert change; static icons/manifest are harmless if left temporarily.

## Open Questions

- Exact SW library final pick after a quick compatibility check with Next 15.2 in this monorepo (Serwist vs `@ducanh2912/next-pwa` vs minimal custom) — decide at implement time; behavior requirements stay the same.
- Whether to add a tiny in-app “Install” hint UI for Android `beforeinstallprompt` — **optional**, not required for installability.
