# Feature: Filmografía completa del actor y equipo técnico navegable

## Historia de usuario

Como usuario que acaba de descubrir a un actor, actriz, director o creador que le gusta,
quiero explorar toda su filmografía filtrándola y viendo qué puedo ver ya en mis plataformas,
para decidir qué ver a continuación siguiendo a las personas y no solo a los títulos.

---

## Descripción

US-014 define la v1 del perfil de actor: foto, biografía y carrusel "Conocido por". Esta US la amplía (y debe implementarse después de US-014) y cubre lo que allí queda fuera de alcance: filmografía completa, filtros por tipo y una lectura útil para decidir, es decir, qué títulos de esa persona están disponibles en las plataformas del usuario.

También extiende la navegación a personas más allá del reparto: en la ficha de un título aparecen el director (películas) o los creadores (series), que llevan al mismo perfil. En ese caso el perfil muestra sus créditos de equipo (`crew`) en vez de los de reparto.

La filmografía se presenta como una lista cronológica agrupada por año (lo más reciente arriba, con los próximos estrenos marcados), con el personaje o cargo de cada crédito. Así el usuario ve la trayectoria completa, no solo los éxitos.

---

## Criterios de aceptación

### Filmografía
- [ ] El perfil `/actor/:actorId` incluye una sección "Filmografía" debajo de "Conocido por"
- [ ] Los créditos se agrupan por año, de más reciente a más antiguo; los que no tienen fecha van a un grupo "Próximamente / sin fecha" al principio
- [ ] Cada crédito muestra título, año, tipo (película/serie), personaje (cast) o cargo (crew) y, en series, el número de episodios en los que aparece
- [ ] Cada crédito es clickable y navega a `/details/:type/:id`
- [ ] Se eliminan los duplicados (el mismo título con varios personajes o cargos aparece una vez, con los roles unidos)

### Filtros
- [ ] Chips de filtro: Todo · Películas · Series
- [ ] Chip de rol cuando la persona tiene créditos de los dos tipos: Interpretación · Dirección · Guion · Producción
- [ ] Toggle "Solo en mis plataformas", que filtra por las plataformas seleccionadas en `MediaFiltersContext` (región ES)
- [ ] Los filtros se reflejan en la URL (query params) para que funcione el botón atrás

### Datos de la persona
- [ ] Se muestran: edad (o edad al fallecer), lugar de nacimiento, número total de créditos y enlaces externos (IMDb, Instagram) si existen
- [ ] Galería horizontal de fotos de la persona (máx. 10)

### Equipo técnico navegable
- [ ] En la ficha de una película, el director aparece bajo el título y es clickable
- [ ] En la ficha de una serie, los creadores (`created_by`) aparecen bajo el título y son clickables
- [ ] El perfil detecta el departamento principal (`known_for_department`) y muestra por defecto el filtro de rol correspondiente

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/pages/ActorProfile.tsx` | Añadir sección Filmografía, filtros, datos ampliados y galería |
| `src/components/person/Filmography.tsx` | Lista de créditos agrupada por año |
| `src/components/person/FilmographyFilters.tsx` | Chips de tipo, rol y toggle de plataformas |
| `src/components/media/MediaCrewLine.tsx` | Línea "Dirigida por / Creada por" en la ficha |
| `src/services/tmdb/actors.ts` | Ampliar con `append_to_response=combined_credits,external_ids,images` |
| `src/hooks/usePersonFilmography.ts` | Normalización, deduplicado, agrupación y filtrado |

---

## Notas técnicas

- Una sola llamada: `GET /person/:id?append_to_response=combined_credits,external_ids,images&language=es-ES`
- Director: `GET /movie/:id/credits` → `crew.filter(c => c.job === 'Director')` (la llamada de créditos ya existe en `MediaDetails.tsx`; reutilizarla)
- Creadores: `created_by` ya viene en `GET /tv/:id` (añadirlo al mapeo de `fetchMediaDetails`)
- "Solo en mis plataformas" necesita los proveedores de cada título. Para no lanzar N llamadas, hacerlo bajo demanda solo cuando se activa el toggle, con concurrencia limitada (p. ej. 5 en paralelo) y usando `cachedFetch`
- Renombrar la ruta a `/person/:id` es opcional; si se hace, mantener `/actor/:id` como alias

---

## Fuera de alcance (v1)

- Seguir a una persona y recibir avisos de sus estrenos
- "Colaboradores frecuentes" (cruce de créditos entre personas)
- Estadísticas del tipo "has visto X de sus títulos" (depende del historial de Trakt)
