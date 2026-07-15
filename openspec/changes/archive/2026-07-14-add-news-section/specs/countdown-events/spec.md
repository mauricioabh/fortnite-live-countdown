## ADDED Requirements

### Requirement: Events dashboard only lists real-dated milestones

The Events experience at `/` SHALL display only Fortnite milestones that qualify as real-dated events and MUST NOT display BR MOTD / news rows.

#### Scenario: News MOTDs are absent from Events

- **WHEN** an authenticated user views `/`
- **AND** the database contains visible rows with `source = "news"` (or `external_key` prefix `news:`)
- **THEN** those news rows do not appear as hero countdown banners on `/`

#### Scenario: Shop rotation remains on Events

- **WHEN** a visible shop rotation event with a real API-derived `target_at` exists
- **THEN** that shop rotation milestone still appears on `/` as a countdown event
- **AND** it is not moved into the News section

#### Scenario: Events empty after excluding news

- **WHEN** no real-dated visible events remain after excluding news
- **THEN** `/` shows the Events empty state
- **AND** does not substitute MOTDs to fill the dashboard

### Requirement: Events API excludes news rows

`GET /api/events` SHALL return only visible non-news events suitable for countdown display.

#### Scenario: API filters out news sources

- **WHEN** a client calls `GET /api/events`
- **AND** visible news rows exist in `fortnite_event`
- **THEN** the `events` array does not include rows where `source = "news"` or `external_key` starts with `news:`
- **AND** visible real-dated events (including shop) remain included when present

### Requirement: Real event vs news discriminant

The system SHALL treat a row as news-informational when `source === "news"` or `external_key` starts with `news:`. The system SHALL treat other visible countdown sources with API-derived milestone times (including `source = "shop"`) as real events for Events.

#### Scenario: Classification by source and external key

- **WHEN** classifying a persisted row for Events vs News
- **THEN** `news:*` / `source = "news"` rows are routed only to the News capability
- **AND** shop/other real-dated milestones remain eligible for Events countdowns

### Requirement: Synthetic news countdowns are cleaned up for Events

After deploy, existing synthetic news countdown rows MUST NOT surface on Events. Cleanup SHALL prefer soft-hide and/or archive via existing ingest/archive paths over destructive schema drops without approval.

#### Scenario: Pre-existing synthetic news rows after filter deploy

- **WHEN** the database still contains older news rows whose `target_at` was generated with priority offsets
- **THEN** those rows do not appear in `GET /api/events` or on `/`
- **AND** subsequent ingest normalizes news persistence without reintroducing fabricated countdown ends for Events

#### Scenario: Soft cleanup of obsolete news heroes

- **WHEN** post-deploy cleanup or cron runs against obsolete `news:*` rows that should not be active heroes
- **THEN** rows are hidden (`visible = false`) and/or archived using the project’s archive mechanism
- **AND** no unchecked hard-delete of unrelated event types occurs
