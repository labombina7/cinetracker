# Feature: Barra de filtros compacta en una sola línea

## Historia de usuario
Como usuario quiero que los filtros de tipo, idioma y ordenar estén en la misma línea que las plataformas activas para no ocupar espacio innecesario en pantalla.

---

## Descripción
La barra de filtros actual ocupa un bloque visual propio con fondo y padding generoso. Se reemplaza por un componente `FilterBar` compacto que agrupa todos los controles en una única línea horizontal: a la izquierda los selectores de tipo / idioma / ordenar, y a la derecha los chips de plataformas activas separados por un espaciador flex.

El componente `FilterBar` es reutilizable y se usa tanto en `Explore.tsx` (sticky en la parte superior de la página) como en `List.tsx` (sticky en la cabecera de la lista drill-down). De esta forma la experiencia de filtrado es consistente en ambas páginas.

En mobile (< 640 px) la barra se parte en dos líneas: la primera contiene tipo, idioma y ordenar; la segunda contiene los chips de plataformas activas. En ambas líneas los elementos siguen siendo compactos para no ocupar más de lo necesario.

La barra es sticky en las dos páginas donde se usa, con `position: sticky; top: 0` y un `z-index` suficiente para quedar por encima del contenido que pasa por debajo al hacer scroll.

---

## Criterios de aceptación

### Layout desktop (≥ 640 px)
- [ ] Una única línea con la estructura: `[Todo | Películas | Series]` `[🌐 Idioma]` `[☰ Ordenar]` — espacio flexible — `[chips de plataformas activas]`
- [ ] Los controles de la izquierda y los chips de la derecha están alineados verticalmente al centro
- [ ] El espacio entre ambos grupos se gestiona con `flex: 1` o `gap` para que se adapten al ancho del contenedor

### Layout mobile (< 640 px)
- [ ] Primera línea: `[Todo | Películas | Series]` `[🌐 Idioma]` `[☰ Ordenar]`
- [ ] Segunda línea: chips de plataformas activas con scroll horizontal si no caben
- [ ] Ambas líneas mantienen tamaño de fuente y padding compactos (no más alto que la barra actual en total)

### Sticky
- [ ] En `Explore.tsx` la barra tiene `position: sticky; top: 0`
- [ ] En `List.tsx` la barra tiene `position: sticky; top: 0`
- [ ] El fondo de la barra sticky no es transparente (evitar efecto de contenido traslúcido al hacer scroll)
- [ ] El `z-index` de la barra es superior al de las tarjetas del grid y los carruseles

### Controles
- [ ] `[Todo | Películas | Series]` es un grupo de botones toggle que actualiza `mediaType` en `MediaFiltersContext`
- [ ] `[🌐 Idioma]` abre el selector de idioma existente (o un dropdown compacto)
- [ ] `[☰ Ordenar]` abre el selector de ordenación existente (popularidad / rating / fecha)
- [ ] Los chips de plataforma muestran el logo (o nombre si no hay logo) de cada plataforma activa
- [ ] Pulsar un chip de plataforma en Explorar activa el foco exclusivo (US-022); en List activa/desactiva esa plataforma en el filtro local

### Eliminación del bloque de filtros anterior
- [ ] El bloque de filtros actual (el que tiene `bg-white/5` con padding propio) se elimina de `Explore.tsx`
- [ ] El bloque de filtros actual se elimina de `List.tsx` (no existirá aún al implementar esta US, pero no debe añadirse)
- [ ] No quedan referencias visuales al diseño anterior de filtros en ninguna de las dos páginas

---

## Componentes nuevos o modificados
| Componente | Acción | Descripción |
|---|---|---|
| `src/components/FilterBar.tsx` | Nuevo | Barra de filtros compacta reutilizable con layout de una línea en desktop y dos en mobile |
| `src/pages/Explore.tsx` | Modificar | Sustituye el bloque de filtros actual por `<FilterBar>`; pasa los handlers de foco de plataforma (US-022) |
| `src/pages/List.tsx` | Modificar | Usa `<FilterBar>` como cabecera sticky; pasa los filtros locales de la lista |
| `src/components/home/MediaFilters.tsx` | Eliminar o deprecar | Su funcionalidad queda absorbida por `FilterBar`; eliminar si ya no hay otros usos |

---

## Notas técnicas
- `FilterBar` recibe props: `mediaType`, `onMediaTypeChange`, `language`, `onLanguageChange`, `sortBy`, `onSortChange`, `activePlatforms: Platform[]`, `onPlatformClick: (id: number) => void`, `focusPlatformId?: number | null`
- Usar `flex-wrap` con clases de breakpoint de Tailwind: `flex-wrap sm:flex-nowrap` para el layout responsivo
- El fondo sticky puede usar `bg-background/95 backdrop-blur-sm` para un efecto de cristal ligero que no sea completamente transparente
- Los chips de plataforma pueden reutilizar el componente de chip ya existente en el proyecto; añadir prop `isFocused` para el estilo diferenciado de US-022
- Si `MediaFilters.tsx` ya no tiene otros consumidores tras esta US, eliminar el fichero para evitar dead code

---

## Fuera de alcance (v1)
- Filtros avanzados (año, duración, país de producción)
- Animación de apertura/cierre de dropdowns de idioma u ordenar
- Barra de filtros colapsable en mobile
- Persistencia de idioma o plataformas entre sesiones desde esta barra
