# Product Requirements Document (PRD)

## Live countdown for Fortnite

### Resumen

Producto **web + móvil** que muestra un **dashboard de monitoreo** con cuenta atrás para múltiples hitos de Fortnite (eventos, minieventos, temporadas, capítulos, parches, ventanas competitivas, rotación de tienda, etc.). Los datos mostrados provienen de un **ingesta diaria** (cron) que consulta [fortnite-api.com](https://fortnite-api.com) y persiste el resultado en **Neon (PostgreSQL)**. La UI actualiza los **contadores cada segundo** usando aritmética **exclusivamente en UTC** con **date-fns**.

### Problema

Los jugadores y seguidores del juego necesitan una vista **única y jerárquica** de lo que ocurre pronto y más tarde, sin depender de refrescos manuales ni de interpretar múltiples fuentes. El reloj del usuario no debe introducir errores: los instantes objetivo deben compararse contra el tiempo en **UTC**.

### Usuarios

- **Principal:** jugadores y audiencia que siguen temporadas, parches y eventos.
- **Secundario:** creadores de contenido que necesitan fechas consolidadas.

### Propuesta de valor

1. **Snapshot diario fiable** en base de datos (no martilleo continuo a la API pública desde cada cliente).
2. **N banners dinámicos** según cantidad de eventos normalizados en DB.
3. **Jerarquía visual continua** por proximidad temporal: rojo intenso → rojo tenue → naranja intenso → naranja tenue → azul intenso → azul tenue.
4. **Autenticación** con Clerk (email/contraseña + Google) en web y Expo, preparando **fase 2** de notificaciones.

### Funcionalidades

#### MVP

- Cron **una vez al día** que llama a fortnite-api (`/v2/seasons`, `/v2/news`, `/v2/shop/br` según diseño de ingestión), valida respuestas, **upsert** de eventos en Neon.
- API interna en Next.js que **lee Neon** y sirve al cliente web y a la app móvil.
- Dashboard con **hero banners de ancho completo** (cantidad = eventos en DB), barra de metadatos por banner (versión, estado de archivos si aplica, tiempo desde última ingesta/servidor).
- Sección **Tienda BR**: grid responsiva (varias columnas según viewport) con **todas** las ofertas del BR shop y lista de ítems/pistas por oferta cuando aplique; datos del modelo derivado de `/v2/shop` (fortnite-api.com).
- Hook **`useCountdown`**: tick 1s, cleanup de `setInterval`, sin fugas.
- **Clerk**: `/sign-in`, `/sign-up` con email/contraseña y Google (web + Expo).
- Estética **neón frío**: bordes, `box-shadow`, `animate-pulse` en el evento de **máxima urgencia** (menor tiempo restante entre los mostrados).

#### Fase 2 (fuera del alcance de implementación inicial)

- Notificaciones **web** (Web Push / proveedor / pipeline propio).
- Notificaciones **push** en **Expo** (`expo-notifications`, FCM/APNs).
- Preferencias de notificación por usuario en Neon.

### Fuera de scope (MVP)

- Refresco en tiempo real directo desde fortnite-api en cada visita del usuario.
- Pagos, marketplace, chat en vivo.

### Criterios de éxito

- Tras el cron, la DB refleja un conjunto coherente de eventos; la UI lista **todos** los que deban mostrarse sin error.
- Contadores coherentes con UTC; pruebas unitarias en funciones de tiempo y priorización.
- Login Clerk funcional en web y móvil (email/contraseña + Google).
- Layout usable en móvil (banners y grid apilados).

### Riesgos y dependencias

- **Cambios en el esquema JSON** de fortnite-api → mitigación con Zod y manejo de errores en ingestión.
- **Límites de tasa** de la API externa → ingestión centralizada diaria + almacenamiento en Neon.
- **Marca “Fortnite”:** uso de assets y nombre conforme a políticas de Epic y buenas prácticas (no afiliación oficial salvo que el producto lo sea).

### Glosario

- **Ingestión:** job diario que pobla/actualiza tablas en Neon.
- **Heat / calor:** mapping del tiempo restante a intensidad de color en la UI.
