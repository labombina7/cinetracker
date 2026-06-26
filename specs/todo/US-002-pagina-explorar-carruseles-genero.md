# Feature: Página Explorar — Carruseles de contenido por género

## Historia de usuario

Como usuario de CineTracker que quiere descubrir contenido nuevo,
quiero una página "Explorar" que muestre filas de películas y series organizadas por género,
para encontrar fácilmente algo que ver según el tipo de contenido que me apetece en ese momento.

---

## Descripción

La página de exploración reemplaza o complementa la vista de lista plana actual con una experiencia editorial organizada por categorías de género. Cada género tiene su propia fila horizontal con sus primeras N tarjetas visibles y un botón "Ver más" que expande la fila (o navega a una vista filtrada de ese género).

La página carga las secciones de forma progresiva (lazy por sección) para no bloquear el primer render. Cada fila usa el componente `<Carousel>` ya disponible en `src/components/ui/carousel.tsx` (Embla Carousel), lo que evita construir un slider desde cero.

Los géneros a mostrar se obtienen de `fetchGenres('movie')` y `fetchGenres('tv')` según el `mediaType` activo. Se muestran los **6-8 géneros más populares** por defecto (Acción, Comedia, Drama, Terror, Ciencia ficción, Animación, Documental, Thriller) para no saturar la pantalla.

Entre las secciones de género se insertan bloques editoriales especiales (US-003, US-004) que enriquecen la experiencia de descubrimiento.

---

## Criterios de aceptación

### Layout y navegación

- [ ] La página `/explore` existe y es accesible desde la barra de navegación (`Navbar`)
- [ ] El título de la página es "Explorar" (ES) / "Explore" (EN)
- [ ] Cada sección muestra el nombre del género como cabecera con un enlace "Ver más →"
- [ ] "Ver más" navega a `/explore?genre=ID` mostrando la vista de lista completa filtrada por ese género
- [ ] En mobile se muestran 2 tarjetas visibles por fila; en tablet 3; en desktop 4-5

### Carruseles por género

- [ ] Cada género renderiza un `<Carousel>` horizontal con sus primeras 10-15 tarjetas
- [ ] Las flechas de navegación del carrusel son visibles en desktop; en mobile se usa swipe nativo
- [ ] Cada carrusel usa el `<MediaCard>` existente para mantener consistencia visual
- [ ] Mientras carga un carrusel se muestran 5 `<Skeleton>` del tamaño de una `<MediaCard>`

### Carga progresiva

- [ ] Los carruseles se cargan de forma lazy usando `IntersectionObserver` (o reutilizando `useInfiniteScroll`)
- [ ] Sólo se ejecuta el fetch de un género cuando su sección entra en el viewport
- [ ] Si un género devuelve 0 resultados, su sección no se renderiza (se oculta silenciosamente)

### Filtro de tipo de contenido

- [ ] Un selector global en la cabecera de la página permite cambiar entre Todos / Películas / Series
- [ ] Al cambiar el tipo, todas las secciones se refrescan con el tipo correcto
- [ ] Los géneros disponibles se recalculan al cambiar el tipo (igual que en US-001)

### Estado vacío y errores

- [ ] Si todos los géneros fallan o devuelven vacío, se muestra un estado de error global
- [ ] Los errores de un género concreto no bloquean el resto de secciones

---

## Componentes nuevos o modificados

| Componente | Acción | Descripción |
|---|---|---|
| `src/pages/Explore.tsx` | Nuevo | Página principal de exploración por género |
| `src/components/explore/GenreSection.tsx` | Nuevo | Sección de un género: cabecera + `<Carousel>` + lazy load |
| `src/components/explore/GenreCarousel.tsx` | Nuevo | Carrusel horizontal con `MediaCard` items y skeletons |
| `src/hooks/useExploreGenres.ts` | Nuevo | Carga géneros y coordina qué secciones mostrar y en qué orden |
| `src/hooks/useGenreCarousel.ts` | Nuevo | Fetch de medias para un género concreto; triggered al entrar en viewport |
| `src/components/Navbar.tsx` | Modificar | Añadir enlace a `/explore` |
| `src/App.tsx` / router | Modificar | Registrar ruta `/explore` |

---

## Notas técnicas

- Endpoint principal: `GET /discover/movie?with_genres=ID&sort_by=popularity.desc&page=1` y su equivalente para TV
- El componente `<Carousel>` de `src/components/ui/carousel.tsx` usa Embla Carousel — importar `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`
- Para la carga lazy usar un `ref` con `useIntersectionObserver` (puede reutilizar la lógica de `useInfiniteScroll`)
- Los géneros a mostrar por defecto: IDs fijos para Acción (28/10759), Comedia (35), Drama (18), Terror (27/9648), Sci-Fi (878/10765), Animación (16), Thriller (53), Documental (99) — ordenados por popularidad general
- La ruta `/explore?genre=ID` puede reutilizar el componente `Home` con el `selectedGenreId` pre-cargado en el contexto, sin duplicar lógica de fetch

---

## Fuera de alcance (v1)

- Personalización del orden de géneros por el usuario
- Géneros favoritos o marcados
- Infinite scroll dentro de un carrusel (solo se muestran los primeros N items)
- Subgéneros o filtros adicionales dentro de la página Explorar
- Persistencia del tipo de contenido seleccionado entre sesiones
