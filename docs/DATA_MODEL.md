# Modelo de datos

## Visión general

- **`fortnite_event`:** filas de hitos / feed. Las de **countdown** (`source` distinto de `news`) alimentan Events; las de **`source = news`** (`external_key` `news:*`) son MOTDs informativos para `/news` (no countdown de producto).
- **`ingestion_run`:** una fila por ejecución del cron diario (auditoría y “última actualización”).
- **`fortnite_event_history`:** copia de filas de `fortnite_event` cuyo `target_at` ya pasó hace **más de 24 h**; se rellena al final de cada ingesta exitosa y la fila original se elimina del evento activo.
- **`user_favorite`:** favoritos por usuario (Clerk `user_id`): referencia a un evento activo (`target_type = event`, `target_key = fortnite_event.id`), oferta de tienda (`shop_offer` + id estable `op-{hash}-{idx}`), o fila de historial (`history` + `fortnite_event_history.id`). Índice único `(user_id, target_type, target_key)`.
- **Fase 2:** tablas `notification_preference`, `web_push_subscription`, `expo_push_token` (especificadas cuando se implemente).

## Entidades

### `FortniteEvent`

| Campo           | Tipo                 | Notas                                                                                                        |
| --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`            | UUID PK              |                                                                                                              |
| `external_key`  | text UNIQUE          | Clave estable para upsert (hash o id compuesto API + tipo)                                                   |
| `kind`          | text                 | `live_event`, `season`, `chapter`, `patch`, `competitive`, `shop`, `other`, …                                |
| `title`         | text                 |                                                                                                              |
| `subtitle`      | text nullable        |                                                                                                              |
| `target_at`     | timestamptz          | Para eventos reales: instante del hito. Para **news**: as-of del feed (`br.date`), **no** un endDate de MOTD |
| `starts_at`     | timestamptz nullable | Inicio opcional de ventana                                                                                   |
| `metadata`      | jsonb                | Shop/offers, o news: `newsId`, `body`, `tabTitle`, `publishedAt`, imagen, …                                  |
| `source`        | text                 | `seasons`, `news`, `shop`, `derived`                                                                         |
| `sort_priority` | int                  | Orden dentro del día (menor = más urgente)                                                                   |
| `visible`       | boolean              | Soft-hide sin borrar                                                                                         |
| `created_at`    | timestamptz          |                                                                                                              |
| `updated_at`    | timestamptz          |                                                                                                              |

### `IngestionRun`

| Campo             | Tipo                 | Notas                          |
| ----------------- | -------------------- | ------------------------------ |
| `id`              | UUID PK              |                                |
| `started_at`      | timestamptz          |                                |
| `finished_at`     | timestamptz nullable |                                |
| `status`          | text                 | `success`, `partial`, `failed` |
| `error_message`   | text nullable        |                                |
| `events_upserted` | int                  |                                |

### `FortniteEventHistory`

| Campo                                      | Tipo             | Notas                                         |
| ------------------------------------------ | ---------------- | --------------------------------------------- |
| `id`                                       | UUID PK          |                                               |
| `archived_at`                              | timestamptz      | Momento del archivo (default `now()`)         |
| `original_event_id`                        | UUID nullable    | `id` de la fila eliminada en `fortnite_event` |
| Resto (`external_key`, `kind`, `title`, …) | Igual que evento | Snapshot para `/historial`                    |

Índice en `archived_at` para listar lo más reciente primero.

## Criterio Events vs News

|           | Events (`/` + `GET /api/events`)                   | News (`/news` + `GET /api/news`)  |
| --------- | -------------------------------------------------- | --------------------------------- |
| Identidad | `source !== "news"` (y no `external_key` `news:*`) | `source === "news"` / `news:{id}` |
| UX        | Countdown (`useCountdown`)                         | Card informativa, sin timer       |
| Ejemplo   | `shop:rotation`                                    | MOTDs de `/v2/news`               |

Tras una sync exitosa de news, filas `news:*` ausentes del feed se marcan `visible = false` (sin hard-delete).

## Relaciones

- Un **IngestionRun** no tiene FK obligatoria a eventos; la relación es lógica (run del día → conjunto actual de filas).

## TypeScript (referencia)

```ts
export type FortniteEventKind =
  | "live_event"
  | "season"
  | "chapter"
  | "patch"
  | "competitive"
  | "shop"
  | "other";

export type IngestionStatus = "success" | "partial" | "failed";

export interface FortniteEventDTO {
  id: string;
  kind: FortniteEventKind;
  title: string;
  subtitle: string | null;
  targetAt: string; // ISO 8601 UTC
  startsAt: string | null;
  metadata: Record<string, unknown>;
  source: string;
  sortPriority: number;
}

export interface NewsItemDTO {
  id: string;
  externalKey: string;
  title: string;
  tabTitle: string | null;
  body: string;
  imageUrl: string | null;
  sortingPriority: number | null;
  publishedAt: string | null;
}
```

## Esquema Drizzle

Implementación canónica: `apps/web/src/db/schema.ts` (ver archivo en el repo).

### Migraciones

Usar `drizzle-kit` en `apps/web` con `DATABASE_URL` apuntando a Neon. Comandos típicos: `drizzle-kit generate`, `drizzle-kit migrate` (según script del package).
