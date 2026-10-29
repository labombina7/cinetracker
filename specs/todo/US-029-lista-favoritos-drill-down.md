# US-029: Lista drill-down de favoritos

## Historia de usuario

Como usuario que quiere ver todos sus favoritos de un tipo,
quiero una página de lista completa filtrable a la que llego desde "Ver todas" en los carruseles de favoritos,
para explorar mi lista con comodidad sin perder la capacidad de desmarcar items.

---

## Descripción

Nueva ruta `/favorites/list` a la que se llega desde el botón "Ver todas" de los carruseles de `/favorites`. Arranca con un filtro de tipo (`movie` o `tv`) ya aplicado según desde qué carrusel se llegó, pero el usuario puede cambiar entre tipos desde la misma página.

A diferencia de `/list` (drill-down de Explorar), aquí no hay fetch a TMDB: la fuente de datos es exclusivamente el array de favoritos en memoria. El grid muestra todas las cards sin paginación (los favoritos raramente superan las decenas). Si en el futuro el volumen lo justifica, se puede añadir virtualización.

---

## Criterios de aceptación

### Routing y entrada
- [ ] La ruta `/favorites/list` existe y renderiza `FavoritesList.tsx`
- [ ] Acepta query param `?type=movie` o `?type=tv` para el filtro inicial
- [ ] Si no hay query param, muestra todos los favoritos (movies + tv mezclados)
- [ ] No hay enlace directo a esta ruta en la navbar (solo se accede desde `/favorites`)

### Cabecera
- [ ] Botón "Atrás" que navega a `/favorites` (o `navigate(-1)` si hay historial)
- [ ] Título dinámico: "Películas favoritas" / "Series favoritas" / "Todos los favoritos"
- [ ] Tabs o chips para cambiar entre "Todas", "Películas" y "Series" sin salir de la página
- [ ] Al cambiar de tab, la URL se actualiza con el query param correspondiente (para que el botón atrás funcione bien)
- [ ] Campo de búsqueda que filtra los favoritos mostrados por título (client-side, sin debounce necesario al ser datos locales)

### Grid de cards
- [ ] Se usa el componente `MediaCard` existente
- [ ] 3 columnas en mobile, 4 en tablet, 5 en desktop (mismo patrón que `/list`)
- [ ] El corazón en cada card está activado; al pulsarlo se desmarca el favorito y la card desaparece del grid de forma reactiva
- [ ] Si el grid queda vacío por desmarcar todos, aparece el estado vacío con botón "Explorar contenido"
- [ ] Si la búsqueda no da resultados, aparece estado vacío contextual: _"Ningún favorito coincide con tu búsqueda"_

### Estado vacío de entrada
- [ ] Si el usuario llega con `?type=movie` pero no tiene películas favoritas, el grid está vacío con el mensaje correspondiente y la opción de cambiar a "Series" mediante los tabs

---

## Componentes nuevos o modificados

| Componente | Acción | Descripción |
|---|---|---|
| `src/pages/FavoritesList.tsx` | Nuevo | Grid de favoritos filtrable por tipo y búsqueda |
| `src/App.tsx` / router | Modificar | Registrar ruta `/favorites/list` |

---

## Notas técnicas

- El filtrado es 100% client-side sobre el array del Context: no hay llamadas a red en esta página.
- La búsqueda filtra con `title.toLowerCase().includes(query.toLowerCase())`.
- Los tabs pueden ser los mismos chips de tipo (`movie`/`tv`) que usa FilterBar; reutilizar el componente si es posible.
- Mantener la URL sincronizada con el tab activo usando `useSearchParams` de react-router para que el botón atrás del navegador restaure el tab.

---

## Dependencias

- US-028 (página de favoritos con carruseles, prerequisito de navegación)
- US-025 (FavoritesContext global)

---

## Fuera de alcance

- Ordenación de la lista (por fecha de añadido, por título, por año)
- Virtualización del scroll para listas muy largas
- Selección múltiple para desmarcar varios favoritos a la vez
