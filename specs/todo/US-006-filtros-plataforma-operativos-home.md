# Feature: Filtros de plataforma operativos en Home

## Historia de usuario

Como usuario de CineTracker que tiene plataformas configuradas,
quiero ver chips de mis plataformas activas en la pantalla principal y poder activarlas/desactivarlas directamente,
para filtrar el contenido por plataforma sin tener que ir a Ajustes cada vez.

---

## Descripción

Actualmente el componente `PlatformFilters` se renderiza en Home pero la función `handlePlatformChange` es un no-op que solo ejecuta un `console.log`. El usuario ve los chips de plataforma pero al pulsarlos no pasa nada. Esto es confuso y da la sensación de que la app está rota.

Esta US conecta el filtro de plataforma de Home directamente al contexto `MediaFiltersContext`, de modo que el usuario pueda alternar plataformas desde la pantalla principal. Si no hay plataformas configuradas aún (array vacío), se muestra un CTA que lleva a Ajustes.

---

## Criterios de aceptación

### Chips de plataforma funcionales
- [ ] Los chips de plataforma en Home responden al click: activan/desactivan la plataforma en el contexto global
- [ ] Al activar o desactivar una plataforma, el feed de contenido se refresca automáticamente con el nuevo filtro
- [ ] Un chip activo tiene estilo visual diferenciado (fondo primario) igual que el resto de filtros

### Plataformas mostradas
- [ ] Solo se muestran las plataformas que el usuario tiene configuradas en Ajustes
- [ ] Si el usuario no tiene ninguna plataforma configurada, los chips no se muestran y en su lugar aparece el texto: "Sin plataformas configuradas — [Ir a Ajustes]" con link a `/settings`
- [ ] Si hay más de 6 plataformas, se muestran solo las primeras 6 con un botón "+ N más" que abre un popover con el resto

### Sincronización con Ajustes
- [ ] Los cambios hechos desde Ajustes (añadir/quitar plataformas del perfil) se reflejan en los chips de Home en la siguiente visita
- [ ] Los cambios de estado activo/inactivo hechos desde Home NO se persisten en Ajustes (son filtros de sesión, no configuración permanente)

### Logos de plataforma
- [ ] Los chips muestran el logo real de la plataforma usando `logoPath` del campo `Platform.logoPath` (imagen TMDB) cuando está disponible
- [ ] Si `logoPath` no está disponible, se usa el icono genérico actual como fallback

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/pages/Home.tsx` | Conectar `handlePlatformChange` al contexto: `setSelectedPlatformIds` con toggle de IDs |
| `src/components/home/PlatformFilters.tsx` | Usar `logoPath` de `Platform` para mostrar logos TMDB; añadir CTA cuando no hay plataformas |
| `src/contexts/MediaFiltersContext.tsx` | Ya tiene `setSelectedPlatformIds`; verificar que el toggle funciona como se espera |

---

## Notas técnicas

- `Platform.logoPath` contiene la ruta relativa del logo (ej. `/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg`). La URL completa se construye con `TMDB_CONFIG.IMAGE_BASE_URL + '/w45' + logoPath`
- El toggle de plataforma en Home debe hacer un XOR sobre el array actual de `selectedPlatformIds`: si el ID está → quitarlo, si no está → añadirlo
- Los chips de plataforma deben aparecer debajo de la fila de filtros actuales y encima de los chips de género (US-001)

---

## Fuera de alcance (v1)

- Reordenación de plataformas por el usuario
- Plataformas sugeridas basadas en el historial
- Persistencia del estado activo/inactivo de plataformas en sesión
