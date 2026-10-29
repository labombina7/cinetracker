import { TRAKT_API_URL, getTraktHeaders, hasClientCredentials, isAuthenticated } from './config';
import { authenticatedFetch } from './client';

export interface TraktRatings {
  community: { rating: number; votes: number } | null;
  user: number | null; // nota del usuario (1-10), si ha puntuado el título
}

type TraktType = 'movie' | 'show';

// Las notas del usuario se piden una vez por sesión y tipo (Trakt devuelve la lista completa)
const userRatingsCache: Partial<Record<TraktType, Promise<Map<number, number>>>> = {};

const fetchUserRatings = (type: TraktType): Promise<Map<number, number>> => {
  if (!userRatingsCache[type]) {
    userRatingsCache[type] = authenticatedFetch(`${TRAKT_API_URL}/sync/ratings/${type}s`, {
      headers: getTraktHeaders(),
      credentials: 'omit'
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Trakt ratings ${res.status}`);
        const items: { rating: number; [key: string]: unknown }[] = await res.json();
        const map = new Map<number, number>();
        for (const item of items) {
          const tmdbId = (item[type] as { ids?: { tmdb?: number } } | undefined)?.ids?.tmdb;
          if (typeof tmdbId === 'number') map.set(tmdbId, item.rating);
        }
        return map;
      })
      .catch((error) => {
        delete userRatingsCache[type];
        throw error;
      });
  }
  return userRatingsCache[type] as Promise<Map<number, number>>;
};

// Devuelve null si Trakt no está configurado o no conoce el título
export const fetchTraktRatings = async (tmdbId: number, mediaType: 'movie' | 'tv'): Promise<TraktRatings | null> => {
  if (!hasClientCredentials()) return null;
  const type: TraktType = mediaType === 'movie' ? 'movie' : 'show';
  const headers = getTraktHeaders(false);

  try {
    const lookup = await fetch(`${TRAKT_API_URL}/search/tmdb/${tmdbId}?type=${type}`, { headers, credentials: 'omit' });
    if (!lookup.ok) return null;
    const matches: { [key: string]: { ids?: { trakt?: number } } }[] = await lookup.json();
    const traktId = matches[0]?.[type]?.ids?.trakt;
    if (!traktId) return null;

    const [community, user] = await Promise.all([
      fetch(`${TRAKT_API_URL}/${type}s/${traktId}/ratings`, { headers, credentials: 'omit' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => (data && data.votes > 0 ? { rating: data.rating, votes: data.votes } : null)),
      isAuthenticated()
        ? fetchUserRatings(type).then((map) => map.get(tmdbId) ?? null).catch(() => null)
        : Promise.resolve(null)
    ]);

    return { community, user };
  } catch (error) {
    console.error('Error fetching Trakt ratings:', error);
    return null;
  }
};
