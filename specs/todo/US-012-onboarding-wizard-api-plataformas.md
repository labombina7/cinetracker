# Feature: Onboarding wizard de 2 pasos (API key + plataformas)

## Historia de usuario

Como usuario nuevo de CineTracker que acaba de abrir la app por primera vez,
quiero ser guiado paso a paso para configurar mi API key y mis plataformas de streaming,
para empezar a ver contenido personalizado sin tener que descubrir dónde están los ajustes.

---

## Descripción

El flujo de configuración actual es opaco: el usuario ve un formulario de API key sin contexto, y si no sabe que existe la página de Ajustes, nunca configura sus plataformas. El resultado es que el contenido de la pantalla principal no está filtrado y parece una app genérica, no personalizada.

Este wizard de 2 pasos reemplaza el componente `ApiKeySetup` actual con una experiencia progresiva:

- **Paso 1:** Configurar la API key de TMDB (como ahora, pero con mejor copy y un indicador de progreso)
- **Paso 2:** Elegir plataformas de streaming (versión inline del selector de Ajustes)

Al completar el paso 2, el usuario llega a Home ya con su configuración activa y ve contenido de sus plataformas de inmediato.

---

## Criterios de aceptación

### Indicador de progreso
- [ ] Un stepper visual ("Paso 1 de 2 · Paso 2 de 2") aparece en la parte superior del wizard
- [ ] El paso actual está destacado; el paso completado muestra un check

### Paso 1 — API key TMDB
- [ ] El copy explica brevemente el valor de la app: "CineTracker necesita una API key gratuita de TMDB para acceder al catálogo de películas y series"
- [ ] Incluye un enlace directo a la página de creación de API key de TMDB (`themoviedb.org/settings/api`)
- [ ] Incluye instrucciones en 3 pasos: "1. Crea una cuenta gratuita → 2. Ve a Configuración → API → 3. Copia la API Key (v3)"
- [ ] El botón "Continuar" solo está activo si la key tiene al menos 20 caracteres
- [ ] Tras guardar la key, avanza automáticamente al paso 2

### Paso 2 — Selección de plataformas
- [ ] Muestra el mismo grid de checkboxes que la página de Ajustes actual
- [ ] Tiene los mismos controles de "Seleccionar todas" / "Deseleccionar todas"
- [ ] El botón "Empezar" guarda las plataformas elegidas y navega a Home
- [ ] El usuario puede pulsar "Omitir por ahora" para llegar a Home sin plataformas (mostrará el estado vacío contextual de US-007)

### Flujo de regreso al wizard
- [ ] Si el usuario ya tiene API key configurada y accede a la app, el wizard NO se muestra (va directamente a Home)
- [ ] Si el usuario borra la API key desde Ajustes, el wizard vuelve a aparecer

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/OnboardingWizard.tsx` | Nuevo componente wizard con stepper, paso 1 y paso 2 |
| `src/components/onboarding/OnboardingStep1ApiKey.tsx` | Formulario de API key con copy mejorado e instrucciones |
| `src/components/onboarding/OnboardingStep2Platforms.tsx` | Selector de plataformas (reutiliza la lógica de `Settings.tsx`) |
| `src/pages/Home.tsx` | Renderizar `OnboardingWizard` en lugar de `ApiKeySetup` cuando `!isConfigured` |
| `src/components/ApiKeySetup.tsx` | Deprecar o mantener como componente standalone para uso interno |

---

## Notas técnicas

- El estado del wizard (`step: 1 | 2`) puede ser local (useState) sin necesidad de persistencia
- `useProvidersData` ya carga las plataformas disponibles; reutilizar directamente en el paso 2
- La transición entre pasos puede usar una animación CSS simple de fade o slide
- No requiere nuevas dependencias

---

## Fuera de alcance (v1)

- Paso 3 de conexión con Trakt en el wizard inicial
- Personalización de idioma durante el onboarding
- Onboarding con tour interactivo de las features de la app
- Sincronización de plataformas con la cuenta de Trakt
