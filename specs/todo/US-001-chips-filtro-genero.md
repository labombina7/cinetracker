# US-001 — Chips de filtro por género

## Historia de usuario

Como usuario de CineTracker que explora contenido en la pantalla principal,
quiero ver una fila de chips de género con desplazamiento horizontal debajo de los filtros actuales,
para acotar el catálogo al tipo de contenido que me apetece ver sin perder el resto de filtros activos.

---

## Descripción

Segunda fila de filtros debajo de la existente (fuente / idioma / ordenar / tipo) con chips de género desplazables horizontalmente.

Los géneros disponibles dependen del tipo de contenido activo:

| Vista activa | Géneros mostrados |
|---|---|
| **Películas** | Géneros de película (`/genre/movie/list`) |
| **Series** | Géneros de serie (`/genre/tv/list`) |
| **Todos** | Solo géneros que aparecen en **ambas** listas (intersección por `id`) |

El chip "Todos" aparece siempre primero y está seleccionado por defecto. Solo se puede seleccionar un género a la vez. El filtro de género se combina con todos los filtros existentes.

El servicio `fetchGenres` ya existe en `src/services/tmdb/genres.ts` con caché en memoria. Solo hay que consumirlo.

---

## Criterios de aceptación

### Renderizado de chips

- [ ] La fila de chips aparece entre el bloque de filtros y el contenido, con scroll horizontal
- [ ] El chip "Todos" aparece siempre en primera posición y está activo por defecto
- [ ] Los chips muestran el nombre del género en el idioma activo de la app (ES/EN, campo `name` de TMDB)
- [ ] Un chip activo tiene estilo visual diferenciado del resto (fondo primario)
- [ ] Mientras cargan los géneros, la fila muestra 6 chips skeleton del mismo alto que los chips reales
- [ ] En desktop no se muestra scrollbar visible; en móvil el scroll es touch-friendly

### Lógica de géneros por vista

- [ ] Al activar **Películas**, los chips muestran los géneros de `fetchGenres('movie')`
- [ ] Al activar **Series**, los chips muestran los géneros de `fetchGenres('tv')`
- [ ] Al activar **Todos**, los chips muestran solo los géneros cuyo `id` existe en ambas listas
- [ ] Al cambiar de vista, si el género seleccionado no está en la nueva lista, el filtro se resetea a "Todos"

### Selección y filtrado

- [ ] Clic en un chip lo selecciona y lanza un nuevo fetch con ese género aplicado
- [ ] Clic en el chip "Todos" limpia el género seleccionado y lanza un nuevo fetch sin ese filtro
- [ ] Solo se puede tener un género seleccionado simultáneamente
- [ ] El `selectedGenreId` se combina con los filtros existentes (fuente, idioma, plataforma, ordenar)

### Integración con fuentes de datos

- [ ] Con fuente **Descubrir**: el `genreId` se pasa como `with_genres` en la query a TMDB
- [ ] Con fuente **Tendencias**: como el endpoint de tendencias no soporta `with_genres`, el filtro se aplica en cliente sobre `genre_ids` del item
- [ ] El filtro de género provoca reset de paginación (vuelve a página 1)

### Estados vacío y error

- [ ] Si el género seleccionado da 0 resultados, se muestra el `HomeEmptyState` existente
- [ ] Si `fetchGenres` falla, la fila no se renderiza (sin mensaje de error, sin romper el resto de la UI)

---

## Componentes nuevos o modificados

| Componente | Acción | Descripción |
|---|---|---|
| `src/hooks/useGenres.ts` | Nuevo | Carga géneros de película y TV; calcula la intersección; expone `genres`, `loading` según `mediaType` activo |
| `src/components/home/GenreChips.tsx` | Nuevo | Fila scrollable de chips; recibe `genres`, `selectedGenreId`, `onSelect` |
| `src/contexts/MediaFiltersContext.tsx` | Modificar | Añadir `selectedGenreId: number \| null` al estado; añadir `setSelectedGenreId` |
| `src/components/home/MediaFilters.tsx` | Modificar | Renderizar `<GenreChips>` bajo la fila de filtros existente; resetear género al cambiar `mediaType` |
| `src/hooks/useHomeMediaFetch.ts` | Modificar | Pasar `filtersState.selectedGenreId` a la estrategia de fetch |
| `src/hooks/useFetchStrategy.ts` | Modificar | Añadir parámetro `genreId?: number`; aplicar filtro client-side para trending |
| `src/hooks/fetchStrategies/discoverStrategy.ts` | Modificar | Pasar `genreId` a `fetchDiscover` y `fetchMediaByPlatforms` |
| `src/services/tmdb/discover/fetchDiscover.ts` | Modificar | Añadir `with_genres: genreId` a los params de TMDB si `genreId` tiene valor |
| `src/services/tmdb/discover/fetchByPlatform.ts` | Modificar | Añadir `with_genres: genreId` a los params de TMDB si `genreId` tiene valor |

---

## Notas técnicas

- `fetchGenres` ya tiene caché en memoria — llamar a ambos tipos (`movie` y `tv`) en `useGenres` no supone doble petición tras la primera carga.
- La intersección se calcula por `id` numérico, no por nombre, para evitar discrepancias de traducción.
- El filtro client-side para trending usa `item.genre_ids` (array de IDs que ya devuelve el endpoint de trending) — el campo `genre_ids` ya existe en el tipo `Media`.
- El `selectedGenreId` no se persiste en `localStorage` (misma decisión que `sortBy` que se resetea al default en cada sesión).
- La fila de chips debe auto-scroll al chip seleccionado cuando se activa programáticamente (cambio de `mediaType` que preserva un género válido).

---

## Fuera de alcance

- Selección múltiple de géneros simultáneos
- Filtro de género en la pantalla de búsqueda (`SearchResults`)
- Persistencia del género seleccionado entre sesiones
- Subgéneros o etiquetas anidadas
- Orden personalizable de los chips
