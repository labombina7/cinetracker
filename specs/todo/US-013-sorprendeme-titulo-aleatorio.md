# Feature: "Sorpréndeme" — Sugerencia aleatoria con los filtros activos

## Historia de usuario

Como usuario de CineTracker que no sabe qué ver esta noche,
quiero pulsar un botón que me sugiera un título aleatorio entre el contenido disponible con mis filtros actuales,
para tomar una decisión sin tener que hacer scroll durante minutos.

---

## Descripción

El "síndrome del scroll infinito" es uno de los problemas más comunes en apps de contenido: el usuario tiene plataformas, filtros y géneros configurados pero no sabe qué elegir. Un botón "Sorpréndeme" (o "🎲 Pick one") resuelve exactamente este bloqueo de decisión.

Al pulsar el botón, la app selecciona aleatoriamente uno de los títulos del pool actual (los resultados del fetch con los filtros activos) y navega directamente a su página de detalle. Si el pool aún no se ha cargado completamente, usa los items ya disponibles en `mediaList`.

El botón vive en la barra de filtros de Home, junto a los controles existentes, y es lo suficientemente discreto para no competir con la navegación principal pero visible para usuarios que lo necesiten.

---

## Criterios de aceptación

### Botón "Sorpréndeme"
- [ ] Un botón con icono de dado (`Dice5` de Lucide) y texto "Sorpréndeme" aparece en la barra de filtros de Home
- [ ] En móvil, el botón muestra solo el icono con `aria-label="Sorpréndeme"`
- [ ] Al pulsar, selecciona un item aleatorio de `mediaList` (los resultados actualmente cargados) y navega a `/media/:type/:id`
- [ ] Si `mediaList` está vacío o cargando, el botón está desactivado con un tooltip "Cargando contenido..."

### Variedad garantizada
- [ ] Si el usuario pulsa el botón varias veces seguidas, no repite el mismo item hasta haber pasado por todos los disponibles (Fisher-Yates shuffle en memoria de sesión)
- [ ] Al cambiar los filtros, el historial de items ya sugeridos se resetea

### Feedback visual
- [ ] Al pulsar el botón, hay una animación breve del icono de dado (rotación de 360° en 300ms) antes de navegar
- [ ] Si no hay resultados disponibles, el botón muestra un tooltip explicativo

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/home/SurpriseMeButton.tsx` | Nuevo botón con lógica de selección aleatoria |
| `src/pages/Home.tsx` | Añadir `<SurpriseMeButton mediaList={mediaList} />` en la barra de filtros |

---

## Notas técnicas

- Algoritmo: `const randomIndex = Math.floor(Math.random() * mediaList.length); navigate(\`/media/${item.type}/${item.id}\`)`
- El histórico de sugerencias puede ser un `useRef<Set<number>>` que se resetea cuando cambian los filtros
- La animación del dado puede ser una clase CSS `@keyframes spin-once` de 300ms aplicada al icono en el click

---

## Fuera de alcance (v1)

- Algoritmo de recomendación basado en favoritos o historial de visionado
- "No me interesa esto" para excluir el item actual y sugerir otro
- Integración con Trakt para excluir títulos ya vistos
