# Feature: Página de perfil de actor con filmografía

## Historia de usuario

Como usuario de CineTracker que ve la ficha de un título,
quiero poder pulsar en el nombre o foto de un actor del reparto para ver su perfil completo,
para descubrir otras películas y series en las que aparece ese actor.

---

## Descripción

El carrusel de cast en la página de detalle ya muestra los actores con foto y personaje, pero los items no son clickables. Añadir una página de perfil de actor cierra el ciclo de descubrimiento: el usuario ve a un actor que le gusta, pulsa su nombre, y descubre su filmografía completa.

La página de perfil muestra la foto del actor, su biografía truncada (expandible), y un carrusel de sus créditos más populares ordenados por popularidad, clickables hacia los detalles de cada título.

---

## Criterios de aceptación

### Navegación al perfil
- [ ] Cada item del carrusel de cast en `MediaCastCarousel` es clickable y navega a `/actor/:actorId`
- [ ] Al pulsar, la imagen del actor tiene un efecto hover sutil (overlay oscuro con icono de persona)

### Página de perfil `/actor/:actorId`
- [ ] Muestra: foto del actor, nombre, fecha de nacimiento (si disponible), país de origen
- [ ] Muestra una biografía truncada a 4 líneas con botón "Leer más" para expandir
- [ ] Muestra un carrusel horizontal "Conocido por" con los créditos más populares del actor (máx. 20)
- [ ] Cada item del carrusel de créditos es un `<MediaCard>` clickable que navega al detalle del título
- [ ] Tiene un botón de regreso (reutiliza el patrón de `MediaDetailHeader`)

### Estados de carga y error
- [ ] Mientras carga el perfil, se muestra un skeleton con las proporciones correctas
- [ ] Si el actor no se encuentra (404), se muestra un mensaje y un botón para volver atrás

### Internacionalización
- [ ] La biografía se solicita en el idioma activo de la app (`language` param en la llamada TMDB)
- [ ] Si no hay biografía en el idioma activo, se usa el fallback en inglés

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/pages/ActorProfile.tsx` | Nueva página de perfil de actor |
| `src/components/media/MediaCastCarousel.tsx` | Hacer los items clickables; añadir hover effect |
| `src/services/tmdb/actors.ts` | Nuevo servicio: `fetchActorDetails(id)` y `fetchActorCredits(id)` |
| `src/hooks/useActorProfile.ts` | Hook que combina detalles y créditos del actor |
| `src/App.tsx` | Registrar ruta `/actor/:actorId` |

---

## Notas técnicas

- Endpoints TMDB:
  - `GET /person/:actorId?language=es-ES` — detalles del actor (nombre, biografía, foto, fecha nacimiento)
  - `GET /person/:actorId/combined_credits?language=es-ES` — créditos combinados (película + TV); ordenar por `popularity` desc y tomar los primeros 20
- La foto del actor: `TMDB_CONFIG.IMAGE_BASE_URL + '/w185' + person.profile_path`
- Los créditos devuelven tanto `cast` como `crew`; para esta feature usar solo `cast`
- El tipo `CastMember` ya existe en `src/types/media.ts`; puede extenderse o crear `ActorDetails`

---

## Fuera de alcance (v1)

- Filmografía completa con paginación
- Filtro de la filmografía por tipo (solo películas / solo series)
- Actores relacionados ("Colaboró frecuentemente con")
- Seguir a un actor para recibir novedades
