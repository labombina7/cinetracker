# Feature: Accesibilidad — aria-labels en botones icon-only

## Historia de usuario

Como usuario de CineTracker que usa un lector de pantalla o navega por teclado,
quiero que todos los botones sin texto visible tengan una descripción accesible,
para entender qué hace cada botón sin necesidad de ver la pantalla.

---

## Descripción

Varios botones críticos de la app son icon-only (solo muestran un icono SVG) sin ningún atributo `aria-label` ni texto alternativo. Esto los hace completamente opacos para lectores de pantalla (NVDA, VoiceOver) y dificulta la navegación por teclado. Los afectados incluyen el botón de favorito en las cards, el botón de regreso en el detalle, y los dropdowns de idioma y ordenación.

Esta US es una intervención de calidad puntual y de bajo riesgo: añadir `aria-label` descriptivos a los elementos identificados, sin cambios estructurales.

---

## Criterios de aceptación

### FavoriteButton en MediaCard
- [ ] El `<button>` de `MediaCard.tsx` tiene `aria-label` dinámico: `"Añadir {title} a favoritos"` / `"Quitar {title} de favoritos"` según el estado
- [ ] El aria-label se actualiza cuando cambia el estado de favorito

### Botón de regreso en MediaDetailHeader
- [ ] El Button de `MediaDetailHeader.tsx` tiene `aria-label="Volver"` (ES) / `"Go back"` (EN)

### Dropdowns de filtros en MediaFilters
- [ ] El botón de idioma tiene `aria-label="Filtro de idioma"` (ES) / `"Language filter"` (EN)
- [ ] El botón de ordenación tiene `aria-label="Ordenar resultados"` (ES) / `"Sort results"` (EN)
- [ ] Ambos botones ya tienen `title`; el `aria-label` toma precedencia sobre `title` en lectores de pantalla

### FavoriteButton en MediaDetails
- [ ] El botón de favorito en la vista de detalle también incluye el título en su aria-label

### Imágenes en MediaCard
- [ ] Los posters tienen `alt={media.title}` (ya existe — verificar que es correcto)
- [ ] Las imágenes de actores en MediaCastCarousel tienen `alt={\`Foto de ${actor.name} como ${actor.character}\`}`

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/MediaCard.tsx` | Añadir `aria-label` dinámico al botón de favorito |
| `src/components/media/MediaDetailHeader.tsx` | Añadir `aria-label="Volver"` al Button |
| `src/components/home/MediaFilters.tsx` | Añadir `aria-label` a los botones de idioma y sort |
| `src/components/media/MediaCastCarousel.tsx` | Actualizar `alt` de imágenes de actores |
| `src/components/media/FavoriteButton.tsx` | Añadir `aria-label` al Button (ambas variantes icon y full) |

---

## Notas técnicas

- Los `aria-label` deben adaptarse al idioma activo (`useLanguage()`) para los textos estáticos
- Para el FavoriteButton de MediaCard, el `aria-label` recibe `media.title` como parte del texto para identificar el item concreto
- Cambios todos son aditivos (solo añaden atributos), riesgo de regresión mínimo

---

## Fuera de alcance (v1)

- Auditoría WCAG completa (contraste, focus visible, roles ARIA en componentes complejos)
- Soporte de navegación por teclado en el carrusel de cast
- Tests automatizados de accesibilidad con axe-core
