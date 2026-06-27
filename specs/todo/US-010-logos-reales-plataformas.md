# Feature: Logos reales de plataformas en filtros

## Historia de usuario

Como usuario de CineTracker que filtra por plataforma de streaming,
quiero ver los logos oficiales de Netflix, Disney+, Max y demás servicios en los chips de filtro,
para identificar de un vistazo mis plataformas sin leer el texto.

---

## Descripción

Actualmente `PlatformFilters` usa iconos genéricos de Lucide (Play, Video, Monitor, Apple) para representar cada plataforma. Estos iconos no son reconocibles como marcas y en móvil, donde el texto está oculto, hacen que los chips sean prácticamente indistinguibles entre sí.

TMDB ya proporciona las rutas de los logos oficiales de cada proveedor en el campo `logo_path` de las respuestas de `/watch/providers`. Este campo ya se mapea al tipo `Platform.logoPath` en el código. Solo falta renderizarlo correctamente.

---

## Criterios de aceptación

### Logos en los chips de plataforma
- [ ] Cuando `platform.logoPath` tiene valor, el chip muestra la imagen del logo en lugar del icono genérico de Lucide
- [ ] El logo tiene dimensiones fijas de 20×20px (chips de filtro) o 24×24px (botones más grandes)
- [ ] El logo tiene `border-radius` redondeado consistente con el estilo de la app
- [ ] La URL del logo se construye como `TMDB_CONFIG.IMAGE_BASE_URL + '/w45' + platform.logoPath`

### Fallback cuando no hay logo
- [ ] Si `platform.logoPath` está vacío o la imagen falla al cargar (`onError`), se muestra el icono de Lucide actual como fallback
- [ ] No se muestra un icono roto o un espacio vacío

### Mobile: nombre visible junto al logo
- [ ] En móvil, cuando el logo está disponible, se muestra el logo + un nombre truncado (máx. 8 caracteres) para que el chip sea identificable
- [ ] La opción actual de ocultar el nombre en móvil se reemplaza por un nombre abreviado

### Accesibilidad
- [ ] Las imágenes de logo tienen `alt={platform.name}` para lectores de pantalla

---

## Componentes nuevos o modificados

| Componente | Descripción |
|---|---|
| `src/components/home/PlatformFilters.tsx` | Reemplazar `getIconForPlatform()` por renderizado condicional: imagen si hay `logoPath`, icono Lucide si no |

---

## Notas técnicas

- URL del logo de w45: `${TMDB_CONFIG.IMAGE_BASE_URL}/w45${platform.logoPath}` — tamaño óptimo para chips pequeños
- El campo `logoPath` ya existe en el tipo `Platform` en `src/types/media.ts` y se rellena en `src/services/tmdb/providers.ts`
- Verificar que `fetchProvidersList` mapea correctamente `logo_path` → `logoPath` en todos los paths de código
- Usar `<img loading="lazy" decoding="async">` para las imágenes de logo

---

## Fuera de alcance (v1)

- Logos de plataformas con fondo blanco / modo oscuro (TMDB solo provee una versión)
- Cache persistente de logos (los iconos de TMDB ya se cachean por el browser con headers correctos)
- Selector de plataformas con búsqueda por texto
