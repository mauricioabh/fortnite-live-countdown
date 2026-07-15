## Purpose

Informational BR Messages-of-the-Day (MOTDs) for Fortnite Live Countdown: dedicated News navigation and API, without countdown timers or fabricated end dates.

## Requirements

### Requirement: News navigation entry exists beside other dashboard sections

The web app SHALL expose a authenticated dashboard navigation item that routes to `/news`, at the same navigational level as Events, Favorites, Item Shop, and History.

#### Scenario: User opens News from the sidebar

- **WHEN** an authenticated user selects the News navigation item
- **THEN** the app navigates to `/news`
- **AND** the News item is presented alongside Events, Favorites, Tienda/Jam tracks, and Historial (not nested under Events)

### Requirement: News page shows BR MOTDs as informational cards

The system SHALL render BR Message-of-the-Day items on `/news` as informational content including title, body text, image when available, and tabTitle when available, without a countdown timer.

#### Scenario: MOTDs are listed without countdown

- **WHEN** an authenticated user views `/news` and at least one visible news item exists
- **THEN** each item displays title and body (and image/tabTitle when present)
- **AND** the UI does not show a live countdown driven by a synthetic or fabricated end date

#### Scenario: Empty news feed

- **WHEN** an authenticated user views `/news` and no visible news items exist
- **THEN** the page shows an empty state (not an error)
- **AND** does not fall back to rendering Events heroes

#### Scenario: News load failure

- **WHEN** `/api/news` fails while loading `/news`
- **THEN** the page shows an error state with a clear failure message
- **AND** does not invent placeholder MOTD dates

### Requirement: Dedicated news API returns informative DTOs

The system SHALL provide `GET /api/news` that returns visible BR MOTD records as informative DTOs (id, externalKey, title, tabTitle, body, imageUrl, sortingPriority, publishedAt) without requiring clients to interpret a countdown `targetAt` for display.

#### Scenario: Successful news list

- **WHEN** a client calls `GET /api/news`
- **THEN** the response includes an `items` array of news DTOs for rows with `source` news (or `external_key` prefix `news:`) and `visible = true`
- **AND** each item includes title and body suitable for informational display
- **AND** the API does not present fabricated countdown end times as product data

#### Scenario: News ordered by priority

- **WHEN** multiple news items are returned
- **THEN** items are ordered by sorting priority (ingest/`sort_priority` / metadata) so higher-priority MOTDs appear first

### Requirement: News ingest persists MOTDs without fake countdown ends

Fortnite news ingest SHALL continue to persist BR MOTDs from fortnite-api `/v2/news` for the News section, MUST NOT invent per-MOTD countdown end times via priority/`addMinutes` offsets for product use, and MUST store publish/as-of information from the API feed date in metadata (e.g. `publishedAt`).

#### Scenario: Ingest upserts news for News section

- **WHEN** the ingest cron successfully fetches `/v2/news` with non-hidden MOTDs
- **THEN** corresponding `fortnite_event` rows with `source = "news"` and `external_key` `news:{id}` are upserted
- **AND** metadata includes enough content for title/body/image/tabTitle/publishedAt on `/news`
- **AND** ingest does not use `addMinutes(baseDate, 720 - priority)` (or equivalent) to fabricate a MOTD end countdown

#### Scenario: Stale MOTDs leave the News feed

- **WHEN** a previously ingested `news:*` row is no longer present among non-hidden MOTDs in a successful news ingest
- **THEN** that row becomes unavailable to `GET /api/news` (hidden and/or archived per the migration design)
- **AND** it does not remain as a countdown hero on Events

### Requirement: News favorites remain minimal in v1

The system SHALL NOT require a new `user_favorite.target_type` of `news` for v1. If an existing favorite points at a news `fortnite_event` id with `target_type` `event`, Favorites MUST render it as informational news content without a countdown timer.

#### Scenario: Existing event favorite resolves to a news row

- **WHEN** a user has a favorite with `target_type = "event"` whose target is a visible news row
- **THEN** Favorites shows an informational news representation (no countdown)
- **AND** the system does not treat the news feed date as a milestone end time
