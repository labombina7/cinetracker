# Feature: Página principal como Explorar con carruseles editoriales y por género

## Historia de usuario
Como usuario de CineTracker quiero que la página principal sea Explorar con carruseles editoriales y por género para descubrir contenido de un vistazo sin tener que buscar activamente.

---

## Descripción
La ruta `/` pasa a ser la página Explorar. La lógica de lista plana con scroll infinito que hoy vive en `Home.tsx` se mueve a una nueva página `List.tsx` accesible en `/list`, que actúa como drill-down desde los carruseles.

La parte superior de Explorar muestra 3 carruseles editoriales fijos que no se ven afectados por el filtro de ordenación: "Tendencias esta semana" (endpoint `/trending/*`), "Estrenos recientes" (discover ordenado por fecha de estreno, ventana de los últimos 60 días) y "Mejor valoradas" (discover ordenado por rating con mínimo 500 votos).

Debajo de los bloques editoriales se muestran 8 carruseles de género: Acción, Comedia, Drama, Terror, Sci-Fi, Animación, Thriller, Documental. Cada uno usa el `genreId` correcto según el `mediaType` activo (movie vs tv). El filtro Sort (popularidad / rating / fecha) aplica únicamente a estos carruseles de género, dejando intactos los editoriales.

Los carruseles de género se cargan de forma lazy mediante `IntersectionObserver`: el fetch no se dispara hasta que la sección entra en el viewport. En la cabecera de la página aparecen chips de anchor opcionales que permiten saltar directamente a un carrusel de género concreto mediante `scrollIntoView`. Cada carrusel incluye un botón "Ver más" que navega a `/list` con los filtros del carrusel ya aplicados (genreId, sortBy, plataformas activas).

---

## Criterios de aceptación

### Routing
- [ ] La ruta `/` renderiza `Explore.tsx` (no `Home.tsx`)
- [ ] La ruta `/list` renderiza `List.tsx` con la lógica de lista plana actual
- [ ] `Home.tsx` puede eliminarse o quedar vacío una vez migrada la lógica a `List.tsx`
- [ ] La navbar no añade enlace a `/list` (no es una ruta de navegación directa)

### Carruseles editoriales
- [ ] "Tendencias esta semana" usa el endpoint `/trending/{mediaType}/week`
- [ ] "Estrenos recientes" usa `/discover/{mediaType}` con `sort_by=primary_release_date.desc` y `primary_release_date.gte` = fecha actual menos 60 días
- [ ] "Mejor valoradas" usa `/discover/{mediaType}` con `sort_by=vote_average.desc` y `vote_count.gte=500`
- [ ] Los 3 carruseles editoriales NO se recargan al cambiar el filtro Sort
- [ ] Los 3 carruseles editoriales SÍ se recargan al cambiar el filtro de tipo (movie/tv) o de plataforma

### Carruseles de género
- [ ] Se muestran exactamente 8 géneros: Acción, Comedia, Drama, Terror, Sci-Fi, Animación, Thriller, Documental
- [ ] Cada género usa el `genreId` correcto según `mediaType`: movie (28, 35, 18, 27, 878, 16, 53, 99) y tv (10759, 35, 18, 9648, 10765, 16, 9648, 99)
- [ ] El filtro Sort aplica a todos los carruseles de género simultáneamente
- [ ] Los carruseles de género se recargan al cambiar Sort, tipo de contenido o plataforma
- [ ] Cada carrusel de género carga lazy: el fetch solo se dispara cuando la sección entra en el viewport
- [ ] Mientras carga se muestran skeletons del tamaño de una `MediaCard`
- [ ] Si un género devuelve 0 resultados, su sección no se renderiza

### Chips de anchor
- [ ] La cabecera de Explorar muestra chips con los nombres de los 8 géneros
- [ ] Al pulsar un chip se hace `scrollIntoView` del carrusel correspondiente con comportamiento `smooth`
- [ ] Los chips son opcionales en mobile (pueden ocultarse si hay poco espacio)

### Botón "Ver más"
- [ ] Cada carrusel (editorial y de género) tiene un botón "Ver más" al final o en la cabecera de sección
- [ ] "Ver más" navega a `/list` pasando por contexto o query param: `genreId`, `sortBy`, plataformas activas
- [ ] La página List arranca con los filtros ya aplicados al llegar desde "Ver más"

### Skeletons y errores
- [ ] Mientras cargan los editoriales se muestran skeletons
- [ ] El fallo de un carrusel no impide que el resto se cargue

---

## Componentes nuevos o modificados
| Componente | Acción | Descripción |
|---|---|---|
| `src/pages/Explore.tsx` | Modificar | Pasa a ser la página `/`; orquesta editoriales, chips de anchor y carruseles de género |
| `src/pages/List.tsx` | Nuevo | Mueve la lógica de lista plana de `Home.tsx`; recibe filtros iniciales por contexto |
| `src/pages/Home.tsx` | Eliminar o vaciar | Ya no es necesario; su lógica migra a `List.tsx` |
| `src/hooks/useEditorialCarousel.ts` | Modificar | Añade soporte para `fixedGenreId` y los 3 modos editoriales (trending, recent, topRated) |
| `src/components/explore/EditorialSection.tsx` | Nuevo | Sección de un carrusel editorial con cabecera y botón "Ver más" |
| `src/App.tsx` | Modificar | Cambia ruta `/` a `Explore`, añade ruta `/list` a `List` |

---

## Notas técnicas
- Géneros fijos por mediaType — movie: Acción=28, Comedia=35, Drama=18, Terror=27, Sci-Fi=878, Animación=16, Thriller=53, Documental=99; tv: Acción=10759, Comedia=35, Drama=18, Terror=9648, Sci-Fi=10765, Animación=16, Thriller=9648, Documental=99
- `useEditorialCarousel.ts` ya existe; extenderlo para recibir `{ type: 'trending' | 'recent' | 'topRated' | 'genre', fixedGenreId?: number }`
- La carga lazy de géneros puede reutilizar el patrón de `IntersectionObserver` ya presente en `useInfiniteScroll`
- El botón "Ver más" puede pasar los filtros a través de un context temporal o query params para que `List.tsx` los lea en el mount
- La ventana de 60 días para "Estrenos recientes": `new Date(Date.now() - 60*24*60*60*1000).toISOString().split('T')[0]`
- El componente `<Carousel>` de `src/components/ui/carousel.tsx` (Embla) ya existe; usarlo para todos los carruseles

---

## Fuera de alcance (v1)
- Personalización del orden de géneros por el usuario
- Más de 8 géneros o sección de subgéneros
- Infinite scroll dentro de un carrusel (solo primeros N items)
- Persistencia del tipo de contenido entre sesiones
- Animaciones de entrada para las secciones de género
