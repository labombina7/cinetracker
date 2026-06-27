# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:8084
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

There are no tests. The testing stack is not set up.

## Architecture

### Routing
The app uses **HashRouter** (`/#/path`), not BrowserRouter. This is intentional — the app is deployed on a Synology NAS where static hosting can't handle server-side routing. Never change this to BrowserRouter.

Routes: `/` (Home), `/details/:type/:id` (MediaDetail), `/search`, `/auth/trakt`, `/auth/callback`, `/settings`.

### API Key propagation (important quirk)
`TMDB_CONFIG` in `src/config/tmdb.config.ts` is a module-level `const` object. `useApiKey.ts` mutates it at runtime via `(TMDB_CONFIG as any).API_KEY = key` so all service functions see the key without needing React context. The key can also come from `VITE_TMDB_API_KEY` env var; localStorage takes precedence.

### Data fetching pipeline
All fetching is done with custom hooks — `@tanstack/react-query` is installed but not used.

```
useHomeMediaFetch
  └── useMediaFetch
        └── useFetchMediaCore / useFetchMedia
              └── useFetchStrategy.fetchMediaByStrategy
                    ├── trending → fetchTrendingStrategy → TMDB /trending/*
                    └── discover → fetchDiscoverStrategy → TMDB /discover/*
```

Genre filter for **trending** is applied client-side (endpoint doesn't support `with_genres`). Genre filter for **discover** is sent as `with_genres` param to TMDB.

### Two-tier cache
1. **In-memory** (`src/services/tmdb/apiCache.ts`) — `Map<url, {data, expiresAt}>`, TTL 5 min, resets on page reload. Used by `cachedFetch()`.
2. **sessionStorage** (`src/hooks/useMediaSession.ts`) — persists the last media list + fetch params within the browser tab session. Used by `useMediaCache`.

### Platform state — two sources of truth
Platform data lives in two places kept in sync:
- `useProvidersData` — holds `Platform[]` objects (with `id`, `name`, `logoPath`)
- `MediaFiltersContext` — holds `selectedPlatformIds: number[]`

`useProvidersData` reads from `MediaFiltersContext` on init; `Settings.tsx` writes to both. The region is hardcoded to `'ES'` (Spain) in `useProvidersData`.

### Global state (MediaFiltersContext)
`src/contexts/MediaFiltersContext.tsx` is the single source of truth for all filter state. It auto-persists to `localStorage` under key `'mediaFilters'`. Contains migration logic for old data shapes (e.g. `combined`→`discover`, old boolean `showSpanishOnly` → `spanishFilter`).

### localStorage keys used
| Key | Contents |
|---|---|
| `tmdb_api_key` | TMDB API key string |
| `selectedPlatforms` | `Platform[]` JSON |
| `mediaFilters` | `MediaFiltersState` JSON |
| `favorites` | `number[]` JSON (IDs only — known bug: collides across movie/TV) |
| `trakt_token` | Trakt access token |
| `trakt_refresh_token` | Trakt refresh token (not currently used for auto-refresh) |
| `trakt_client_id` | Trakt OAuth client ID |
| `trakt_client_secret` | Trakt OAuth client secret |
| `trakt_auth_state` | CSRF state param, deleted after OAuth callback |

### UI components
`src/components/ui/` contains shadcn/ui components — don't edit these manually; use the shadcn CLI if adding new ones. The `@` alias resolves to `src/`.

### Trakt OAuth flow
1. `getTraktAuthUrl()` generates the URL and saves `state` to localStorage
2. User is redirected to Trakt, then back to `/#/auth/callback`
3. `AuthCallback.tsx` validates state and exchanges the code for a token via `getAccessToken()`
4. Token stored in localStorage; no automatic refresh is implemented yet

### Specs and planning
`specs/todo/` contains User Stories (US-NNN format) ready to implement. `specs/done/` has completed ones. `insights/` has audit reports (tech-debt, ux-audit). Check these before implementing new features to avoid duplicating planned work.
