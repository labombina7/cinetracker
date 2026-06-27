# US-019 — Tema oscuro permanente (dark mode nativo)

## Historia de usuario

Como usuario de CineTracker que navega por una app con fondos cinematográficos,
quiero que toda la interfaz use un tema oscuro consistente,
para que los elementos UI (header, buscador, tarjetas, chips) no rompan la atmósfera visual generada por el backdrop dinámico.

---

## Descripción

La app tiene un backdrop dinámico oscuro en la pantalla principal pero los tokens de color CSS (shadcn/ui) usan fondo blanco por defecto. Esto provoca un choque visual: header blanco, buscador blanco y tarjetas blancas sobre un fondo cinematográfico oscuro.

La solución es cambiar los valores de `:root` en `index.css` para que coincidan con los valores del `.dark` existente, convirtiendo el tema oscuro en el único tema de la app. Se eliminan las variables redundantes de `.dark` ya que pasan a ser las de `:root`.

Afecta a:
- `src/index.css` — tokens CSS base (background, card, secondary, border…)
- `src/components/Navbar.tsx` — header transparente/blurred sobre backdrop
- `src/components/SearchBar.tsx` — buscador con fondo glass oscuro
- `src/components/home/GenreChips.tsx` — chips inactivos con fondo oscuro
- `src/components/home/MediaFilters.tsx` — contenedor de filtros
- `src/components/MediaCard.tsx` — tarjetas con borde sutil

---

## Criterios de aceptación

### Tokens de color

- [ ] `:root` en `index.css` usa los valores del modo oscuro (azul noche `222.2 84% 4.9%` como background)
- [ ] El bloque `.dark` se elimina o queda vacío (los valores ya son los definitivos)
- [ ] El texto sobre fondos oscuros es legible (contraste WCAG AA mínimo)

### Navbar

- [ ] El header es transparente con `backdrop-blur` sobre el backdrop
- [ ] El logo y los botones son blancos / foreground claro
- [ ] En páginas sin backdrop (settings, búsqueda) el header mantiene un fondo oscuro semi-opaco

### Buscador

- [ ] El `Input` del buscador tiene fondo oscuro semi-transparente (`bg-white/10` o similar)
- [ ] El placeholder y el texto son legibles sobre fondo oscuro
- [ ] El icono de búsqueda es visible

### Filtros y chips

- [ ] El contenedor `MediaFilters` usa `bg-white/5 backdrop-blur` en lugar de `bg-background/60`
- [ ] Los chips inactivos de género tienen fondo `bg-white/10 text-white/80`
- [ ] El chip activo sigue siendo `bg-yellow-400 text-black`
- [ ] Los botones de tipo (All / Movie / TV) y los iconos de idioma/orden son blancos por defecto, amarillos cuando están activos

### Tarjetas

- [ ] Las `MediaCard` tienen `bg-card` que ahora es azul noche (viene del token)
- [ ] Se añade `border border-white/10` para dar definición sin contraste brusco
- [ ] El texto del título y los badges de género son legibles

### Regresiones a verificar

- [ ] La página de Settings no pierde legibilidad
- [ ] La página de búsqueda (SearchResults) mantiene la coherencia visual
- [ ] Los popovers / dropdowns de shadcn siguen siendo visibles y legibles
- [ ] Los skeletons de carga contrastan con el fondo oscuro

---

## Notas técnicas

- No se añade toggle de tema claro/oscuro. El tema oscuro es permanente para v1.
- `App.css` tiene estilos de scaffolding de Vite que no afectan a la app real (`.logo`, `#root`) — se pueden dejar tal cual.
- Los componentes `ui/` de shadcn leen los tokens CSS, por lo que con solo cambiar `:root` la mayoría se adaptan sin tocar JSX.
