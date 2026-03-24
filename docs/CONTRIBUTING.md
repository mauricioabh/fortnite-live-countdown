# Contribuir

## Ramas

- `main` — producción.
- `dev` — integración (si se usa).
- `feat/<nombre>` — features.
- `fix/<nombre>` — correcciones.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `test:`, etc.

Ejemplos:

- `feat(web): add heat gradient to event banners`
- `fix(cron): handle empty news payload`

## Desarrollo local

1. Clonar el repo.
2. Instalar dependencias en la raíz del monorepo (`pnpm install` recomendado).
3. Copiar `apps/web/.env.example` → `apps/web/.env.local` y rellenar.
4. Copiar `apps/mobile/.env.example` → `apps/mobile/.env.local`.
5. Ejecutar migraciones Drizzle contra una base Neon de desarrollo.
6. `pnpm dev` (o comando turbo equivalente) para levantar web; en otra terminal Expo para mobile.

## Tests

- Unit: desde `apps/web`, `pnpm test`.
- E2E: `pnpm test:e2e` (requiere browsers instalados: `npx playwright install`).

## Pull requests

1. Rama desde `dev` o `main` según convención del equipo.
2. PR hacia `dev` (o `main` si es flujo trunk-based).
3. Checklist del template: typecheck, lint, tests, variables documentadas en `docs/ENV.md`, sin `console.log` de debug.

## Code review

- Cambios en **ingesta** o **schema** requieren revisión explícita (impacto en producción y cron).
