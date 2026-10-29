# Feature: Refresco fiable del token de Trakt

## Historia de usuario

Como usuario de CineTracker conectado con Trakt.tv,
quiero que mi sesión se renueve sola y no se cierre por fallos pasajeros o por tener varias pestañas abiertas,
para no tener que reconectarme cada pocos días.

---

## Descripción

Desde la migración de Trakt a PKCE (PR #28), los tokens de acceso duran **7 días** y cada refresh token es **de un solo uso**: al renovar, Trakt devuelve un par nuevo e invalida el anterior. Un refresh token rechazado devuelve `400 invalid_grant`.

La app ya renovaba el token al recibir un 401 (`authenticatedFetch`), pero con tokens de una semana aparecían fallos que antes eran raros:

- Con dos pestañas abiertas, ambas renovaban con el mismo refresh token; la segunda recibía `invalid_grant` y borraba la sesión, incluido el token nuevo que acababa de guardar la primera.
- Cualquier fallo de red o error 5xx durante la renovación cerraba la sesión para siempre.
- Al cerrar la sesión se borraba también el Client ID, que con PKCE es configuración de la app.
- Solo se renovaba después de que una petición fallara.

Esta US hace la renovación preventiva, coordinada entre pestañas y tolerante a fallos pasajeros.

---

## Criterios de aceptación

### Renovación
- [x] Al obtener o renovar un token se guardan `trakt_token_created_at` y `trakt_token_expires_at` (de `created_at` + `expires_in`; 7 días si no vienen)
- [x] Si al token le quedan menos de 24 h, se renueva antes de la petición; si la renovación falla por red, la petición sigue con el token actual
- [x] Si una petición devuelve 401, se renueva y se reintenta una sola vez
- [x] La renovación se envía sin `client_secret` ni `code_verifier` (apps PKCE)
- [x] Siempre se guarda el refresh token nuevo

### Varias pestañas y peticiones simultáneas
- [x] Dentro de una pestaña, las peticiones que caducan a la vez comparten una única renovación
- [x] Entre pestañas, la renovación se serializa con `navigator.locks`; la pestaña que espera reutiliza el token que ya ha guardado la otra, sin llamar a Trakt
- [x] Si Trakt rechaza el refresh token pero otra pestaña ya guardó uno nuevo, se usa ese y no se cierra la sesión

### Cierre de sesión
- [x] La sesión solo se cierra si Trakt rechaza el refresh token (400/401) o no hay refresh token
- [x] Un fallo de red o un 5xx no cierra la sesión; se reintenta en la siguiente petición
- [x] Al cerrar la sesión se borran los tokens pero se conserva el Client ID
- [x] Se muestra una sola vez el aviso "Tu sesión de Trakt.tv ha expirado. Por favor, vuelve a conectarte."

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/services/trakt/auth.ts` | `saveTokens()`, `getTokenExpiry()`, `refreshAccessToken(staleToken)` con resultado `ok` / `invalid` / `transient` y Web Locks |
| `src/services/trakt/client.ts` | `authenticatedFetch()` con renovación preventiva y cierre de sesión solo con `invalid` |
| `CLAUDE.md` | Claves de localStorage y flujo OAuth actualizados |

---

## Notas técnicas

- Documentación: https://developer.trakt.tv/docs/authentication-oauth y https://developer.trakt.tv/docs/pkce
- Los tokens anteriores a la migración de Trakt devuelven `invalid_grant`: esos usuarios tendrán que reconectar una vez
- Sin `navigator.locks` (navegadores muy antiguos) se mantiene la comprobación de "otra pestaña ya renovó" tras un `invalid_grant`

---

## Fuera de alcance (v1)

- Que la interfaz (Navbar, página de Trakt) reaccione al cierre de sesión sin recargar
- Sincronizar el estado de autenticación entre pestañas en tiempo real (evento `storage`)
