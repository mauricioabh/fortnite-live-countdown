# Estrategia de testing

## Objetivos

- Garantizar **corrección UTC** en funciones de tiempo y ordenación de eventos.
- Evitar regresiones en el **mapeo heat/color** (rojo → … → azul tenue).
- Smoke de **auth** y del dashboard en web.

## Vitest (unitarios)

**Ubicación:** `apps/web/src/__tests__/` (y opcionalmente `packages/utils/src/__tests__/`).

**Prioridad:**

- Helpers que calculan `millisecondsRemaining` y bucket de color a partir de `targetAt` ISO + “ahora” inyectado (reloj falso).
- Normalización de payloads de ingesta (Zod parse + transform a filas).
- Ordenación por `sortPriority` y `targetAt`.

**Convención de nombres:** `*.test.ts` junto al módulo o bajo `__tests__/describe-name.test.ts`.

**Comando (orientativo):** en `apps/web`: `pnpm test` / `npm run test` → `vitest`.

## Playwright (E2E web)

**Ubicación:** `apps/web/e2e/`.

**Casos:**

- `/` muestra al menos un banner cuando la API interna o DB de test tiene fixtures (mock o seed).
- Vista móvil (viewport 390px): banners y grid **apilados**.
- Opcional: flujo sign-in con usuario de prueba Clerk (requiere entorno de staging y secretos).

**Comando:** `pnpm test:e2e` → `playwright test`.

**Convención:** `*.spec.ts`.

## Mobile (Expo)

- MVP: pruebas manuales en dispositivo/simulador para login Clerk y lista de eventos.
- Fase 2: considerar Maestro o E2E nativo para notificaciones.

## Datos de prueba

- JSON fixture de fortnite-api en `apps/web/src/__tests__/fixtures/` para no golpear la red en CI.

## CI

- Pipeline: typecheck → lint → build → vitest.
- Playwright en job separado (PR a `main`) si se activa en el repo.
