# Variables de entorno

## `apps/web`

| Variable                            | Obligatoria     | Descripción                                    |
| ----------------------------------- | --------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí              | Clerk (público)                                |
| `CLERK_SECRET_KEY`                  | Sí              | Clerk servidor                                 |
| `DATABASE_URL`                      | Sí              | Neon PostgreSQL (connection string)            |
| `FORTNITE_API_KEY`                  | Según API       | Clave fortnite-api.com si aplica               |
| `CRON_SECRET`                       | Sí (producción) | Bearer o query secret para el endpoint de cron |
| `SENTRY_DSN`                        | No              | Sentry Next.js                                 |
| `SENTRY_AUTH_TOKEN`                 | CI opcional     | Releases/source maps                           |

### Opcional

| Variable               | Uso                                  |
| ---------------------- | ------------------------------------ |
| `NEXT_PUBLIC_APP_URL`  | URL canónica (OG, redirects)         |
| `CLERK_WEBHOOK_SECRET` | Webhooks Clerk (fase 2 sync usuario) |

## `apps/mobile`

| Variable                            | Obligatoria | Descripción                           |
| ----------------------------------- | ----------- | ------------------------------------- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí          | Mismo proyecto Clerk (publishable)    |
| `EXPO_PUBLIC_API_URL`               | Sí          | Base URL del Next app (`https://...`) |

### Fase 2 — notificaciones

| Variable                 | Uso                                     |
| ------------------------ | --------------------------------------- |
| `EXPO_PUBLIC_PROJECT_ID` | Expo project id si hace falta para push |
| Claves FCM / APNs        | En EAS secrets, no en repo              |

## Archivos locales

- `apps/web/.env.local` — desarrollo; **no** commitear.
- `apps/web/.env.example` — mismas keys con valores vacíos o placeholder; **sí** commitear.
- `apps/mobile/.env.local` y `.env.example` — análogo.

## Validación tipada

- Centralizar en `apps/web/src/env.ts` con `@t3-oss/env-nextjs` + Zod.
