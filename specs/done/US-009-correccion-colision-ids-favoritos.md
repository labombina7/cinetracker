# Feature: Corrección de colisión de IDs en favoritos

## Historia de usuario

Como usuario de CineTracker que marca como favorito tanto películas como series,
quiero que el sistema distinga correctamente entre una película y una serie con el mismo ID numérico,
para que mis favoritos no se mezclen ni se marquen incorrectamente.

---

## Descripción

TMDB utiliza espacios de IDs independientes para películas y series. Esto significa que puede existir una película con ID `123` y una serie también con ID `123` siendo títulos completamente distintos. El sistema actual de favoritos guarda solo un array de `number[]` sin el tipo de media, lo que provoca que marcar como favorita una película con ID `X` haga que la serie con ID `X` también aparezca marcada como favorita.

Este bug afecta a `isFavorite()`, `toggleFavorite()`, y la sincronización con Trakt. La corrección migra la estructura de almacenamiento de `number[]` a `Array<{ id: number; type: 'movie' | 'tv' }>` y añade migración automática de los datos existentes.

---

## Criterios de aceptación

### Estructura de datos corregida
- [ ] Los favoritos se almacenan como `Array<{ id: number; type: 'movie' | 'tv' }>` en localStorage
- [ ] `isFavorite(id, type)` solo retorna `true` si hay una entrada con ambos campos coincidentes
- [ ] `toggleFavorite(id, type, title, releaseDate)` añade o elimina la entrada correcta usando ambos campos como clave

### Migración de datos existentes
- [ ] Al cargar favoritos de localStorage, si se detecta el formato antiguo (`number[]`), se migra automáticamente a `{ id: number; type: 'movie' }[]` (se asume movie como fallback para los IDs ambiguos, ya que era el tipo predominante)
- [ ] La migración se hace una sola vez y se guarda inmediatamente para no repetirse

### Validación robusta
- [ ] Si los datos de localStorage están malformados (no es array o los items no tienen la forma correcta), se inicializa con un array vacío en lugar de crashear
- [ ] Los errores de parse se loguean solo en desarrollo (`import.meta.env.DEV`)

### Sincronización con Trakt
- [ ] `addToWatchlist` recibe el `type` correcto y lo usa para construir el payload de Trakt
- [ ] No hay regresión en la funcionalidad de sincronización existente

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/hooks/useFavorites.ts` | Cambiar estado a `{ id: number; type: 'movie' \| 'tv' }[]`, actualizar `isFavorite` y `toggleFavorite`, añadir migración |
| `src/components/MediaCard.tsx` | `isFavorite(media.id)` → `isFavorite(media.id, media.type)` |
| `src/components/media/MediaDetails.tsx` | Actualizar llamada a `isFavorite` y `toggleFavorite` con el tipo correcto |

---

## Notas técnicas

- La función de migración: `if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) { return parsed.map(id => ({ id, type: 'movie' as const })); }`
- La validación del nuevo formato: `Array.isArray(parsed) && parsed.every(item => typeof item?.id === 'number' && (item?.type === 'movie' || item?.type === 'tv'))`
- El cambio de firma de `isFavorite` es un breaking change pequeño: buscar todos los usos con grep antes de modificar

---

## Fuera de alcance (v1)

- Deduplicación retroactiva de favoritos con el mismo ID pero tipos distintos
- Exportación/importación de favoritos
- Sincronización bidireccional con el watchlist de Trakt
