# US-027: Consistencia global del estado de favoritos

## Historia de usuario

Como usuario de CineTracker,
quiero que el corazón de favorito refleje el estado correcto en todas las vistas al mismo tiempo,
para no tener que recargar la app ni ver estados contradictorios entre la card y el detalle.

---

## Descripción

Esta US es transversal a la épica: garantiza que el estado de favoritos es **una única fuente de verdad** compartida por todos los componentes que muestran el icono de favorito. Cubre tanto el modo local como el modo Trakt.

Los problemas concretos a resolver:

1. Marcar favorito en `MediaDetails` no actualiza el corazón en `MediaCard` visible detrás (o al volver al listado).
2. Si se abre la misma película en dos tabs del navegador, los estados pueden divergir (no bloqueante, pero sí documentar el comportamiento esperado).
3. Al hacer logout de Trakt, los favoritos de Trakt deben desaparecer del estado en memoria (aunque siguen en localStorage hasta que el usuario los limpie manualmente o hasta que se fusionen en el próximo login).

---

## Criterios de aceptación

### Una sola fuente de verdad
- [ ] `useFavorites` expone el estado desde un **Context** (no desde `useState` local en cada componente), de forma que todos los consumidores leen el mismo array
- [ ] Añadir o quitar un favorito desde cualquier componente actualiza inmediatamente todos los demás componentes que muestran ese item

### Navegación
- [ ] Al volver de `MediaDetails` a Home/Explore mediante el botón de retroceso, las cards muestran el estado actualizado de favorito sin recargar la página
- [ ] Si el usuario navega a Home después de marcar favorito en Detalle (push de ruta nueva), las cards también muestran el estado correcto

### Logout de Trakt
- [ ] Al desconectar Trakt desde Settings, los favoritos que provenían **exclusivamente** de Trakt (no estaban en localStorage antes) se eliminan del estado en memoria
- [ ] Los favoritos que el usuario marcó localmente antes de conectar Trakt permanecen
- [ ] El badge de cantidad se actualiza correctamente tras el logout

### Reconexión de Trakt
- [ ] Al volver a conectar Trakt, se vuelve a ejecutar la fusión (pull desde Trakt + merge con local), como en US-026

### Comportamiento multi-tab (documentado, no bloqueante)
- [ ] En el README o en un comentario de código se documenta que la sincronización multi-tab no está implementada y que la última acción del tab activo prevalece en localStorage

---

## Componentes nuevos o modificados

| Componente | Cambio |
|---|---|
| `src/contexts/FavoritesContext.tsx` | Nuevo Context (o integrar en `MediaFiltersContext` si tiene sentido) que provee `favorites`, `isFavorite`, `toggleFavorite` |
| `src/hooks/useFavorites.ts` | Refactorizar para consumir `FavoritesContext` en lugar de tener estado propio |
| `src/App.tsx` | Envolver el árbol con `FavoritesProvider` |
| `src/components/Settings.tsx` | Al hacer logout de Trakt, llamar a `clearTraktFavorites()` del context |

---

## Notas técnicas

- Si `MediaFiltersContext` ya está sobrecargado, crear un `FavoritesContext` separado y componerlos en `App.tsx`.
- El Context debe exponer: `favorites: FavoriteItem[]`, `isFavorite(id, type)`, `toggleFavorite(id, type)`, `isSyncing: boolean` (para el estado de carga de Trakt).
- `clearTraktFavorites()` filtra del array en memoria los items cuyo origen era Trakt y que no estaban en la snapshot pre-Trakt. La forma más simple: guardar un set de IDs pre-Trakt antes de la fusión y usarlo para el filtrado al hacer logout.

---

## Fuera de alcance

- Sincronización en tiempo real entre tabs (requeriría BroadcastChannel o similar)
- Persistencia del "origen" de cada favorito más allá de la sesión actual
