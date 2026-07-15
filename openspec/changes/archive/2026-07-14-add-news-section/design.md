## Context

Hoy el cron (`buildIngestRows` en `apps/web/src/lib/fortnite/ingest.ts`) mapea MOTDs de `GET https://fortnite-api.com/v2/news` a filas `fortnite_event` con:

- `external_key = news:{motd.id}`
- `kind = "other"`
- `source = "news"`
- `target_at = addMinutes(br.date, max(30, 720 - priority))` — **fecha fabricada**
- `metadata`: `newsId`, `bodyPreview` (280 chars), `sortingPriority`, `backgroundImageUrl`

`GET /api/events` devuelve todas las filas `visible = true` sin excluir news. `DashboardPage` las renderiza como `EventHeroBanner` con countdown. La tipificación débil (`kind: other`) hace que el discriminador fiable sea `source` / prefijo `news:`.

Secciones web actuales (sidebar): `/` Events, `/favoritos`, `/jam-tracks`, `/tienda`, `/historial`. **No existe `/news`.** Mobile tiene el mismo set de tabs.

Constraints: Turborepo (`apps/web`, `packages/types`); Clerk en `(main)`; tokens UI del monorepo; no secrets; no inventar fechas fake para MOTD; aprobación del usuario para cambios de schema Drizzle.

## Goals / Non-Goals

**Goals:**

- Sección **News** en web al mismo nivel que Events / Favorites / Tienda / Historial.
- Mostrar MOTDs BR como contenido informativo (título, body, imagen, tabTitle) sin countdown.
- Events (`/`) solo con hitos de fecha real; shop rotation permanece en Events.
- Mantener ingest de `/v2/news`; servir News vía API dedicada.
- Cleanup claro de filas news sintéticas existentes respecto al dashboard Events.
- Criterio explícito “evento real” vs “news informativa”.
- Docs SCREENS + DATA_MODEL (y PRD si contradice).
- Favoritos: MVP mínimo viable documentado.
- Mobile: alinear o follow-up explícito.

**Non-Goals:**

- Ingest de `/v2/seasons` o nuevos kinds de live events (sigue fuera; no bloquea News).
- Tabla `fortnite_news` separada en v1 (evita migración de schema; se puede evolucionar después).
- Cambiar el modelo visual completo del Item Shop / Tienda.
- Notificaciones push por news (Fase 2 del producto).
- Unificar response shape de APIs a `{ data, error }` en este change.
- i18n completa de labels (mantener patrón actual ES/EN del sidebar).

## Decisions

### D1 — Persistencia: seguir en `fortnite_event`, servir con `GET /api/news`

**Decisión:** Los MOTDs siguen en `fortnite_event` (`source = "news"`, `external_key` `news:*`). La UX de News no usa countdown. API dedicada `GET /api/news` proyecta un DTO informativo.

**Alternativas consideradas:**

| Opción                                               | Pros                                          | Contras                                                |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| A. Tabla `fortnite_news`                             | Modelo limpio                                 | Schema change + migrate favorites; requiere aprobación |
| B. **Keep `fortnite_event` + `/api/news` (elegida)** | Sin migración destructiva; reusa archive/cron | Mezcla semántica en una tabla                          |
| C. Solo filtro cliente sobre `/api/events`           | Rápido                                        | Filtra tarde; filtra raws con `targetAt` fake en red   |

**Rationale:** Cumple “mantener ingest” y “endpoint dedicado” sin tocar `schema.ts` en v1. Discriminador estable: `source === "news"` **o** `external_key LIKE 'news:%'`.

### D2 — Criterio “evento real” vs “news informativa”

|                  | Evento real (Events)                                   | News informativa                                         |
| ---------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Identidad        | `source ∈ {shop, seasons, derived, …}` y **no** `news` | `source === "news"` o `external_key` empieza por `news:` |
| Origen de tiempo | Campo de fecha de la API (p. ej. rotación shop)        | Feed MOTD; **sin endDate** hoy                           |
| `target_at`      | Instante real de hito                                  | No se usa para countdown; ver D3                         |
| UX               | Hero countdown (`useCountdown`)                        | Card/list: título, body, imagen, tabTitle                |

**Regla operativa Events:** una fila entra en `/` solo si `visible` y **no** es news (por `source`/`external_key`). Shop rotation (`kind: shop`, `source: shop`) **sí** permanece en Events (fecha real).

### D3 — Ingest: dejar de fabricar countdowns

**Decisión:** En `buildIngestRows`, para MOTDs:

1. **Eliminar** `addMinutes(..., 720 - priority)`.
2. Guardar en `metadata`: `newsId`, `body` (o preview largo + flag), `tabTitle`, `sortingPriority`, `backgroundImageUrl`, `publishedAt` (= `br.date` ISO), y campos útiles del MOTD existentes.
3. `target_at`: fijar a `parseISO(br.date)` (fecha del payload de news — **as-of del feed**, no fin de MOTD). Sirve solo para orden/TTL de archive, **nunca** expuesto como countdown en News ni listado en Events.
4. Seguir limitando a MOTDs no `hidden`, orden por `sortingPriority`, tope razonable (p. ej. 6 o el que ya usa el código).
5. Filas `news:*` que dejen de venir en el feed: marcar `visible = false` y/o archivar en el mismo paso post-ingest que ya archiva stale events (extender criterio “keys ausentes del ingest” para news, además del archive por `target_at < now-24h`).

**Alternativa descartada:** dejar de upsertar news en DB y fetch live en `/api/news` — más simple short-term, pero pierde cache offline del cron y rompe historial/hidratación actual en `/api/events`.

### D4 — Rutas UI + API

