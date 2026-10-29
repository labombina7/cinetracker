# US-028: Página de Mis Favoritos con carruseles por tipo

## Historia de usuario

Como usuario de CineTracker,
quiero una página donde ver todos mis favoritos organizados en carruseles de Películas y Series,
para tener una vista rápida de mi lista y acceder al detalle de cada uno.

---

## Descripción

Nueva ruta `/favorites` accesible desde la navbar. La página muestra dos carruseles: uno para películas favoritas y otro para series favoritas. Cada carrusel tiene un botón "Ver todas" que navega a `/favorites/list` con el tipo ya filtrado (→ US-029).

El contenido viene directamente del estado de favoritos en memoria (no hay fetch a TMDB en esta pantalla base); las cards usan los datos que ya tenemos guardados en el favorito. Si queremos poster e info adicional, los favoritos deben almacenar también `title`, `posterPath` y `year` en el momento en que se marcan (esto es un cambio en la estructura de `FavoriteItem`).

Cuando el usuario no tiene favoritos de un tipo, el carrusel correspondiente no se renderiza y se muestra un estado vacío con CTA para ir a Explorar.

---

## Criterios de aceptación

### Routing y navegación
- [ ] La ruta `/favorites` existe y renderiza `Favorites.tsx`
- [ ] La navbar tiene un enlace (icono de corazón) a `/favorites`
- [ ] El enlace de la navbar muestra un badge con el total de favoritos (películas + series) si hay alguno

### Estructura de la página
- [ ] Título de la página: "Mis favoritos"
- [ ] Si hay películas favoritas: carrusel "Películas" con todas las películas marcadas
- [ ] Si hay series favoritas: carrusel "Series" con todas las series marcadas
- [ ] Cada carrusel tiene un encabezado con el nombre del tipo y el contador `(N)`
- [ ] Cada carrusel tiene un botón "Ver todas" que navega a `/favorites/list?type=movie` o `?type=tv`
- [ ] Si no hay favoritos de ningún tipo: estado vacío con mensaje _"Aún no tienes favoritos"_ y botón "Explorar contenido" que va a `/`

### Cards
- [ ] Se usa el componente `MediaCard` existente
- [ ] Las cards muestran póster, título, año y el corazón ya activado
- [ ] Al pulsar el corazón desde aquí se desmarca el favorito y la card desaparece del carrusel (actualización reactiva)
- [ ] Si un carrusel queda vacío tras desmarcar el último favorito, el carrusel desaparece y, si ambos están vacíos, aparece el estado vacío

### Estructura de `FavoriteItem` ampliada
- [ ] `FavoriteItem` pasa de `{ id, type }` a `{ id, type, title, posterPath, year }` para poder renderizar la card sin fetch adicional
- [ ] Al marcar un favorito se guardan estos campos adicionales
- [ ] Migración: los favoritos guardados con el formato antiguo se muestran con un póster genérico (placeholder) hasta que el usuario los re-marque o se haga un enriquecimiento lazy

### Enriquecimiento lazy (opcional, no bloqueante)
- [ ] Si un `FavoriteItem` no tiene `posterPath` (formato antiguo), se lanza un fetch a TMDB en background para obtener los datos y se actualiza localStorage
- [ ] Mientras se enriquece, la card muestra un skeleton o placeholder de póster
- [ ] Este enriquecimiento no bloquea la renderización de los favoritos que sí tienen datos

---

## Componentes nuevos o modificados

| Componente | Acción | Descripción |
|---|---|---|
| `src/pages/Favorites.tsx` | Nuevo | Página raíz de favoritos con los dos carruseles |
| `src/components/FavoritesCarousel.tsx` | Nuevo | Carrusel genérico reutilizable para la sección de favoritos; recibe `items: FavoriteItem[]` y `title: string` |
| `src/contexts/FavoritesContext.tsx` | Modificar | Ampliar `FavoriteItem` con `title`, `posterPath`, `year`; actualizar `toggleFavorite` para aceptar estos campos |
| `src/hooks/useFavorites.ts` | Modificar | Adaptar a la nueva estructura; añadir `movieFavorites` y `tvFavorites` como selectores derivados |
| `src/components/Navbar.tsx` | Modificar | Añadir enlace a `/favorites` con badge |
| `src/App.tsx` / router | Modificar | Registrar ruta `/favorites` |

---

## Notas técnicas

- `movieFavorites` y `tvFavorites` se derivan del array principal: `favorites.filter(f => f.type === 'movie')` — no hace falta estado separado.
- El carrusel puede reutilizar el componente de carrusel de Explorar si ya existe, pasando `items` directamente en lugar de un fetch.
- El badge en navbar es el mismo que el de US-025; asegurarse de que no se duplica.

---

## Dependencias

- US-009 (estructura `{ id, type }`)
- US-025 (FavoritesContext global)
- US-028 es prerequisito de US-029

---

## Fuera de alcance

- Ordenación o filtrado dentro de la página de favoritos
- Drag & drop para reordenar
- Compartir lista de favoritos
