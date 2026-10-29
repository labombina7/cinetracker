# Feature: "Si te gustó esto…": recomendaciones y colecciones en la ficha

## Historia de usuario

Como usuario que acaba de terminar o de descubrir un título que le gusta,
quiero ver títulos parecidos y, si es parte de una saga, el resto de entregas,
para encadenar mi siguiente película o serie sin volver a buscar desde cero.

---

## Descripción

Ahora la ficha es un callejón sin salida: tras leerla solo se puede volver atrás. Añadir recomendaciones al final cierra el ciclo de descubrimiento, igual que el perfil de actor (US-014) lo hace por la vía de las personas.

Se añaden dos bloques al final de la ficha. El primero, "Si te gustó esto", es un carrusel de recomendaciones de TMDB, con la opción de priorizar las disponibles en mis plataformas. El segundo, "Saga" (solo películas que pertenecen a una colección de TMDB), lista todas las entregas en orden cronológico y marca cuál es la actual, de modo que se ve enseguida el orden de visionado.

También se añade un bloque compacto de "Valoraciones": la nota de TMDB que ya existe y, si hay Trakt, la nota de la comunidad de Trakt y la del propio usuario.

---

## Criterios de aceptación

### Recomendaciones
- [ ] Carrusel "Si te gustó esto" con hasta 20 títulos usando `MediaCard`
- [ ] Toggle "Solo en mis plataformas" (reutiliza la lógica de US-030 si ya existe)
- [ ] Se excluyen títulos sin póster
- [ ] Si `/recommendations` viene vacío, se usa `/similar` como fallback; si los dos están vacíos, el bloque no se muestra

### Saga / colección
- [ ] Si la película tiene `belongs_to_collection`, se muestra el bloque "Saga: {nombre}"
- [ ] Entregas ordenadas por fecha de estreno, con número de orden y la actual resaltada
- [ ] Las entregas futuras se marcan como "Próximamente"

### Valoraciones
- [ ] Se muestra la nota de TMDB con el número de votos
- [ ] Con Trakt conectado, se muestran también la nota de Trakt (`/movies/:id/ratings`) y la nota del usuario si existe

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/media/MediaRecommendations.tsx` | Carrusel de recomendaciones |
| `src/components/media/MediaCollection.tsx` | Bloque de saga |
| `src/components/media/MediaRatings.tsx` | Notas de TMDB/Trakt |
| `src/services/tmdb/details.ts` | Añadir `recommendations` a `append_to_response`; mapear `belongs_to_collection` |
| `src/services/tmdb/collections.ts` | `fetchCollection(id)` |
| `src/services/trakt/ratings.ts` | Nota comunitaria y nota del usuario |

---

## Notas técnicas

- Recomendaciones: `GET /:type/:id/recommendations` (fallback `/similar`) pedidas al acercarse al bloque, en vez de `append_to_response`: así no engordan la carga inicial de la ficha
- `GET /collection/:id?language=es-ES` → `parts[]`
- Trakt: `GET /movies/:id/ratings` y `GET /shows/:id/ratings` (públicos), `GET /sync/ratings/movies` (usuario); aceptan el ID de TMDB vía `/search/tmdb/:id`
- Cargar los bloques con lazy loading (IntersectionObserver) porque están bajo el pliegue

---

## Fuera de alcance (v1)

- Recomendaciones personalizadas a partir de todos mis favoritos o de mi historial
- Puntuar títulos desde la app
- Notas de IMDb / Rotten Tomatoes (requieren otra API)
