---
linear_story_id: WAY-70
linear_story_identifier: WAY-70
linear_story_title: "[FLC] Sección News — separar MOTDs del dashboard Events"
linear_story_url: "https://linear.app/wayool/issue/WAY-70/flc-seccion-news-separar-motds-del-dashboard-events"
linear_story_state: In Progress
linear_team: Wayool
linear_project: fortnite-live-countdown
---

## Why

Los MOTD de `/v2/news` se persisten hoy como `fortnite_event` con `target_at` sintético (`addMinutes` según prioridad) y aparecen como hero countdowns en `/`. Esas fechas no vienen de la API y engañan al usuario, que espera timers solo para hitos reales (p. ej. rotación del Item Shop). Hay que separar News informativa de Events con cuenta atrás real.

## What Changes

- Nueva sección de navegación web **News** (UI: "News" / "Noticias"), al mismo nivel que Events, Favorites, Tienda, Jam tracks e Historial.
- Nueva ruta UI `/news` con cards/list de MOTD BR (título, body, imagen, `tabTitle`) **sin countdown**, salvo que en el futuro exista una fecha real en origen.
- **BREAKING (producto):** `/` (Events) deja de mostrar filas `source === "news"` / `external_key` `news:*`. Solo quedan hitos con fecha real (shop rotation y futuros seasons/live events).
- Ingest sigue trayendo `/v2/news` desde fortnite-api; el diseño elige lectura desde DB filtrada + endpoint dedicado `GET /api/news` (sin inventar `target_at` para la UX de News).
- Cleanup/migración de filas news sintéticas existentes (ocultar/archivar) para que no reaparezcan en Events.
- Favoritos: MVP mínimo — favoritar news por `target_type` nuevo o reutilizar `event` solo si el id sigue vivo; si complica el cleanup, deferir a follow-up explícito.
- Mobile (Expo): alinear tab/sección News si el patrón de 5 tabs lo permite; si no, follow-up en tasks.
- Actualizar `docs/SCREENS.md` y `docs/DATA_MODEL.md` (y PRD si contradice el flujo).

## Capabilities

### New Capabilities

- `news-section`: Navegación, pantalla `/news`, contrato de API de MOTDs informativos y criterios de presentación (sin countdown fake).
- `countdown-events`: Requisitos del dashboard Events (`/` + `/api/events`): solo eventos con `target_at` real; exclusión de news sintéticas y cleanup post-ingest.

### Modified Capabilities

- _(ninguna — no hay specs en `openspec/specs/` aún)_

## Impact

- **Web:** `dashboard-sidebar`, nueva página `(main)/news`, filtro en `DashboardPage` / `GET /api/events`, nuevo `GET /api/news`, posible DTO en `packages/types`.
- **Ingest:** `apps/web/src/lib/fortnite/ingest.ts` — dejar de fabricar `target_at` útil para countdown (o dejar de upsertar news en `fortnite_event` según design); cron archive/hide de `news:*`.
- **DB:** posible soft-hide (`visible=false`) / archive a history o tabla dedicada; sin secrets hardcodeados; migraciones destructivas requieren aprobación.
- **Favorites:** `user_favorite.target_type` hoy `event | shop_offer | history`; evaluar extensión `news`.
- **Mobile:** `apps/mobile/app/(tabs)/` — tab News o follow-up.
- **Docs:** `docs/SCREENS.md`, `docs/DATA_MODEL.md`, alinear mención de news en `docs/PRD.md` si aplica.
- **Auth:** Clerk igual que el resto de secciones autenticadas del `(main)` layout; API pública o alineada a `/api/events` según design.
