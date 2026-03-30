# Stack técnico

## Arquitectura

- **Monorepo Turborepo**
  - `apps/web` — Next.js 15+ (App Router), TypeScript, Tailwind, fuente de API + cron + Drizzle → Neon
  - `apps/mobile` — Expo (latest), TypeScript, Expo Router, consume solo la API de `apps/web`
  - `packages/types` — tipos compartidos (DTOs eventos, respuestas API)
  - `packages/utils` — helpers UTC, heat/color (opcional compartir)

## Stack base (obligatorio del proyecto)

| Pieza                        | Uso                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Next.js 15+, App Router      | Web, Route Handlers, cron                                                           |
| TypeScript                   | Todo el código                                                                      |
| Tailwind CSS                 | UI neón, responsive                                                                 |
| shadcn/ui                    | Componentes base                                                                    |
| Zustand                      | Estado UI cliente                                                                   |
| TanStack React Query         | Cache/refetch contra API propia                                                     |
| Zod                          | Validación env + respuestas API externa                                             |
| React Hook Form              | Formularios cuando apliquen                                                         |
| Clerk                        | `@clerk/nextjs` (web), `@clerk/clerk-expo` (mobile) — **email/contraseña + Google** |
| Neon + Drizzle + drizzle-kit | Persistencia eventos + runs de ingesta                                              |
| Vercel                       | Deploy web + Cron                                                                   |

## Stack extendido (este producto)

| Librería                                       | Versión (orientativa)  | Por qué                                             |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------- |
| `date-fns`                                     | ^4.x                   | Cálculos de diferencia en **UTC** como exige el PRD |
| `@neondatabase/serverless`                     | compatible con Drizzle | Driver serverless para Next                         |
| `drizzle-orm` / `drizzle-kit`                  | latest estable         | Schema y migraciones                                |
| `@t3-oss/env-nextjs`                           | latest                 | Variables de entorno tipadas                        |
| NativeWind (o estilo equivalente)              | según Expo             | Paridad Tailwind-like en mobile                     |
| `@sentry/nextjs`                               | latest                 | Errores producción web                              |
| `@vercel/analytics` / `@vercel/speed-insights` | latest                 | Métricas Vercel                                     |

## Fase 2

| Pieza                   | Uso                      |
| ----------------------- | ------------------------ |
| Web Push / proveedor    | Notificaciones navegador |
| `expo-notifications`    | Push móvil               |
| Tablas Neon adicionales | Preferencias y tokens    |

## Integración fortnite-api.com

- Endpoints: `/v2/seasons`, `/v2/news`, `/v2/shop/br` (según implementación del job).
- Autenticación: API key en header si el proveedor la exige (`FORTNITE_API_KEY`).
- **Frecuencia:** una vez al día vía cron; resultado en Neon.

## Clerk — configuración (Dashboard)

- Activar **Email / Password**.
- Activar **Google** en Social connections.
- URLs de redirect para desarrollo y producción (web + Expo deep links para OAuth).

## Neon + Drizzle

- `DATABASE_URL` en Vercel y local.
- `drizzle.config.ts` en `apps/web` apuntando a `src/db/schema.ts`.
- Migraciones versionadas en repo (carpeta `drizzle/` o convención del proyecto).

## Despliegue

- **Web:** Vercel proyecto → `apps/web`.
- **Cron:** `vercel.json` schedule → GET/POST al endpoint protegido con `CRON_SECRET`.
- **Mobile:** EAS Build / Expo para stores; variables `EXPO_PUBLIC_*`.
