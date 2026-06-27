# Feature: Estado vacío contextual con acción guiada

## Historia de usuario

Como usuario de CineTracker que no ve contenido en la pantalla principal,
quiero recibir un mensaje claro que explique por qué no hay resultados y qué puedo hacer,
para no quedarme atascado pensando que la app está rota.

---

## Descripción

Actualmente `HomeEmptyState` muestra siempre el mismo mensaje genérico: "No se encontraron resultados para los filtros seleccionados." Esto no distingue entre las causas posibles del estado vacío:

1. **Sin plataformas configuradas** — el usuario es nuevo y no ha ido a Ajustes
2. **Filtros demasiado restrictivos** — combinación de plataforma + género + tipo sin resultados
3. **Combinación de plataforma + tendencias** — no siempre hay datos disponibles

Cada caso necesita un mensaje diferente y un CTA específico que guíe al usuario hacia la acción correcta.

---

## Criterios de aceptación

### Detección del contexto de vaciado
- [ ] Si `selectedPlatformIds` está vacío, el estado vacío muestra: "No has configurado ninguna plataforma" + botón "Ir a Ajustes" que navega a `/settings`
- [ ] Si hay plataformas pero hay filtros adicionales activos (género, tipo, fuente), muestra: "Ningún resultado con estos filtros" + botón "Limpiar filtros" que resetea `mediaType`, `spanishFilter`, `selectedGenreId` a sus valores por defecto
- [ ] Si no hay filtros adicionales activos pero aun así hay 0 resultados, muestra: "No encontramos contenido disponible ahora. Prueba con otras plataformas." + botón "Cambiar plataformas"

### Diseño del estado vacío
- [ ] Cada variante tiene un icono ilustrativo diferente (ej. `Settings` para sin plataformas, `Filter` para filtros restrictivos)
- [ ] El botón de acción principal usa el componente `<Button>` de shadcn
- [ ] El componente es responsive y se ve bien en móvil y desktop

### Internacionalización
- [ ] Los tres mensajes y sus CTAs están disponibles en español e inglés

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/home/HomeEmptyState.tsx` | Refactorizar para aceptar props `reason: 'no-platforms' \| 'filtered' \| 'no-content'` y renderizar el mensaje y CTA adecuados |
| `src/pages/Home.tsx` | Pasar la razón correcta a `HomeEmptyState` basándose en el estado de `filtersState` |

---

## Notas técnicas

- La razón se calcula en `Home.tsx` antes de renderizar: `if (!selectedPlatformIds.length) reason = 'no-platforms'`; `else if (selectedGenreId || spanishFilter !== 'off' || mediaType !== 'all') reason = 'filtered'`; `else reason = 'no-content'`
- "Limpiar filtros" llama a `updateFilters({ mediaType: 'all', spanishFilter: 'off', selectedGenreId: null, sortBy: 'none' })`
- No requiere nuevas dependencias ni nuevas rutas

---

## Fuera de alcance (v1)

- Sugerencias de contenido alternativo en el estado vacío
- Estado vacío animado o ilustración personalizada
- Diagnóstico detallado de por qué la combinación de plataforma + género no tiene resultados
