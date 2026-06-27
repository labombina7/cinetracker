# Feature: Foco exclusivo de plataforma en Explorar

## Historia de usuario
Como usuario quiero pinchar en una plataforma en Explorar para ver solo su contenido en todos los carruseles sin cambiar mi configuración global de plataformas.

---

## Descripción
Cuando el usuario está en la página Explorar y pulsa sobre uno de los chips de plataforma activa, se activa un "modo foco" que filtra temporalmente todos los carruseles (editoriales y de género) para mostrar únicamente el contenido disponible en esa plataforma. Este foco es local a la sesión de Explorar y no modifica el estado global de `MediaFiltersContext`.

El foco funciona como un toggle: si la plataforma pulsada no tiene foco, se activa el foco exclusivo sobre ella; si ya tiene foco, se desactiva y los carruseles vuelven a mostrar el contenido de todas las plataformas activas del contexto global.

Visualmente, el chip de la plataforma en foco se muestra con un estilo diferenciado (por ejemplo, borde más grueso, brillo mayor o color de fondo distinto) respecto a los chips simplemente activos, para que el usuario sepa de un vistazo qué plataforma está en foco.

Cuando hay un foco activo, todos los fetch de carruseles (tanto editoriales como de género) usan `[focusPlatformId]` como array de plataformas en lugar de `selectedPlatformIds` del contexto global. Al salir de Explorar o navegar a otra ruta, el foco se descarta automáticamente.

---

## Criterios de aceptación

### Estado de foco
- [ ] `focusPlatformId: number | null` es estado local de `Explore.tsx` (no se persiste, no va al contexto global)
- [ ] Pulsar un chip de plataforma sin foco activo establece `focusPlatformId` a su id
- [ ] Pulsar el chip de la plataforma que ya tiene foco resetea `focusPlatformId` a `null`
- [ ] Pulsar un chip de plataforma distinta mientras hay un foco activo cambia el foco a esa nueva plataforma
- [ ] Al navegar fuera de Explorar el foco se pierde (estado local, no persistido)

### Sin efecto en el contexto global
- [ ] `MediaFiltersContext.selectedPlatformIds` NO se modifica al activar o desactivar el foco
- [ ] Si el usuario va a Settings y vuelve, su selección de plataformas global sigue intacta
- [ ] El estado `focusPlatformId` NO se escribe en localStorage

### Propagación a los carruseles
- [ ] Cuando `focusPlatformId !== null`, todos los carruseles de `EditorialSection` y `GenreSection` reciben `[focusPlatformId]` como plataformas activas
- [ ] Cuando `focusPlatformId === null`, todos los carruseles reciben `selectedPlatformIds` del contexto global
- [ ] El cambio de foco provoca un refetch de todos los carruseles visibles
- [ ] Los carruseles que aún no han entrado en el viewport refetcharán con el nuevo foco cuando entren

### Feedback visual
- [ ] Los chips de plataforma en la cabecera de Explorar se muestran con un estilo "activo normal"
- [ ] El chip de la plataforma en foco tiene un estilo diferenciado (ej. `ring-2 ring-white` o `brightness-125`) claramente distinguible del activo normal
- [ ] Si no hay ningún foco activo, todos los chips activos tienen el mismo estilo entre sí

---

## Componentes nuevos o modificados
| Componente | Acción | Descripción |
|---|---|---|
| `src/pages/Explore.tsx` | Modificar | Añade estado local `focusPlatformId`; lo pasa como prop a las secciones de carrusel |
| `src/components/explore/EditorialSection.tsx` | Modificar | Acepta prop `overridePlatformIds?: number[]`; lo usa en el fetch si está presente |
| `src/components/explore/GenreSection.tsx` | Modificar | Acepta prop `overridePlatformIds?: number[]`; lo usa en el fetch si está presente |
| `src/hooks/useEditorialCarousel.ts` | Modificar | Acepta `platformIds` como parámetro en lugar de leerlos siempre del contexto |

---

## Notas técnicas
- El estado `focusPlatformId` vive únicamente en `Explore.tsx` como `useState<number | null>(null)`
- `Explore.tsx` calcula `const activePlatformIds = focusPlatformId !== null ? [focusPlatformId] : selectedPlatformIds` y lo pasa como prop a todas las secciones
- Los hooks de fetch de los carruseles deben incluir `platformIds` en su array de dependencias para que el refetch sea automático al cambiar el foco
- Para el estilo del chip en foco se puede añadir una clase condicional: `focusPlatformId === platform.id ? 'ring-2 ring-white' : ''`
- No es necesario que el foco se propague al componente `FilterBar`; los filtros Sort / tipo / idioma siguen funcionando con normalidad cuando hay foco de plataforma

---

## Fuera de alcance (v1)
- Foco simultáneo en más de una plataforma
- Persistir el foco entre visitas a Explorar
- Animación de transición cuando se activa o desactiva el foco
- Aplicar el foco en la página List (solo aplica en Explorar)
