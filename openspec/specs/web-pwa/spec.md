## Purpose

Installable Progressive Web App for `apps/web`: Web App Manifest, PWA icons, viewport/theme metadata, minimal offline shell, and mobile/standalone UX for the dashboard shell and primary routes.

## Requirements

### Requirement: Installable web app manifest

The web app SHALL expose a Web App Manifest that enables install / Add to Home Screen with standalone display.

#### Scenario: Manifest describes a standalone app

- **WHEN** a client requests the site's web app manifest
- **THEN** the manifest includes a non-empty `name` and `short_name`
- **AND** `start_url` resolves to the app root (`/`)
- **AND** `display` is `standalone`
- **AND** `theme_color` and `background_color` are defined to match the dark shell branding

#### Scenario: Manifest icons meet install sizing

- **WHEN** a client reads the manifest icon list
- **THEN** the list includes PNG icons at least at 192×192 and 512×512
- **AND** those icon URLs are publicly reachable without authentication

### Requirement: PWA install metadata on documents

The root HTML document SHALL include viewport and theme metadata suitable for mobile browsers and installed PWAs.

#### Scenario: Viewport and theme color are present

- **WHEN** a user loads any authenticated or public HTML page of the web app
- **THEN** the document declares a mobile-appropriate viewport (including viewport-fit cover for notched devices)
- **AND** a theme color consistent with the dark shell is available to the browser

#### Scenario: Apple home-screen affordances

- **WHEN** a user adds the site to the home screen on iOS Safari
- **THEN** an apple touch icon is available
- **AND** Apple web app metadata indicates the intent to run without a conventional browser chrome where supported

### Requirement: Minimal offline shell

In production, the web app SHALL register a service worker that provides a minimal offline experience without serving stale authenticated dashboard data.

#### Scenario: Offline fallback when navigation fails

- **WHEN** a returning visitor is offline
- **AND** a navigation request cannot be satisfied from the network
- **THEN** the service worker serves a dedicated offline fallback page
- **AND** that page tells the user they are offline and can retry when connectivity returns

#### Scenario: APIs are not served from offline cache as fresh data

- **WHEN** the client requests `/api/events`, `/api/news`, `/api/shop`, or other app JSON APIs while offline
- **THEN** the system MUST NOT present cached API JSON as an up-to-date online dashboard
- **AND** the offline strategy remains network-first or network-only for those APIs

#### Scenario: Service worker does not run in local Next dev

- **WHEN** a developer runs the Next.js development server
- **THEN** the production service worker is not registered (or is equivalently disabled)
- **AND** hot reload continues to work without a sticky SW cache

### Requirement: Mobile-usable dashboard shell

The authenticated dashboard shell SHALL be usable on a phone-sized viewport without broken horizontal page overflow.

#### Scenario: Primary routes fit a 390px-wide viewport

- **WHEN** an authenticated user views `/`, `/news`, `/favoritos`, `/tienda`, `/jam-tracks`, or `/historial` at a 390px-wide viewport
- **THEN** the document body does not require horizontal scrolling of the whole page due to the shell layout
- **AND** section navigation remains reachable (horizontal chip scroll inside the nav is allowed)

#### Scenario: Safe areas in standalone mode

- **WHEN** the app is displayed in standalone / installed mode on a notched device
- **THEN** primary chrome (mobile nav / content top and bottom edges) respects safe-area insets so interactive controls are not clipped by the system UI

### Requirement: Readable countdown and history on small screens

Countdown UI and history SHALL remain readable and operable on phone-sized viewports.

#### Scenario: Hero countdown digits remain legible at 390px

- **WHEN** a hero countdown banner is shown at a 390px-wide viewport
- **THEN** countdown digit groups remain legible (not only ultra-tiny captions)
- **AND** the banner content does not overflow its card in a way that clips essential time units

#### Scenario: History remains usable via contained horizontal scroll

- **WHEN** an authenticated user views `/historial` at a 390px-wide viewport
- **THEN** wide tabular content may scroll horizontally inside its container
- **AND** that table scroll MUST NOT force the entire page shell to overflow horizontally

### Requirement: Install verification on target platforms

The shipped production (or preview) deployment SHALL be verifiable as installable on Android and addable on iOS.

#### Scenario: Android installability

- **WHEN** a user opens the production or preview HTTPS origin in a Chromium mobile browser that supports install criteria
- **AND** the manifest, icons, and service worker requirements above are satisfied
- **THEN** the browser can offer install / add-to-home-screen for the PWA

#### Scenario: iOS add to home screen

- **WHEN** a user uses Safari’s Add to Home Screen on the production or preview HTTPS origin
- **THEN** the home-screen icon launches the app toward `start_url`
- **AND** the experience uses the configured apple touch icon branding
