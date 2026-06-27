# Feature: Iconos de plataforma en la tarjeta del grid

## Historia de usuario

Como usuario que navega el catálogo,
quiero ver en cada tarjeta qué plataformas de streaming ofrecen el título,
para decidir si vale la pena entrar al detalle sin tener que hacerlo.

---

## Descripción

En el grid de tarjetas (home, búsqueda) es habitual encontrar un título interesante pero no recordar si está disponible en las plataformas a las que estás suscrito. Actualmente hay que entrar al detalle para descubrirlo, lo que rompe el flujo de exploración.

Esta feature añade los logos de las plataformas de flatrate (suscripción) disponibles en ES directamente en la imagen de cada tarjeta, superpuestos en la esquina inferior izquierda junto a la puntuación. El dato viene del endpoint `/watch/providers` de TMDB, que ya se consume en otros flujos (filtrado por plataforma en trending).

Se muestran máximo 3 logos para no saturar la tarjeta. Si hay más, se indica con un "+N".

---

## Criterios de aceptación

### Visualización
- [ ] Los logos de plataforma aparecen superpuestos sobre la imagen, en la zona inferior izquierda
- [ ] Se muestran únicamente proveedores de tipo `flatrate` (suscripción) para la región ES
- [ ] Se muestran como máximo 3 logos; si hay más se añade un badge "+N" con los restantes
- [ ] Los logos son circulares/redondeados, tamaño ~24px, con borde blanco fino
- [ ] Si no hay datos de plataforma disponibles, el espacio no se muestra (sin placeholder vacío)

### Cobertura de datos
- [ ] Las tarjetas de `discover` (filtrado por plataforma vía `fetchByPlatform`) muestran logos
- [ ] Las tarjetas de `discover` sin filtro de plataforma (`discoverMedia`) muestran logos
- [ ] Las tarjetas de `trending` (con o sin filtro de plataforma activo) muestran logos

### Rendimiento
- [ ] Las llamadas a `/watch/providers` se realizan en paralelo con `Promise.all`
- [ ] El caché en memoria existente (5 min TTL) evita repetir llamadas en navegación

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/MediaCard.tsx` | Renderiza los logos en el overlay inferior izquierdo |
| `src/services/tmdb/utils.ts` | Nueva función `getProviderLogoUrl(path)` |
| `src/services/tmdb/index.ts` | Exporta `getProviderLogoUrl` |
| `src/services/tmdb/trending/fetchRealTrending.ts` | Siempre fetcha providers (no solo al filtrar) |
| `src/services/tmdb/discover/fetchDiscover.ts` | Fetcha watch providers por cada resultado |
| `src/services/tmdb/discover/fetchByPlatform.ts` | Fetcha watch providers por cada resultado |

---

## Notas técnicas

- Endpoint: `GET /movie/{id}/watch/providers` y `/tv/{id}/watch/providers`
- Los datos de ES se encuentran en `results.ES.flatrate`
- El logo se construye con `https://image.tmdb.org/t/p/w45{logo_path}`
- El caché en memoria (`apiCache.ts`) ya cachea estas URLs automáticamente
- La función `fetchWatchProviders` ya existe en `src/services/tmdb/providers.ts`

---

## Fuera de alcance (v1)

- Mostrar proveedores de alquiler o compra (solo flatrate/suscripción)
- Filtrar logos por las plataformas seleccionadas por el usuario
- Tooltip con el nombre de la plataforma al hacer hover
- Soporte para otras regiones (solo ES)
