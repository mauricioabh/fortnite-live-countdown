## Why

Users want the Next.js dashboard as an **installable home-screen app** on phones, without depending on the Expo client. The web app already has responsive building blocks, but it lacks a Web App Manifest, PWA icons, theme/viewport metadata, a minimal offline shell, and a dedicated polish pass for ~390px / standalone mode.

## What Changes

- Add a Web App Manifest and PWA icon set (192/512, maskable where applicable) generated from the existing asset pipeline.
- Expose install-oriented metadata (`themeColor`, Apple web app, `viewport-fit=cover`).
- Add a **production** service worker with **minimal offline**: cache static assets and show a simple offline fallback page; do **not** cache authenticated API/HTML for offline “data”.
- Polish the authenticated shell and key pages so they read well on mobile (safe areas, sticky/usable nav, readable countdowns, no broken layout overflow) and in `display: standalone`.
- Document install testing (Android Install + iOS Add to Home Screen) and add/extend Playwright coverage at 390px where useful.
- Product priority for this effort: **web instalable first**; Expo remains available but is not in scope of this change.

## Capabilities

### New Capabilities

- `web-pwa`: Installable Progressive Web App for `apps/web` — manifest, icons, metadata, minimal offline shell, and mobile/standalone UX requirements for the dashboard shell and primary routes.

### Modified Capabilities

- (none) — existing `countdown-events` / `news-section` requirements stay the same; this change adds a presentation/install layer, not event/news domain rules.

## Impact

- **Code:** `apps/web` (App Router metadata/manifest, layout/shell components, optional SW registration), `scripts/generate-assets.ts`, possibly `apps/web/public` icons and an offline page.
- **Deps:** likely a Next-compatible SW helper (e.g. Serwist / `@ducanh2912/next-pwa`) or a carefully scoped custom SW; none today.
- **Auth/Clerk:** middleware already excludes `webmanifest`; ensure SW/static offline assets stay public and do not break Clerk or HMR in dev.
- **Out of scope:** Web Push (PRD Fase 2), offline API/data caching, changes to Expo app behavior, destructive DB/schema work.
