# CineTracker

Descubre y sigue tus películas y series favoritas. Integra TMDB para explorar contenido y Trakt.tv para sincronizar tu watchlist personal.

## Características

- Exploración de películas y series por plataforma de streaming (Netflix, Disney+, HBO Max, Movistar+...)
- Búsqueda de contenido vía TMDB
- Detalle completo: reparto, géneros, proveedores de streaming por región
- Favoritos locales
- Integración con Trakt.tv (OAuth2) para sincronizar tu historial y watchlist
- Filtros por idioma y tipo de contenido
- Diseño responsive

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query) para fetching y caché
- [React Router v6](https://reactrouter.com/)

## Requisitos

- Node.js 18+
- API Key de [TMDB](https://www.themoviedb.org/settings/api) (gratuita)
- Credenciales de app en [Trakt.tv](https://trakt.tv/oauth/applications) (opcional, para watchlist)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/xava73/cinetracker.git
cd cinetracker

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y añade tu VITE_TMDB_API_KEY

# 4. Arrancar en desarrollo
npm run dev
```

La app estará disponible en `http://localhost:8080`

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_TMDB_API_KEY` | API Key de TMDB (obligatoria) |

Las credenciales de Trakt (Client ID y Client Secret) se configuran directamente en la UI de Settings de la app y se guardan en `localStorage`.

## Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # ESLint
```

## Despliegue en NAS Synology

Ver [docs/deploy-synology.md](docs/deploy-synology.md) para instrucciones completas de despliegue con Docker + Apache + proxy inverso en Synology DSM.

## Licencia

MIT
