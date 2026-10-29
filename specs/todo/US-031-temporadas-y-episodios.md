# Feature: Desglose de temporadas y episodios en la ficha de serie

## Historia de usuario

Como usuario que sigue o va a empezar una serie,
quiero ver el detalle de cada temporada y de sus episodios,
para saber cuánto me queda, qué ocurre en cada capítulo (sin spoilers si no quiero) y cuándo sale el siguiente.

---

## Descripción

Ahora la ficha de una serie solo muestra "Serie · N temp." y el total de episodios. No hay forma de ver qué contiene cada temporada, cuándo se emitió, cómo de bien valorada está ni si la serie sigue en emisión.

La feature añade una sección "Temporadas" a la ficha de serie con un selector horizontal de temporadas (póster, nombre, año y número de episodios). Al elegir una, se carga su lista de episodios: número, título, fecha de emisión, duración, nota media, imagen (still) y sinopsis plegable.

Arriba de la sección se añade un bloque de estado: "En emisión", "Finalizada" o "Cancelada", con el próximo episodio (fecha y cuenta atrás) o el último emitido. Además, un modo "sin spoilers" opcional difumina sinopsis e imágenes de los episodios hasta que el usuario las toca.

---

## Criterios de aceptación

### Estado de la serie
- [ ] Bajo la info principal se muestra un badge de estado: En emisión / Finalizada / Cancelada / En producción
- [ ] Si hay `next_episode_to_air`: "Próximo episodio: T{s}E{e} · {título} · {fecha} (en N días)"
- [ ] Si no lo hay: "Último episodio: T{s}E{e} · {fecha}"
- [ ] Se muestra la cadena o plataforma original (`networks`) con su logo

### Selector de temporadas
- [ ] Carrusel horizontal con una tarjeta por temporada: póster, nombre, año y nº de episodios
- [ ] Los "Especiales" (temporada 0) se muestran al final y solo si tienen episodios
- [ ] Por defecto se selecciona la temporada en emisión, o la última si la serie ha terminado
- [ ] La temporada seleccionada se refleja en la URL (`?season=N`)

### Lista de episodios
- [ ] Cada episodio muestra: número, título, fecha de emisión, duración, nota media (si hay votos) e imagen
- [ ] La sinopsis se muestra truncada a 2 líneas y se expande al tocar
- [ ] Los episodios aún no emitidos se marcan como "Próximamente" con su fecha y sin sinopsis
- [ ] Mini-gráfica de barras de nota por episodio encima de la lista, para ver de un vistazo los mejores capítulos
- [ ] Skeleton mientras carga la temporada; error recuperable con botón "Reintentar"

### Modo sin spoilers
- [ ] Toggle "Ocultar spoilers" en la cabecera de la sección, persistido en localStorage
- [ ] Con el modo activo, sinopsis e imágenes aparecen difuminadas hasta tocarlas

### Detalle de episodio (opcional dentro de la US)
- [ ] Al tocar un episodio se abre un panel (Sheet de shadcn) con sinopsis completa, director, guionistas y actores invitados (`guest_stars`), clickables hacia su perfil (US-014)

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/media/tv/SeriesStatus.tsx` | Badge de estado + próximo/último episodio + network |
| `src/components/media/tv/SeasonSelector.tsx` | Carrusel de temporadas |
| `src/components/media/tv/EpisodeList.tsx` | Lista de episodios de la temporada activa |
| `src/components/media/tv/EpisodeRatingsChart.tsx` | Barras de nota por episodio |
| `src/components/media/tv/EpisodeSheet.tsx` | Panel de detalle de episodio |
| `src/services/tmdb/seasons.ts` | `fetchSeasonDetails(tvId, seasonNumber, language)` |
| `src/hooks/useSeason.ts` | Carga y cacheo de la temporada seleccionada |
| `src/services/tmdb/details.ts` | Mapear `status`, `seasons`, `next_episode_to_air`, `last_episode_to_air`, `networks` |
| `src/types/media.ts` | Tipos `Season`, `Episode`, `SeriesStatus` |
| `src/components/media/MediaDetails.tsx` | Renderizar la sección solo cuando `type === 'tv'` |

---

## Notas técnicas

- `GET /tv/:id` ya devuelve `seasons[]`, `status`, `next_episode_to_air`, `last_episode_to_air` y `networks`; solo falta mapearlos en `fetchMediaDetails`
- `GET /tv/:id/season/:n?language=es-ES` → `episodes[]` con `still_path`, `air_date`, `runtime`, `vote_average`, `overview`, `crew`, `guest_stars`
- Si la sinopsis viene vacía en es-ES, pedir en-US como fallback (es muy habitual en episodios)
- Usar `cachedFetch` para no repetir la petición al volver a una temporada
- Gráfica: barras con divs y Tailwind, sin añadir librería

---

## Fuera de alcance (v1)

- Marcar episodios como vistos (descartado: el seguimiento manual no compensa sin integración automática con la TV)
- Calendario global de próximos episodios de todas mis series
- Valoración de episodios por el usuario
