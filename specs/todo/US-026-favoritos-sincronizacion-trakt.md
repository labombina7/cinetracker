# US-026: Sincronización bidireccional de favoritos con Trakt

## Historia de usuario

Como usuario con cuenta Trakt vinculada,
quiero que mis favoritos en la app estén siempre en sync con mi watchlist de Trakt,
para no perder nada si cambio de dispositivo y poder gestionar mi lista desde cualquier sitio.

---

## Descripción

Cuando el usuario tiene Trakt configurado, los favoritos deben funcionar de forma bidireccional:

- **Al arrancar la app**: se recupera el watchlist de Trakt y se fusiona con los favoritos locales.
- **Al añadir un favorito**: se guarda en local Y se añade al watchlist de Trakt.
- **Al quitar un favorito**: se elimina de local Y se elimina del watchlist de Trakt.

La fusión al arrancar es aditiva: si hay favoritos en local que no están en Trakt, se suben a Trakt. Si hay items en Trakt que no están en local, se añaden al local. El usuario nunca pierde favoritos por el proceso de fusión.

---

## Criterios de aceptación

### Carga inicial (pull desde Trakt)
- [ ] Al arrancar con Trakt configurado, se llama a la API de Trakt para obtener el watchlist (`GET /users/me/watchlist/movies` y `GET /users/me/watchlist/shows`)
- [ ] Los items del watchlist de Trakt se convierten al formato interno `{ id: tmdbId, type }` usando el campo `ids.tmdb` de la respuesta de Trakt
- [ ] Se fusiona la lista de Trakt con la lista local: el resultado es la unión de ambas (sin duplicados)
- [ ] Los favoritos locales que no estaban en Trakt se suben a Trakt de forma silenciosa en background (fire-and-forget, sin bloquear la UI)
- [ ] Si Trakt devuelve error en la carga inicial, se usa la lista local como fallback y se muestra un toast de aviso

### Añadir favorito con Trakt activo
- [ ] Al pulsar el corazón, el item se añade al estado local inmediatamente (optimista)
- [ ] En background se llama a `POST /sync/watchlist` con el item correspondiente
- [ ] Si la llamada a Trakt falla, el favorito permanece en local (no se revierte) y se muestra un toast de error
- [ ] Si el item ya estaba en Trakt, la API devuelve 200 con `not_found: 0` y no se produce error

### Quitar favorito con Trakt activo
- [ ] Al pulsar el corazón para desmarcar, el item se elimina del estado local inmediatamente (optimista)
- [ ] En background se llama a `POST /sync/watchlist/remove` con el item correspondiente
- [ ] Si la llamada a Trakt falla, el favorito se re-añade al local (se revierte el optimismo) y se muestra un toast de error
- [ ] Si el item no estaba en Trakt, la API responde con `not_found: 1`; se ignora el error (el resultado local es correcto)

### Estados de carga
- [ ] Mientras se está cargando el watchlist de Trakt al inicio, el icono de favorito muestra un estado de carga (spinner pequeño o esqueleto) en lugar del corazón
- [ ] Una vez cargado, la UI se actualiza sin flash visible

---

## Endpoints de Trakt utilizados

| Acción | Endpoint | Método |
|---|---|---|
| Obtener watchlist películas | `/users/me/watchlist/movies` | GET |
| Obtener watchlist series | `/users/me/watchlist/shows` | GET |
| Añadir al watchlist | `/sync/watchlist` | POST |
| Eliminar del watchlist | `/sync/watchlist/remove` | POST |

Todos requieren el header `Authorization: Bearer <trakt_token>` y `trakt-api-key`.

---

## Componentes nuevos o modificados

| Componente | Cambio |
|---|---|
| `src/services/trakt/traktWatchlist.ts` | Nuevo módulo: `getWatchlist()`, `addToWatchlist()`, `removeFromWatchlist()` |
| `src/hooks/useFavorites.ts` | Integrar llamadas a `traktWatchlist` según si hay token; gestionar estado de carga inicial y reversión de errores |
| `src/hooks/useTraktSync.ts` | Nuevo hook opcional que encapsula la lógica de fusión inicial y la expone como `{ isSyncing, syncError }` |

---

## Notas técnicas

- El campo TMDB en la respuesta de Trakt es `movie.ids.tmdb` y `show.ids.tmdb`. Si es `null`, ignorar el item (Trakt puede tener items sin ID de TMDB).
- La fusión debe deduplicar por `{ id, type }`.
- El token de Trakt puede haber expirado; si la API devuelve 401, mostrar el aviso de re-autenticación (ya cubierto en US-008 si está implementada).
- Usar `AbortController` en la carga inicial para cancelar si el componente se desmonta.

---

## Fuera de alcance

- Renovación automática del token de Trakt (→ US-008)
- Sincronización de listas más allá del watchlist (ratings, historial)
- Resolución de conflictos cuando el mismo item se quita en Trakt externamente mientras la app está abierta (requeriría polling o websockets)
