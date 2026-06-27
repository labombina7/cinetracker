# Feature: Página de lista drill-down con scroll infinito

## Historia de usuario
Como usuario que quiere ver más contenido de una categoría, quiero una página de lista con scroll infinito accesible desde "Ver más" en los carruseles para explorar en profundidad sin perder los filtros del carrusel de origen.

---

## Descripción
La ruta `/list` es una página de drill-down no accesible directamente desde la navbar. Se llega a ella pulsando "Ver más" en cualquier carrusel de Explorar, y arranca con los filtros del carrusel de origen ya aplicados: `genreId` (si el origen era un carrusel de género), `sortBy` y las plataformas activas en ese momento.

La cabecera de la página es sticky e incluye una barra de búsqueda, los filtros compactos de tipo / idioma / ordenar y los chips de género y plataformas activas. Permite refinar la lista desde esa misma cabecera sin volver a Explorar.

El cuerpo de la página es un grid de tarjetas con scroll infinito: al llegar al final se carga la siguiente página de resultados de forma transparente. El número de columnas se adapta al viewport (3 en mobile, 4 en tablet, 5 en desktop).

Un botón "Atrás" o breadcrumb en la cabecera permite volver a Explorar, preservando la posición de scroll de la página anterior si el historial lo permite.

---

## Criterios de aceptación

### Routing y entrada
- [ ] La ruta `/list` existe y renderiza `List.tsx`
- [ ] No hay enlace directo a `/list` en la navbar
- [ ] Al llegar desde "Ver más", los filtros iniciales (genreId, sortBy, plataformas) están ya aplicados en el primer render
- [ ] Si se accede a `/list` sin filtros de origen, muestra contenido con los filtros globales por defecto

### Cabecera sticky
- [ ] La cabecera tiene `position: sticky; top: 0` y se mantiene visible al hacer scroll
- [ ] Incluye un campo de búsqueda que filtra los resultados en tiempo real (con debounce de 300 ms)
- [ ] Incluye el componente `FilterBar` con los filtros de tipo, idioma y ordenar
- [ ] Muestra chips de género clicables para cambiar el género activo sin salir de la página
- [ ] Muestra chips de plataformas activas clicables para activar/desactivar plataformas sin salir de la página
- [ ] Cambiar cualquier filtro reinicia la lista al inicio (página 1) y hace scroll al top

### Grid de tarjetas
- [ ] Las tarjetas usan el componente `MediaCard` existente
- [ ] 3 columnas en mobile, 4 en tablet, 5 en desktop
- [ ] Mientras carga la primera página se muestran skeletons del tamaño de `MediaCard`
- [ ] Las páginas adicionales cargan al llegar al final del scroll (IntersectionObserver sobre un sentinel)
- [ ] Mientras carga una página adicional se muestran skeletons al final del grid
- [ ] Si no hay más páginas se muestra un mensaje "Has llegado al final"

### Navegación de vuelta
- [ ] Hay un botón "Atrás" o breadcrumb visible en la cabecera
- [ ] Al pulsarlo navega a Explorar (`/`)
- [ ] Si el navegador tiene historial previo, se usa `navigate(-1)`; si no, navega a `/`

### Estado vacío y errores
- [ ] Si la búsqueda o filtros no devuelven resultados, se muestra un estado vacío con mensaje contextual
- [ ] Los errores de fetch muestran un botón "Reintentar"

---

## Componentes nuevos o modificados
| Componente | Acción | Descripción |
|---|---|---|
| `src/pages/List.tsx` | Nuevo | Página `/list`; recibe filtros iniciales y orquesta cabecera sticky + grid infinito |
| `src/components/FilterBar.tsx` | Nuevo | Barra de filtros compacta reutilizable (ver US-023) |
| `src/App.tsx` | Modificar | Registrar ruta `/list` apuntando a `List.tsx` |

---

## Notas técnicas
- Los filtros iniciales pueden pasarse a través de un context temporal (ej. `ListFiltersContext`) o como state en la navegación con `navigate('/list', { state: { genreId, sortBy } })`
- En `List.tsx`, leer el state con `useLocation().state` y usarlo como valor inicial del hook de filtros local
- El scroll infinito puede reutilizar el hook `useInfiniteScroll` ya existente o el patrón de `IntersectionObserver` del proyecto
- La búsqueda textual usa el parámetro `query` del endpoint `/search/multi` de TMDB; si hay `genreId` activo y se busca texto, combinar ambos si el endpoint lo permite, o priorizar la búsqueda textual
- La cabecera sticky debe tener un `z-index` superior al de las tarjetas para no quedar tapada

---

## Fuera de alcance (v1)
- Búsqueda combinada con filtros de género en el mismo endpoint de TMDB
- Guardar la posición de scroll al volver a Explorar
- Ordenación por columnas o vista alternativa (lista vs grid)
- Filtros avanzados (año, duración, country)
