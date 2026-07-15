## 1. Assets and manifest

- [x] 1.1 Extend `scripts/generate-assets.ts` to emit PWA icons (192, 512, and maskable 512) into `apps/web/public`
- [x] 1.2 Add `apps/web/src/app/manifest.ts` with standalone display, start_url `/`, theme/background colors, and icon entries
- [x] 1.3 Confirm Clerk middleware still excludes manifest/static icon routes from auth protection

## 2. Document metadata

- [x] 2.1 Export Next `viewport` (`themeColor`, `viewportFit: "cover"`) from the root app layout path
- [x] 2.2 Extend root metadata with Apple web app fields and PWA icon references alongside existing apple-touch-icon

## 3. Minimal service worker and offline page

- [x] 3.1 Choose and wire a Next 15–compatible SW approach (Serwist / `@ducanh2912/next-pwa` / minimal custom) for production builds only
- [x] 3.2 Add a dedicated offline fallback page with a clear offline + retry message
- [x] 3.3 Configure caching: static assets + offline page allowed; navigations/APIs network-first or network-only (no stale API dashboard)
- [x] 3.4 Ensure SW registration is disabled during `next dev`

## 4. Mobile / standalone UX polish

- [x] 4.1 Apply `dvh` + `safe-area-inset` padding to the authenticated shell and sticky mobile nav
- [x] 4.2 Improve hero countdown legibility at ~390px (digit/label sizing and overflow)
- [x] 4.3 Verify Historial remains usable via container-scoped horizontal scroll (no full-page overflow)
- [x] 4.4 Smoke-adjust sign-in / sign-up containers for small viewports if they overflow

## 5. Verification

- [x] 5.1 Add or extend Playwright coverage at viewport 390 for shell/primary routes (no document-level horizontal overflow)
- [x] 5.2 On HTTPS preview/production: verify Android installability and iOS Add to Home Screen
- [x] 5.3 Verify airplane-mode / offline navigation shows the offline fallback (not a cached private dashboard)
- [x] 5.4 Update docs briefly (`docs/SCREENS.md` and/or `docs/TECH_STACK.md`) noting web PWA install support
