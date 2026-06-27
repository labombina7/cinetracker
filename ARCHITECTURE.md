# MediaTracker — Documentación de Implementación

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 18 + TypeScript |
| Bundler | Vite (plugin `@vitejs/plugin-react-swc`) |
| Routing | React Router v6 con **HashRouter** |
| Estilos | Tailwind CSS v3 + shadcn/ui (Radix primitives) |
| Formularios | react-hook-form + Zod |
| Estado global | React Context (`MediaFiltersContext`) |
| APIs externas | TMDB (contenido) + Trakt (watchlist/OAuth) |
| Deploy | Synology NAS (hosting estático) |

> `@tanstack/react-query` está instalado pero **no se usa**. Todo el fetching se hace con hooks propios.

---

## Routing

HashRouter (`/#/path`) por requisito de despliegue — el NAS no soporta server-side routing.

| Ruta | Página |
|---|---|
| `/` | `Index.tsx` → redirige a Home |
| `/home` | `Home.tsx` |
| `/details/:type/:id` | `MediaDetail.tsx` |
| `/search` | `SearchResults.tsx` |
| `/explore` | `Explore.tsx` |
| `/settings` | `Settings.tsx` |
| `/auth/trakt` | `TraktAuth.tsx` |
| `/auth/callback` | `AuthCallback.tsx` |

---

## Estado global

`src/contexts/MediaFiltersContext.tsx` es la única fuente de verdad para los filtros. Se persiste automáticamente en `localStorage['mediaFilters']` e incluye lógica de migración para formas antiguas de datos.

**Contiene:**
- `mediaType`: `'movie' | 'tv' | 'all'`
- `fetchStrategy`: `'trending' | 'discover' | 'new'`
- `selectedGenres: number[]`
- `selectedPlatformIds: number[]`
- `spanishFilter`, `minRating`, `sortBy`, `language`

---

## Pipeline de fetching de medios

```
useHomeMediaFetch
  └── useMediaFetch
        └── useFetchMediaCore / useFetchMedia
              └── useFetchStrategy.fetchMediaByStrategy
                    ├── trending → trendingStrategy → TMDB /trending/*
                    ├── discover → discoverStrategy → TMDB /discover/*
                    └── new     → newStrategy → TMDB /discover/* (orden release_date)
```

El filtro de géneros en `trending` se aplica **client-side** (el endpoint no lo soporta). En `discover` se envía como `with_genres` en la query a TMDB.

Archivos clave:
- `src/hooks/useHomeMediaFetch.ts` — orquestador principal
- `src/hooks/useFetchStrategy.ts` — despacha a la estrategia correcta
- `src/hooks/fetchStrategies/` — implementaciones por estrategia

---

## Sistema de caché (dos capas)

### Capa 1 — In-memory
`src/services/tmdb/apiCache.ts`  
`Map<url, {data, expiresAt}>` · TTL 5 min · se pierde al recargar la página.  
Usado por `cachedFetch()` que envuelve todas las llamadas a TMDB.

### Capa 2 — sessionStorage
`src/hooks/useMediaSession.ts`  
Persiste la última lista de medios + parámetros de fetch dentro de la pestaña del navegador. Se usa para restaurar el scroll y evitar re-fetches al navegar hacia atrás.

---

## API Key de TMDB

`src/config/tmdb.config.ts` exporta `TMDB_CONFIG`, un objeto `const` a nivel de módulo.  
`src/hooks/useApiKey.ts` lo **muta en runtime** via `(TMDB_CONFIG as any).API_KEY = key` para que todos los servicios vean la clave sin necesidad de React Context.

Orden de precedencia:
1. `localStorage['tmdb_api_key']`
2. Variable de entorno `VITE_TMDB_API_KEY`

Si no hay clave, el componente `ApiKeySetup.tsx` intercepta y pide al usuario que la introduzca.

---

## Servicios TMDB

Todos bajo `src/services/tmdb/`:

| Módulo | Responsabilidad |
|---|---|
| `trending/` | Contenido tendencia (real, combinado, nuevas incorporaciones) |
| `discover/` | Descubrir por plataforma, editorial, contenido español |
| `details.ts` | Detalle completo de película/serie (cast, providers, etc.) |
| `search.ts` | Búsqueda por texto |
| `genres.ts` | Lista de géneros |
| `providers.ts` | Plataformas de streaming disponibles en ES |
| `apiCache.ts` | Caché in-memory compartida |

---

## Integración Trakt (OAuth)

Servicios en `src/services/trakt/`.

**Flujo OAuth:**
1. `getTraktAuthUrl()` genera la URL y guarda el `state` en `localStorage['trakt_auth_state']`
2. El usuario es redirigido a Trakt y vuelve a `/#/auth/callback`
3. `AuthCallback.tsx` valida el `state` e intercambia el code por un token via `getAccessToken()`
4. Token almacenado en `localStorage['trakt_token']`

> El refresh automático del token **no está implementado**.

Módulos Trakt: `auth.ts`, `user.ts`, `watchlist.ts`, `search.ts`, `client.ts`

---

## Plataformas de streaming — Dos fuentes de verdad

La lista de plataformas vive en dos lugares sincronizados:

| Dónde | Qué guarda |
|---|---|
| `useProvidersData` | Objetos `Platform[]` completos (`id`, `name`, `logoPath`) |
| `MediaFiltersContext` | Solo `selectedPlatformIds: number[]` |

`useProvidersData` lee de `MediaFiltersContext` en el init. `Settings.tsx` escribe en ambos. La región está hardcodeada a `'ES'` en `useProvidersData.ts`.

---

## localStorage — Todas las claves

| Clave | Contenido |
|---|---|
| `tmdb_api_key` | API key de TMDB |
| `selectedPlatforms` | `Platform[]` JSON |
| `mediaFilters` | `MediaFiltersState` JSON (con migración de formas antiguas) |
| `favorites` | `number[]` de IDs — **bug conocido:** colisiona IDs de películas y series |
| `trakt_token` | Access token de Trakt |
| `trakt_refresh_token` | Refresh token (sin uso activo) |
| `trakt_client_id` | OAuth client ID |
| `trakt_client_secret` | OAuth client secret |
| `trakt_auth_state` | CSRF state, se borra tras el callback |

---

## Estructura de componentes

```
src/
├── pages/           # Vistas completas (una por ruta)
├── components/
│   ├── home/        # Componentes exclusivos de la pantalla principal
│   ├── media/       # Componentes de detalle de un medio
│   ├── explore/     # Secciones editoriales y por plataforma
│   ├── search/      # Resultados de búsqueda
│   ├── trakt/       # UI de conexión/perfil Trakt
│   └── ui/          # shadcn/ui — no editar manualmente
├── hooks/
│   ├── mediaFetch/  # Lógica de fetch descompuesta en módulos
│   ├── fetchStrategies/ # Estrategias por tipo (trending/discover/new)
│   └── home/        # Scroll y fetch inicial de Home
├── services/
│   ├── tmdb/        # Llamadas a TMDB API
│   └── trakt/       # Llamadas a Trakt API
├── contexts/        # MediaFiltersContext
├── types/           # media.ts, tmdb.ts
└── utils/           # Sorting, traducciones
```

---

## Comandos de desarrollo

```bash
npm run dev       # Servidor dev en http://localhost:8084
npm run build     # Build de producción
npm run lint      # ESLint
npm run preview   # Preview del build de producción
```
