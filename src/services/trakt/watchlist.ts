import { TRAKT_API_URL, getTraktHeaders } from './config';
import { authenticatedFetch } from './client';

export type ResolvedWatchlistItem = { id: number; type: 'movie' | 'tv' };
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
      if (typeof tmdbId === 'number') {
        resolved.push({ id: tmdbId, type: 'movie' });
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
      if (typeof tmdbId === 'number') {
        resolved.push({ id: tmdbId, type: 'tv' });
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

    if (!response.ok) return false;

    const data = await response.json();
    return data.deleted?.movies > 0 || data.deleted?.shows > 0 || data.not_found != null;
  } catch {
    return false;
  }
};
