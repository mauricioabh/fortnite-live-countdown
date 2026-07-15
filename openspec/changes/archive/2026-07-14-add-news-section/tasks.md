## 1. Types and shared contracts

- [x] 1.1 Add `NewsItemDTO` and `NewsApiResponse` (`items`, `lastIngest`) in `packages/types` and export from the package index
- [x] 1.2 Add a small shared helper (web) to detect news rows: `source === "news"` or `external_key` / `externalKey` starts with `news:`

## 2. Ingest: stop synthetic news countdowns

- [x] 2.1 In `buildIngestRows` (`apps/web/src/lib/fortnite/ingest.ts`), remove `addMinutes(..., 720 - priority)` for MOTDs
- [x] 2.2 Persist news metadata with `publishedAt` from `br.date`, fuller `body` (or longer preview), `tabTitle`, `sortingPriority`, image URL; set `target_at` to `parseISO(br.date)` only as feed as-of (not a MOTD end)
- [x] 2.3 After upsert, hide/archive `news:*` keys that disappeared from the latest non-hidden MOTD set (extend existing cron/archive path without destructive ad-hoc SQL)
- [x] 2.4 Update/adjust Vitest coverage for news ingest parsing and “no fabricated offset countdown” behavior

## 3. Events API and dashboard exclude news

- [x] 3.1 Filter `GET /api/events` to exclude news rows while keeping shop (and any other real-dated) visible events
- [x] 3.2 Confirm `/` (`DashboardPage`) only renders the filtered events list (no client-side reintroduction of news)
- [x] 3.3 Ensure Events empty state is acceptable when only news existed before
- [x] 3.4 Move or gate any `/api/events` MOTD image-hydration logic that assumed news heroes on Events so it does not break shop/events-only responses (hydrate via `/api/news` if needed)

## 4. News API

- [x] 4.1 Implement `GET /api/news` projecting `NewsItemDTO[]` from visible `source = "news"` rows, ordered by priority
- [x] 4.2 Register `/api/news` as public in middleware the same way as `/api/events` (if required)
- [x] 4.3 Return `lastIngest` consistently with events; handle DB/missing data with `{ error }` pattern used by neighboring routes

## 5. Web News UI and navigation

- [x] 5.1 Add `(main)/news/page.tsx` (and News page component) with loading, error, and empty states
- [x] 5.2 Render informational cards (title, tabTitle, body, image; optional static `publishedAt` label — no `useCountdown`)
- [x] 5.3 Add News / Noticias item to `dashboard-sidebar` pointing to `/news` at the same level as Events / Favorites / Tienda / Historial
- [x] 5.4 Use monorepo UI tokens (`p-lg`, semantic colors, etc.); no inline CSS or hardcoded secrets

## 6. Favorites MVP (minimal)

- [x] 6.1 On Favorites, when a `target_type: "event"` resolves to a news row, render an informational news card (no countdown)
- [x] 6.2 Do **not** add `target_type: "news"` in this change; document follow-up in task 9.x if a favorite button on News UI is desired later

## 7. Cleanup of existing synthetic news rows

- [x] 7.1 Rely on Events API filter so legacy synthetic `target_at` rows never appear on `/`
- [x] 7.2 On next cron (or a guarded one-shot in ingest), re-upsert/normalize news rows and soft-hide or archive obsolete `news:*` heroes per design Migration Plan
- [x] 7.3 Do not run destructive schema migrations or bulk deletes without explicit user approval

## 8. Documentation

- [x] 8.1 Update `docs/SCREENS.md`: document `/news`, clarify `/` excludes MOTDs; note Favorites news rendering if applicable
- [x] 8.2 Update `docs/DATA_MODEL.md`: news as informational `source=news` rows; Events vs News criterion; no fake countdown product meaning for MOTD `target_at`
- [x] 8.3 Align `docs/PRD.md` (or a short note) if it implies MOTDs are countdown heroes on the dashboard

## 9. Mobile follow-up (explicitly deferred)

- [x] 9.1 **Follow-up (deferred):** Add Expo `(tabs)/news` screen consuming `GET /api/news` with informational cards (no countdown) — out of scope for this web change; track in a future `FLC` Linear issue
- [x] 9.2 **Follow-up (deferred):** Register News tab in `apps/mobile/app/(tabs)/_layout.tsx` and decide tab overflow UX (5→6 tabs) — same as 9.1
- [x] 9.3 Rely on filtered `GET /api/events` (excludes `source=news`) so mobile Events does not need a client-side news filter in this change

## 10. Verification

- [x] 10.1 Manually verify: `/` has no MOTD heroes; `/news` lists MOTDs; shop rotation still on Events
- [x] 10.2 Manually verify: `/api/events` omits news; `/api/news` returns DTOs; auth shell still Clerk-gated for UI routes
- [x] 10.3 Run relevant unit tests (ingest/events filters); fix regressions
