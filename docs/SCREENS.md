# Pantallas y rutas

Monorepo **Turborepo**: `apps/web` (Next.js App Router), `apps/mobile` (Expo Router).

## Web — `apps/web`

| Ruta                        | Pantalla         | Descripción breve                                                                                              | Acceso                                                         |
| --------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `/`                         | Dashboard        | **Eventos:** lista de **N** hero banners (cuenta atrás), sidebar de navegación                                 | Autenticado (recomendado) o mixto si se define landing pública |
| `/jam-tracks`               | Jam tracks       | Ofertas de pistas (Festival), filtradas por `offerSection === jam`                                             | Autenticado                                                    |
| `/tienda`                   | Tienda BR        | Resto del shop BR (skins, gestos, lotes…), `offerSection === other`                                            | Autenticado                                                    |
| `/historial`                | Historial        | Tabla de eventos archivados (`fortnite_event_history`)                                                         | Autenticado                                                    |
| `/sign-in`                  | Inicio de sesión | Clerk `<SignIn />` — email/contraseña + Google                                                                 | Público                                                        |
| `/sign-up`                  | Registro         | Clerk `<SignUp />` — email/contraseña + Google                                                                 | Público                                                        |
| `/api/cron/ingest-fortnite` | —                | Ejecutado por **Vercel Cron** (o similar); valida `CRON_SECRET`, llama fortnite-api, escribe Neon              | Solo cron / servidor                                           |
| `/api/events`               | —                | Lista eventos countdown desde DB (JSON para React Query)                                                       | Autenticado o público según política final                     |
| `/api/shop/daily-ops`       | —                | Payload normalizado para la cuadrícula Tienda BR (`ShopOffersResponse`; metadata `dailyOps` en el evento shop) | Misma política que arriba                                      |
| `/api/history`              | —                | Lista archivados (requiere sesión Clerk)                                                                       | Autenticado                                                    |

### Componentes principales (web)

- `AppHeader` — logo + título _Live countdown for Fortnite_.
- `EventHeroBanner` — props: títulos, `targetEndUtc`, metadata, clase de “heat”, `isTopPriority` (pulse).
- `ShopOffersGrid` — cards estilo tienda (imagen si hay URL), categorías por `brItems.type`, cuenta atrás.
- `HistorialPage` — tabla de filas archivadas tras ingesta.
- Layout raíz con ClerkProvider + fuentes (sans + mono para dígitos).

## Mobile — `apps/mobile` (Expo Router)

| Ruta (orientativa) | Pantalla  | Descripción                                            | Acceso                 |
| ------------------ | --------- | ------------------------------------------------------ | ---------------------- |
| `(tabs)/index`     | Dashboard | Equivalente móvil: banners apilados + sección inferior | Misma política que web |
| `(auth)/sign-in`   | Sign in   | Clerk Expo — email/contraseña + Google                 | Público                |
| `(auth)/sign-up`   | Sign up   | Clerk Expo                                             | Público                |

La app móvil **no** accede a Neon directamente: consume `EXPO_PUBLIC_API_URL` (API del Next app).

## Fase 2 — notificaciones (referencia)

| Contexto | Pantalla / superficie                                                    |
| -------- | ------------------------------------------------------------------------ |
| Web      | Preferencias de notificación (post-login), registro de push subscription |
| Mobile   | Permisos + token push + preferencias                                     |
