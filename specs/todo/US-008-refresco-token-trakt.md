# Feature: Refresco automático del token de Trakt

## Historia de usuario

Como usuario de CineTracker conectado con Trakt.tv,
quiero que mi sesión se mantenga activa de forma transparente cuando el token expire,
para no encontrarme con errores 401 inesperados ni tener que reconectarme manualmente.

---

## Descripción

Actualmente el `refresh_token` de Trakt se guarda en `localStorage` (`trakt_refresh_token`) pero nunca se usa. Cuando el `access_token` expira (por defecto 3 meses en Trakt), todas las llamadas a la API de Trakt devuelven 401 y el usuario ve errores sin entender por qué, ya que en la UI sigue apareciendo como "conectado".

Esta US implementa un mecanismo de refresco automático: cuando una petición a Trakt devuelve 401, se intenta refrescar el token usando el `refresh_token` almacenado y se reintenta la petición original. Si el refresco falla (token revocado o expirado), se hace logout limpio y se notifica al usuario.

---

## Criterios de aceptación

### Refresco automático
- [ ] Cuando una petición autenticada a Trakt devuelve 401, se llama automáticamente a `POST /oauth/token` con `grant_type: refresh_token`
- [ ] Si el refresco es exitoso, el nuevo `access_token` y `refresh_token` se guardan en `localStorage` y la petición original se reintenta una vez
- [ ] El refresco es transparente para el usuario: no ve ningún mensaje si funciona correctamente
- [ ] El reintento se hace como máximo una vez por petición (no bucle infinito)

### Logout limpio al fallar el refresco
- [ ] Si el refresco devuelve error (token revocado, expirado permanentemente o red caída), se hace logout completo: se eliminan `trakt_token`, `trakt_refresh_token`, `trakt_client_id`, `trakt_client_secret`
- [ ] Se muestra un toast informando al usuario: "Tu sesión de Trakt.tv ha expirado. Por favor, vuelve a conectarte."
- [ ] La app continúa funcionando sin la integración de Trakt (favoritos locales siguen funcionando)

### Indicador de expiración próxima (opcional nice-to-have)
- [ ] Si el token lleva más de 80 días activo (calculado desde la fecha de creación guardada), se muestra un banner sutil informando que la sesión expirará pronto

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/services/trakt/auth.ts` | Añadir función `refreshAccessToken()` que llama a `/oauth/token` con `grant_type: refresh_token` |
| `src/services/trakt/client.ts` | Añadir wrapper `authenticatedFetch()` que intercepta 401, llama a `refreshAccessToken()` y reintenta |
| `src/services/trakt/watchlist.ts` | Usar `authenticatedFetch()` en lugar de `fetch` directo |
| `src/services/trakt/user.ts` | Usar `authenticatedFetch()` en lugar de `fetch` directo |

---

## Notas técnicas

- Endpoint de refresco: `POST https://api.trakt.tv/oauth/token` con body `{ refresh_token, client_id, client_secret, redirect_uri, grant_type: 'refresh_token' }`
- El `client_secret` es opcional si la app usa flujo PKCE, pero actualmente se guarda en localStorage si el usuario lo proporcionó
- Guardar `trakt_token_created_at` (timestamp ISO) al obtener un nuevo token para calcular la antigüedad
- Para evitar race conditions si varias peticiones hacen refresh simultáneamente, usar una Promise compartida (`let refreshPromise: Promise<string | null> | null = null`)

---

## Fuera de alcance (v1)

- Migración a flujo PKCE (elimina la necesidad de client_secret)
- Notificaciones push de expiración
- Sincronización del estado de autenticación entre pestañas
