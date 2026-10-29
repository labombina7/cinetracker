import { TRAKT_API_URL, getTraktHeaders } from './config';
import { authenticatedFetch } from './client';

export type ResolvedWatchlistItem = { id: number; type: 'movie' | 'tv'; title: string; year?: number };
export type UnresolvedWatchlistItem = { imdbId: string; type: 'movie' | 'tv' };
export type WatchlistResult = {
  resolved: ResolvedWatchlistItem[];
  unresolved: UnresolvedWatchlistItem[];
};

export const getWatchlist = async (): Promise<WatchlistResult> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) return { resolved: [], unresolved: [] };

  const headers = getTraktHeaders();

  const [moviesRes, showsRes] = await Promise.all([
    authenticatedFetch(`${TRAKT_API_URL}/users/me/watchlist/movies`, { headers, credentials: 'omit' }),
    authenticatedFetch(`${TRAKT_API_URL}/users/me/watchlist/shows`, { headers, credentials: 'omit' }),
  ]);

  const resolved: ResolvedWatchlistItem[] = [];
  const unresolved: UnresolvedWatchlistItem[] = [];

  if (moviesRes.ok) {
    const movies = await moviesRes.json();
    for (const entry of movies) {
      const tmdbId = entry?.movie?.ids?.tmdb;
      const imdbId = entry?.movie?.ids?.imdb;
      const title = entry?.movie?.title ?? '';
      const year = entry?.movie?.year ?? undefined;
      if (typeof tmdbId === 'number') {
        resolved.push({ id: tmdbId, type: 'movie', title, year });
      } else if (typeof imdbId === 'string' && imdbId) {
        unresolved.push({ imdbId, type: 'movie' });
      }
    }
  }

  if (showsRes.ok) {
    const shows = await showsRes.json();
    for (const entry of shows) {
      const tmdbId = entry?.show?.ids?.tmdb;
      const imdbId = entry?.show?.ids?.imdb;
      const title = entry?.show?.title ?? '';
      const year = entry?.show?.year ?? undefined;
      if (typeof tmdbId === 'number') {
        resolved.push({ id: tmdbId, type: 'tv', title, year });
      } else if (typeof imdbId === 'string' && imdbId) {
        unresolved.push({ imdbId, type: 'tv' });
      }
    }
  }

  return { resolved, unresolved };
};

export const addToWatchlist = async (
  mediaId: number,
  mediaType: 'movie' | 'tv',
  title: string,
  releaseDate?: string
): Promise<boolean> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) return false;

  try {
    const traktType = mediaType === 'movie' ? 'movies' : 'shows';
    const body: Record<string, unknown> = {
      [traktType]: [{ title, ids: { tmdb: mediaId } }],
    };

    if (releaseDate && releaseDate.length >= 4) {
      (body[traktType] as Record<string, unknown>[])[0].year = parseInt(releaseDate.substring(0, 4));
    }

    const response = await authenticatedFetch(`${TRAKT_API_URL}/sync/watchlist`, {
      method: 'POST',
      headers: getTraktHeaders(),
      body: JSON.stringify(body),
      credentials: 'omit',
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.added && (data.added.movies > 0 || data.added.shows > 0);
  } catch {
    return false;
  }
};

// Sube varios ítems en una sola petición: Trakt limita las escrituras a 1 por segundo
export const addManyToWatchlist = async (
  items: { id: number; type: 'movie' | 'tv'; title: string; year?: number }[]
): Promise<number> => {
  const token = localStorage.getItem('trakt_token');
  if (!token || items.length === 0) return 0;

  const toEntry = (item: { id: number; title: string; year?: number }) => ({
    title: item.title,
    ...(item.year ? { year: item.year } : {}),
    ids: { tmdb: item.id },
  });

  try {
    const response = await authenticatedFetch(`${TRAKT_API_URL}/sync/watchlist`, {
      method: 'POST',
      headers: getTraktHeaders(),
      body: JSON.stringify({
        movies: items.filter((i) => i.type === 'movie').map(toEntry),
        shows: items.filter((i) => i.type === 'tv').map(toEntry),
      }),
      credentials: 'omit',
    });

    if (!response.ok) {
      console.error('Trakt watchlist bulk add failed:', response.status, await response.text());
      return 0;
    }

    const data = await response.json();
    console.log('Trakt watchlist bulk add:', JSON.stringify(data));
    return (data.added?.movies ?? 0) + (data.added?.shows ?? 0);
  } catch (error) {
    console.error('Trakt watchlist bulk add error:', error);
    return 0;
  }
};

export const removeFromWatchlist = async (mediaId: number, mediaType: 'movie' | 'tv'): Promise<boolean> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) return false;

  try {
    const traktType = mediaType === 'movie' ? 'movies' : 'shows';
    const body = { [traktType]: [{ ids: { tmdb: mediaId } }] };

    const response = await authenticatedFetch(`${TRAKT_API_URL}/sync/watchlist/remove`, {
      method: 'POST',
      headers: getTraktHeaders(),
      body: JSON.stringify(body),
      credentials: 'omit',
    });

    if (!response.ok) {
      console.error('Trakt watchlist remove failed:', response.status, await response.text());
      return false;
    }

    // Trakt siempre devuelve not_found (aunque vacío): solo cuenta como borrado si deleted > 0
    const data = await response.json();
    const deleted = (data.deleted?.movies ?? 0) + (data.deleted?.shows ?? 0);
    if (deleted === 0) {
      console.warn('Trakt watchlist remove deleted nothing:', JSON.stringify(data));
    }
    return deleted > 0;
  } catch {
    return false;
  }
};
