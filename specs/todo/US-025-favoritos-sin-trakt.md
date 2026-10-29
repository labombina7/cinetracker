# US-025: Gestión de favoritos sin cuenta Trakt

## Historia de usuario

Como usuario sin cuenta Trakt,
quiero poder añadir y quitar favoritos libremente y verlos siempre actualizados,
para mantener mi lista personal aunque no use ningún servicio externo.

---

## Descripción

Esta US se centra en que la experiencia de favoritos sea completa y sin fricción cuando no hay Trakt. El usuario puede marcar/desmarcar favoritos desde la card y desde el detalle, y el corazón/icono refleja el estado real en tiempo real en todas las vistas sin necesidad de recargar.

También cubre el caso de que el usuario tenga muchos favoritos: si la lista supera N elementos, mostramos un contador o indicador en algún lugar visible (navbar, icono).

---

## Criterios de aceptación

### Añadir / quitar
- [ ] El botón de favorito en `MediaCard` alterna correctamente entre activo/inactivo al pulsar
- [ ] El botón de favorito en `MediaDetails` hace lo mismo y está sincronizado con el estado de `MediaCard` (si ambos están en pantalla, ambos reflejan el mismo estado)
- [ ] El estado se actualiza de forma optimista (sin esperar nada, ya que es solo local)

### Indicador de cantidad
- [ ] En la navbar o en el icono de favoritos hay un badge numérico que muestra cuántos favoritos tiene el usuario
- [ ] El badge desaparece si el usuario no tiene ningún favorito
- [ ] El badge no aparece en modo Trakt si la sincronización aún está en curso (→ US-026 gestiona ese estado)

### Consistencia visual
- [ ] Al entrar en Home después de marcar un favorito en Detalle, las cards ya muestran el corazón correcto (no hace falta recargar)
- [ ] Al volver de Detalle al historial de navegación (botón atrás), el estado del botón es el correcto

---

## Componentes nuevos o modificados

| Componente | Cambio |
|---|---|
| `src/hooks/useFavorites.ts` | Asegurar que el estado es reactivo y global (Context o store) para que todos los consumidores se actualicen |
| `src/components/MediaCard.tsx` | Consumir el estado global de favoritos |
| `src/components/media/MediaDetails.tsx` | Ídem |
| `src/components/Navbar.tsx` (o equivalente) | Añadir badge con `favorites.length` |

---

## Notas técnicas

- Si `useFavorites` es un hook local (useState), hay que elevarlo a Context para que MediaCard y MediaDetails compartan el mismo estado sin prop-drilling
- El badge puede ser un `<span>` con posición absoluta sobre el icono de corazón en la nav; usar `favorites.length` directamente del context
- No hay llamadas async en este flujo; todo es síncrono sobre localStorage

---

## Fuera de alcance

- Página "Mis Favoritos" con grid completo
- Sincronización con Trakt (→ US-026)
