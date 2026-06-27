# Feature: Botón de regreso en móvil en MediaDetail

## Historia de usuario

Como usuario de CineTracker en móvil que ha navegado al detalle de un título,
quiero ver un botón de regreso visible en pantalla,
para poder volver al listado sin depender únicamente del gesto del sistema operativo.

---

## Descripción

Actualmente `MediaDetailHeader.tsx` retorna `null` en móvil (`if (isMobile) return null`), eliminando el único botón de regreso de la app en la vista de detalle. Los usuarios de iOS y Android quedan atrapados dependiendo del swipe-back del sistema o del botón hardware, lo que es un patrón antinatural para una PWA.

La solución es añadir una barra superior sticky en móvil con solo el botón de regreso (flecha izquierda), sin el backdrop decorativo que sí se muestra en desktop. En desktop el comportamiento actual no cambia.

---

## Criterios de aceptación

### Botón de regreso en móvil
- [ ] En viewports móvil (`isMobile === true`), se muestra una barra superior con un botón de regreso (icono `ArrowLeft`)
- [ ] El botón llama a `navigate(-1)` igual que el botón de desktop
- [ ] La barra es sticky y permanece visible al hacer scroll
- [ ] La barra tiene fondo semitransparente con blur para no ocultar el contenido

### Desktop sin cambios
- [ ] En desktop, el comportamiento y apariencia actuales del `MediaDetailHeader` no cambian
- [ ] El botón de regreso de desktop sigue mostrándose sobre el backdrop

### Accesibilidad
- [ ] El botón tiene `aria-label="Volver"` (ES) / `"Go back"` (EN) según el idioma activo
- [ ] El botón es alcanzable con teclado (Tab + Enter)

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/media/MediaDetailHeader.tsx` | Eliminar el `return null` en móvil. En su lugar, renderizar una barra sticky con solo el botón back cuando `isMobile === true` |

---

## Notas técnicas

- El hook `useIsMobile()` ya está disponible en `src/hooks/use-mobile.tsx`
- La barra mobile puede ser un `div` con `className="sticky top-0 z-20 flex items-center p-2 bg-background/80 backdrop-blur-sm"`
- No requiere nuevas dependencias

---

## Fuera de alcance (v1)

- Breadcrumb de navegación completo
- Historial de navegación en la barra
- Animación de transición al navegar atrás