| Superficie | Ruta                | Auth                                | Comportamiento                                                    |
| ---------- | ------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Events UI  | `/`                 | Clerk `(main)`                      | Solo eventos reales; **sin** MOTDs                                |
| News UI    | `/news`             | Clerk `(main)`                      | Lista/cards informativas; sin countdown                           |
| Events API | `GET /api/events`   | Pública (como hoy)                  | Query: `visible` **y** `source <> 'news'` (y/o not like `news:%`) |
| News API   | `GET /api/news`     | Pública (misma política que events) | `{ items: NewsItemDTO[], lastIngest }`                            |
| Nav        | `dashboard-sidebar` | —                                   | Item “News” / “Noticias” → `/news`                                |

**DTO propuesto** (`packages/types`):

```ts
interface NewsItemDTO {
  id: string; // fortnite_event.id
  externalKey: string; // news:{motdId}
  title: string;
  tabTitle: string | null;
  body: string; // texto informativo (no countdown)
  imageUrl: string | null;
  sortingPriority: number | null;
  publishedAt: string | null; // ISO, from br.date / metadata
}
```

No incluir `targetAt` en el DTO de News (o, si se necesita para debug, no usarlo en UI).

Middleware: añadir `/api/news` al matcher público junto a `/api/events` si aplica.

### D5 — Qué muestra `/` vs `/news`

|                        | `/` Events          | `/news`            |
| ---------------------- | ------------------- | ------------------ |
| Shop rotation banner   | Sí (fecha real)     | No                 |
| MOTDs                  | **No**              | Sí                 |
| Futuros seasons / live | Sí (cuando existan) | No                 |
| Countdown              | Sí                  | No                 |
| Empty state            | Sin hitos reales    | Sin MOTDs visibles |

### D6 — Favoritos (MVP mínimo)

**Decisión MVP:**

- **No** introducir `target_type: "news"` en este change.
- Mientras news viva en `fortnite_event`, un favorito existente `target_type: "event"` + UUID de fila news sigue siendo válido.
- En Favoritos: si el target resuelve a `source === "news"`, renderizar card informativa (sin timer), no hero countdown.
- **No** exigir botón “favoritar” en la nueva UI News en v1 si el coste supera el beneficio; follow-up opcional en tasks.

**Follow-up (fuera del path crítico):** `target_type: "news"` + `target_key = news:{id}` cuando/si se separe tabla.

### D7 — Mobile

**Decisión:** Web first. Mobile: **follow-up** explícito — hoy hay 5 tabs; añadir News implica crowding. Tasks incluirán ítem opcional/deferred: `(tabs)/news.tsx` + filtro/`/api/news`, sin bloquear apply web.

### D8 — UI tokens y componentes

- Tokens del monorepo (`packages/ui` / name del package).
- Cards lista informativas (título, tabTitle, body, imagen); no `EventHeroBanner` con timer.
- Loading / error / empty states obligatorios.
- Auth: misma shell `(main)` + Clerk que el resto.

## Risks / Trade-offs

- **[Semántica de tabla]** News y Events comparten `fortnite_event` → Mitigación: filtros API estrictos + docs DATA_MODEL; evolución futura a tabla dedicada.
- **[Archive por `target_at`]** Si todos los MOTDs comparten `br.date`, el archive a 24h puede borrar news aún relevantes o no — Mitigación: además de TTL, archive/hide de keys no presentes en el último ingest de news; considerar extender ventana o skip archive-by-age solo para `source=news` si hace falta.
- **[Favorites]** Favoritos de news con UX de countdown confunden → Mitigación: branch de render informativo en Favoritos (D6).
- **[Empty Events]** Tras excluir news, `/` puede quedar solo con shop (o vacío si shop falla) → Mitigación: empty state claro; seasons sigue siendo trabajo aparte.
- **[Mobile defer]** Paridad móvil atrasada → Mitigación: task follow-up marcado; API lista para consumo Expo.

## Migration Plan

1. **API filter (forward-compatible):** Deploy `GET /api/events` excluyendo news → `/` deja de mostrar MOTDs aunque la DB aún tenga `target_at` sintéticos.
2. **News surface:** Deploy `GET /api/news` + página `/news` + nav item.
3. **Ingest:** Deploy cambio D3 (sin `addMinutes`); próximos upserts normalizan metadata/`publishedAt`.
4. **Cleanup filas sintéticas existentes:**
   - Opción preferida (no destructiva): no borrar UUID de golpe; con el filtro de Events basta.
   - Recomendado en el mismo deploy de ingest: job one-shot o paso en cron que haga `visible = false` (o archive → `fortnite_event_history`) para `source = 'news'` cuyas filas aún tengan metadata sin `publishedAt` **opcional**, o simplemente re-upsert en el siguiente cron (overwrite `target_at` con `br.date`).
   - **No** SQL destructivo sin aprobación; preferir soft-hide + archive existente.
5. **Rollback:** Revertir filtro de `/api/events` reintroduciría MOTDs en Events (evitar); rollback de UI News es independiente (quitar nav + página). Mantener filtro Events aunque se retire `/news` temporalmente.
6. **Favorites:** IDs de news permanecen mientras las filas existan; tras archive, favorites huérfanos se comportan como hoy con history/missing — sin migración obligatoria en v1.

## Open Questions

- Copy final del nav: **"News"** vs **"Noticias"** (recomendación: **"News"** alineado a labels en inglés de Events/Favorites, o el mismo patrón bilingüe que ya use el sidebar).
- Tope de MOTDs en API (¿seguir en 6 o subir)? Recomendación: mantener 6 en ingest; API lee `visible` news ordenadas por `sort_priority` / `sortingPriority`.
- ¿Mostrar `publishedAt` (fecha del feed) en la card como “Actualizado” sin timer? Recomendación: sí, texto estático, no countdown.
