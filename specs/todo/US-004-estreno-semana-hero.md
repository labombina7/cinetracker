# Feature: Módulo "Estreno de la semana" — Hero destacado

## Historia de usuario

Como usuario de CineTracker que quiere estar al día de los estrenos,
quiero ver un bloque hero prominente con el estreno más destacado de la semana,
para saber de un vistazo qué ha salido recientemente y si merece mi atención.

---

## Descripción

En la parte superior de la página Explorar (US-002), antes de los carruseles de género, se muestra un bloque hero de ancho completo con el estreno más relevante de la semana. Este bloque ocupa la parte visible del viewport al entrar en la página y actúa como punto de entrada emocional a la experiencia de descubrimiento.

El hero muestra el backdrop de alta resolución del título seleccionado, superpuesto con el título, descripción corta, puntuación, fecha de estreno, y un botón "Ver detalles". Un carrusel de miniaturas debajo permite navegar entre los 5-7 estrenos más relevantes de la semana sin salir del hero.

### Fuentes de datos exploradas en la API de TMDB

| Endpoint | Uso |
|---|---|
| `GET /movie/now_playing` | Películas actualmente en cartelera (fecha de lanzamiento reciente) |
| `GET /movie/upcoming` | Próximos estrenos de películas |
| `GET /tv/on_the_air` | Series actualmente emitiendo nuevos episodios |
| `GET /tv/airing_today` | Series con episodio hoy |
| `GET /trending/movie/week` | Películas trending de la semana |

La estrategia recomendada para v1: combinar `/trending/movie/week` con `/tv/on_the_air` filtrado por fecha reciente (`first_air_date.gte` = hace 7 días). Esto garantiza que el hero siempre tenga contenido relevante y popular, incluso si los estrenos de la semana son pocos.

---

## Criterios de aceptación

### Hero visual

- [ ] El hero ocupa el ancho completo y una altura de ~50vh en desktop, ~40vh en mobile
- [ ] Muestra el backdrop de alta resolución (`/w1280` de TMDB) del título seleccionado
- [ ] Sobre el backdrop hay un gradiente oscuro para garantizar legibilidad del texto
- [ ] Se muestra: título, año/fecha de estreno, puntuación (⭐ + decimal), sinopsis recortada a 2 líneas, tipo (Película/Serie), badge "ESTRENO" si la fecha es de los últimos 7 días
- [ ] Botón "Ver detalles" navega a la página de detalle del media
- [ ] Botón "Añadir a favoritos" funcional (reutiliza `FavoriteButton`)

### Selector de estrenos

- [ ] Debajo del hero hay una fila de 5-7 thumbnails (posters pequeños) de los estrenos más relevantes
- [ ] El thumbnail del estreno activo tiene borde destacado
- [ ] Clic en un thumbnail cambia el backdrop y datos del hero al item correspondiente
- [ ] El hero rota automáticamente entre los estrenos cada 8 segundos (autoplay); el autoplay se pausa al hacer hover

### Lógica de contenido

- [ ] Se obtienen hasta 7 items combinando trending week + on_the_air TV (prioridad: mayor `popularity`)
- [ ] Si el usuario filtra por "Películas", el hero solo muestra movies (trending/week + now_playing)
- [ ] Si filtra por "Series", solo muestra TV (on_the_air)
- [ ] El primer item del carrusel es el de mayor `popularity`
- [ ] Mientras carga, el hero muestra un skeleton con la proporción correcta (no layout shift)

### Accesibilidad y UX

- [ ] El autoplay respeta `prefers-reduced-motion` (se desactiva si el sistema lo solicita)
- [ ] Los thumbnails son accesibles con teclado (Tab + Enter)
- [ ] En mobile el swipe horizontal en el área de thumbnails cambia el item activo

---

## Componentes nuevos o modificados

| Componente | Acción | Descripción |
|---|---|---|
| `src/components/explore/HeroRelease.tsx` | Nuevo | Bloque hero con backdrop, datos y autoplay |
| `src/components/explore/HeroThumbnails.tsx` | Nuevo | Fila de miniaturas para seleccionar el estreno activo |
| `src/hooks/useWeeklyReleases.ts` | Nuevo | Combina trending/week + tv/on_the_air; filtra por mediaType; ordena por popularidad |
| `src/services/tmdb/nowPlaying.ts` | Nuevo | Wrappers para `/movie/now_playing`, `/movie/upcoming`, `/tv/on_the_air`, `/tv/airing_today` |

---

## Notas técnicas

- Endpoints TMDB utilizados en v1:
  - `GET /trending/movie/week?language=es-ES` — top movies trending esta semana
  - `GET /tv/on_the_air?language=es-ES&first_air_date.gte=YYYY-MM-DD` — series con episodios esta semana
  - El campo `backdrop_path` devuelto por estos endpoints se usa con `getBackdropUrl(path, 'w1280')` del helper existente en `src/services/tmdb/utils.ts`
- El backdrop en mobile puede usar `w780` en lugar de `w1280` para optimizar carga
- El autoplay usa `setInterval` limpiado en el `useEffect` de cleanup
- La rotación automática usa índice circular: `(currentIndex + 1) % items.length`
- Cache: los datos del hero se cachean con `useCacheStrategy` existente (TTL 15 min)

---

## Fuera de alcance (v1)

- Trailer integrado en el hero (reproducción de video desde YouTube/TMDB)
- Personalización: "No me interesa" para ocultar un item del hero
- Notificaciones push de estrenos
- Integración con Trakt para mostrar si el item está en la watchlist
- Estrenos de plataformas específicas (Netflix, HBO...) en el hero — depende de los filtros de plataforma del usuario
