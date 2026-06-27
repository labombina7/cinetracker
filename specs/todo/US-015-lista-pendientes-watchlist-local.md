# Feature: Lista "Pendientes" — Watchlist local separada de favoritos

## Historia de usuario

Como usuario de CineTracker que guarda contenido para ver más tarde,
quiero una lista "Pendientes" independiente de mis favoritos,
para distinguir entre lo que ya me gusta y lo que quiero ver pronto.

---

## Descripción

Actualmente la app mezcla dos intenciones distintas en un solo botón de favorito:
- "Me gusta / me ha gustado" (contenido ya visto o muy apreciado)
- "Quiero verlo" (watchlist, pendientes)

Esta confusión es habitual en apps de catálogo. La solución más clara es añadir un segundo marcador: un icono de reloj o marcador (bookmark) que añade el título a una lista "Pendientes" separada.

Los pendientes se almacenan localmente en `localStorage` (mismo patrón que favoritos) y se sincronizan opcionalmente con el watchlist de Trakt.tv si el usuario está conectado.

---

## Criterios de aceptación

### Botón "Añadir a Pendientes"
- [ ] Aparece un botón de marcador (icono `Bookmark` de Lucide) en la página de detalle del título, junto al botón de favorito
- [ ] En `MediaCard`, el botón de marcador es opcional (parámetro de configuración del componente); en la lista principal no se muestra para no sobrecargar la card
- [ ] Al pulsar, el icono cambia a `BookmarkCheck` y se muestra un toast de confirmación

### Lista de Pendientes (`/watchlist`)
- [ ] Nueva página accesible desde la barra de navegación con el icono `Bookmark`
- [ ] Muestra las cards de todos los títulos guardados como pendientes
- [ ] Cada card tiene un botón para eliminar de la lista (icono X o BookmarkX)
- [ ] La lista es persistente entre sesiones (localStorage)
- [ ] Si la lista está vacía, muestra un estado vacío con ilustración y CTA para explorar contenido

### Sincronización con Trakt (si conectado)
- [ ] Al añadir un título a Pendientes, si el usuario tiene Trakt conectado, se sincroniza automáticamente con su watchlist de Trakt
- [ ] La sincronización es best-effort (si falla, el item se guarda localmente sin error visible)

### Diferenciación visual entre Favoritos y Pendientes
- [ ] Favoritos usan el icono `Heart` (rojo cuando activo) — no cambia
- [ ] Pendientes usan el icono `Bookmark` (color primario cuando activo)
- [ ] Ambos pueden estar activos simultáneamente en el mismo título

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/hooks/useWatchlist.ts` | Hook análogo a `useFavorites` para gestionar la lista de pendientes |
| `src/pages/Watchlist.tsx` | Nueva página `/watchlist` con la lista de títulos pendientes |
| `src/components/media/WatchlistButton.tsx` | Botón de marcador para añadir/quitar de pendientes |
| `src/components/media/MediaDetails.tsx` | Añadir `<WatchlistButton>` junto a `<FavoriteButton>` |
| `src/components/Navbar.tsx` | Añadir enlace a `/watchlist` con icono Bookmark |
| `src/App.tsx` | Registrar ruta `/watchlist` |

---

## Notas técnicas

- Estructura de localStorage: `'watchlist'` → `Array<{ id: number; type: 'movie' | 'tv' }>` (mismo patrón que la corrección de favoritos de US-009)
- Endpoint de Trakt para añadir: `POST /sync/watchlist` — mismo que `addToWatchlist` en `src/services/trakt/watchlist.ts`
- `useWatchlist` puede compartir la lógica de migración y validación de `useFavorites` (candidato a refactor en un `useLocalList` genérico)
- Reutilizar `MediaCard` en la página Watchlist con `onClick` que navega al detalle

---

## Fuera de alcance (v1)

- Ordenación de la lista de pendientes (por fecha de adición, título, rating)
- Compartir la lista de pendientes
- Import de watchlist desde Trakt al instalar la app
- Integración con notificaciones ("este pendiente ya está en tu plataforma")
