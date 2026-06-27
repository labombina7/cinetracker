# US-017 — Bloque editorial "No te puedes perder"

## Historia de usuario

Como usuario de CineTracker que quiere descubrir joyas consolidadas,
quiero ver una sección editorial destacada con el contenido mejor valorado del momento,
para no perderme títulos imprescindibles que quizás haya pasado por alto.

---

## Descripción

Entre las secciones de género de la página Explorar (US-002), se inserta un bloque editorial visual llamado "No te puedes perder" (o "Must Watch"). Este bloque actúa como una ruptura de ritmo en el scroll: un carrusel de tarjetas grandes o un grid de 3-4 items con poster prominente, título, puntuación y un breve tagline.

El contenido de esta sección se obtiene del endpoint `/movie/top_rated` y `/tv/top_rated` de TMDB, filtrado a resultados con `vote_average >= 8.0` y `vote_count >= 1000`. Se muestra una selección de 6-10 items mezclando películas y series.

La posición del bloque en la página es fija (por ejemplo, entre la 2ª y 3ª sección de género) para garantizar que el usuario lo vea en el primer scroll sin tener que bajar mucho.

---

## Criterios de aceptación

### Renderizado del bloque

- [ ] El bloque tiene un encabezado visual diferenciado del resto de secciones (color de fondo sutil, icono ⭐ o similar)
- [ ] Se muestran entre 6 y 10 items en un carrusel horizontal o grid 2×3
- [ ] Cada item muestra: poster, título, puntuación (estrella + número), tipo (película/serie) y año
- [ ] El bloque es clickable: cada item navega al detalle del media
- [ ] En desktop las tarjetas son más grandes que las de los carruseles de género (mayor prominencia visual)

### Lógica de contenido

- [ ] El contenido se obtiene de `/movie/top_rated` y `/tv/top_rated` (mezcla 50/50 si mediaType es "Todos")
- [ ] Solo se muestran items con `vote_average >= 8.0` y `vote_count >= 1000`
- [ ] La selección se aleatoriza con semilla diaria (mismos items durante el mismo día, distintos al día siguiente) o es estática por popularidad

### Adaptación al filtro de tipo

- [ ] Si el usuario selecciona "Películas", el bloque muestra solo top rated movies
- [ ] Si selecciona "Series", muestra solo top rated TV
- [ ] En "Todos" mezcla ambos

### Cache y rendimiento

- [ ] Los datos del bloque se cachean en memoria durante la sesión (no se re-fetcha al navegar hacia atrás)
- [ ] El bloque muestra un skeleton de 4 tarjetas mientras carga

---

## Componentes nuevos o modificados

| Componente | Acción | Descripción |
|---|---|---|
| `src/components/explore/MustWatchBlock.tsx` | Nuevo | Bloque editorial con cabecera destacada y carrusel/grid de items |
| `src/hooks/useMustWatch.ts` | Nuevo | Fetch de top_rated movie + tv, filtro por score/votos, mezcla y caché |
| `src/services/tmdb/topRated.ts` | Nuevo | Servicio que llama a `/movie/top_rated` y `/tv/top_rated` |

---

## Notas técnicas

- Endpoints TMDB:
  - `GET /movie/top_rated?language=es-ES&page=1` — devuelve resultados con `vote_average` y `vote_count`
  - `GET /tv/top_rated?language=es-ES&page=1` — ídem para series
- Semilla diaria para "mezcla aleatoria": `Math.floor(Date.now() / 86400000)` como seed en un shuffle determinístico (Fisher-Yates con seed)
- El bloque se posiciona en la página Explorar como tercer elemento (después de las 2 primeras secciones de género), controlado desde `Explore.tsx`
- No requiere autenticación Trakt

---

## Fuera de alcance (v1)

- Personalización editorial por parte del usuario (ocultar items, marcar como visto)
- Integración con el watchlist de Trakt para filtrar lo ya visto
- Ranking propio de CineTracker basado en interacciones de usuarios
- Algoritmo de recomendación basado en favoritos del usuario
