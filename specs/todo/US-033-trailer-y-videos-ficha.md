# Feature: Tráiler y vídeos en la ficha

## Historia de usuario

Como usuario que está decidiendo si ver un título,
quiero ver su tráiler sin salir de la app,
para hacerme una idea rápida del tono y decidir en segundos.

---

## Descripción

El tráiler es el dato que más ayuda a decidir y ahora mismo no está en la ficha. TMDB ofrece vídeos (tráileres, teasers, clips) alojados casi siempre en YouTube.

La feature añade un botón "Ver tráiler" en la cabecera de la ficha que abre un modal con el reproductor embebido, y una sección "Vídeos" con el resto (teasers, clips, featurettes) en un carrusel de miniaturas. En series, el tráiler mostrado es el de la temporada más reciente si existe.

Se prioriza el vídeo en el idioma de la app (español), con fallback al inglés.

---

## Criterios de aceptación

### Botón de tráiler
- [ ] Si existe al menos un tráiler, aparece un botón "Ver tráiler" junto al botón de favorito
- [ ] Al pulsarlo se abre un `Dialog` con el reproductor de YouTube a 16:9, en reproducción automática
- [ ] Al cerrar el modal, el vídeo se detiene (se desmonta el iframe)
- [ ] Si no hay tráiler, el botón no se muestra

### Selección del vídeo
- [ ] Prioridad: tráiler oficial en español > tráiler en español > tráiler oficial en inglés > teaser
- [ ] En series se intenta primero el tráiler de la última temporada (`/tv/:id/season/:n/videos`)

### Sección Vídeos
- [ ] Carrusel de miniaturas (`img.youtube.com/vi/{key}/mqdefault.jpg`) con tipo y duración si se conoce
- [ ] Solo se muestra si hay más de un vídeo

### Privacidad y rendimiento
- [ ] Se usa `youtube-nocookie.com` para el embed
- [ ] El iframe no se carga hasta que el usuario pulsa

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/media/TrailerButton.tsx` | Botón + modal con reproductor |
| `src/components/media/MediaVideos.tsx` | Carrusel de vídeos |
| `src/services/tmdb/details.ts` | Añadir `videos` a `append_to_response` con `include_video_language=es,en` |
| `src/utils/pickTrailer.ts` | Lógica de priorización |

---

## Notas técnicas

- `append_to_response=watch/providers,videos` y `include_video_language=es,en,null` en la misma llamada que ya existe: no añade peticiones
- Filtrar `site === 'YouTube'`
- Revisar si la CSP o el `manifest.json` de la PWA bloquean iframes de YouTube

---

## Fuera de alcance (v1)

- Reproducción del tráiler en el hero de Explorar
- Vídeos de Vimeo u otras fuentes
