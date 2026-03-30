# Live countdown for Fortnite

Monorepo (Turborepo): dashboard web **Next.js** + app **Expo**, datos en **Neon** tras ingesta diaria desde fortnite-api. Documentación en [`docs/`](docs/).

## Requisitos

- Node.js 20+
- Cuentas: [Clerk](https://dashboard.clerk.com), [Neon](https://neon.tech), [Vercel](https://vercel.com) (cron)

## Desarrollo

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
# Rellena NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, DATABASE_URL, …

npm run dev
```

- Web: [http://localhost:3000](http://localhost:3000) (Turborepo ejecuta `dev` en los workspaces; si hace falta: `npm run dev -w web`).
- Mobile: `npm run start -w mobile` (Expo).

## Scripts útiles

| Comando                      | Descripción                                           |
| ---------------------------- | ----------------------------------------------------- |
| `npm run build`              | Turbo build (todos los workspaces con script `build`) |
| `npm run lint`               | Turbo lint                                            |
| `npm run test`               | Vitest (web) + no-ops en otros paquetes               |
| `npm run test:e2e`           | Playwright en `apps/web`                              |
| `npm run db:generate -w web` | Generar migraciones Drizzle                           |

## Estructura

```
apps/web/          Next.js — API, cron, Drizzle, Clerk
apps/mobile/       Expo — consume la API web
packages/types/    DTOs compartidos
packages/utils/    Helpers (p. ej. date-fns / UTC)
docs/              PRD, pantallas, modelo de datos, env, etc.
```

---

## Tu proyecto está listo

La base del **PASO 6** del onboarding está aplicada: monorepo, web con Clerk (sign-in / sign-up), Drizzle schema, Vitest, Playwright, Husky + commitlint, CI/GitHub, Dependabot, plantillas de PR/issues.

### Siguientes pasos (lo que el comando pedía y aún debes completar o conectar)

1. **Clerk Dashboard:** activar Email/Password y Google; pegar claves reales en `apps/web/.env.local` y `apps/mobile/.env.local`.
2. **Neon:** crear proyecto, `DATABASE_URL`, ejecutar `npm run db:generate -w web` y migrar (`drizzle-kit migrate` o flujo que elijas).
3. **Ingesta diaria:** implementar `GET/POST /api/cron/ingest-fortnite` con validación de `CRON_SECRET`, llamadas a `/v2/seasons`, `/v2/news`, `/v2/shop/br` y upsert a `fortnite_event`.
4. **UI del dashboard:** banners dinámicos, gradiente de color por proximidad, `useCountdown`, Tienda BR (todas las ofertas).
5. **Mobile:** añadir `@clerk/clerk-expo`, Expo Router auth, NativeWind (o tu capa de estilos), consumo de `EXPO_PUBLIC_API_URL`.
6. **Sentry:** `npx @sentry/wizard@latest -i nextjs` (no ejecutado aquí por ser interactivo); luego `SENTRY_DSN` en env.
7. **shadcn/ui:** `npx shadcn@latest init` en `apps/web` cuando quieras el kit de componentes.
8. **Vercel:** proyecto enlazado a `apps/web`, Cron apuntando al endpoint de ingesta.

Detalle de producto y stack: [docs/PRD.md](docs/PRD.md), [docs/TECH_STACK.md](docs/TECH_STACK.md), [docs/ENV.md](docs/ENV.md).
