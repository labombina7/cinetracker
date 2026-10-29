# US-024: Persistencia local de favoritos + aviso sin Trakt

## Historia de usuario

Como usuario sin cuenta Trakt,
quiero que mis favoritos se guarden en el dispositivo y ver un aviso claro de que son locales,
para saber que puedo perderlos si limpio el navegador o cambio de dispositivo.

---

## Descripción

Los favoritos ya se persisten en `localStorage` bajo la clave `favorites`, pero el usuario no sabe que son volátiles. Esta US añade dos cosas:

1. **Garantizar** que el formato de almacenamiento es `{ id, type }[]` (puede depender de US-009 si aún no está hecha).
2. **Avisar** al usuario, de forma no intrusiva, de que sus favoritos son locales y se perderán si no vincula Trakt.

El aviso debe aparecer solo cuando el usuario **añade su primer favorito** y no tiene Trakt configurado. Una vez visto, no vuelve a aparecer (guardamos un flag en localStorage).

---

## Criterios de aceptación

### Persistencia
- [ ] Los favoritos se cargan de `localStorage` al montar la app y están disponibles inmediatamente sin flash de "no favoritos"
- [ ] Cualquier cambio (añadir/quitar) se refleja en `localStorage` de forma síncrona
- [ ] El formato almacenado es `Array<{ id: number; type: 'movie' | 'tv' }>`

### Aviso contextual
- [ ] La primera vez que el usuario añade un favorito y **no** tiene Trakt configurado, aparece un toast/snackbar con el mensaje: _"Tus favoritos se guardan en este dispositivo. Conecta Trakt para no perderlos."_
- [ ] El toast tiene un botón "Conectar Trakt" que lleva a Settings y un botón de cerrar
- [ ] Una vez mostrado, el flag `favorites_warning_seen` se guarda en `localStorage` y el aviso no vuelve a aparecer
- [ ] Si el usuario configura Trakt posteriormente, el aviso no vuelve a mostrarse (el flag persiste)

### Sin regresiones
- [ ] Los usuarios que ya tienen favoritos guardados no pierden sus datos
- [ ] La migración del formato antiguo (`number[]`) sigue funcionando (ver US-009)

---

## Componentes nuevos o modificados

| Componente | Cambio |
|---|---|
| `src/hooks/useFavorites.ts` | Añadir lógica de aviso: comprobar flag, emitir evento/callback al primer favorito sin Trakt |
| `src/components/FavoritesWarningToast.tsx` | Nuevo componente toast con mensaje + botón Trakt |
| `src/App.tsx` o layout raíz | Montar `FavoritesWarningToast` y escuchar el evento de primer favorito |

---

## Notas técnicas

- `localStorage` key para el flag: `favorites_warning_seen` (boolean `"true"`)
- Detectar si Trakt está configurado: comprobar que `localStorage.getItem('trakt_token')` no es null
- El toast puede usar el componente `Toaster` de shadcn/ui (`sonner`) si ya está instalado; si no, un componente propio sencillo

---

## Fuera de alcance

- Sincronización con Trakt (→ US-026)
- Exportación de favoritos a fichero
