
import { TRAKT_API_URL, getClientId, getTraktHeaders } from './config';
import { authenticatedFetch } from './client';

export const addToWatchlist = async (mediaId: number, mediaType: 'movie' | 'tv', title: string, releaseDate?: string): Promise<boolean> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) {
    return false;
  }

  try {
    const clientId = getClientId();
    if (!clientId) {
      throw new Error('No se ha configurado un Client ID para Trakt.tv');
    }

    const traktType = mediaType === 'movie' ? 'movies' : 'shows';

    const body: Record<string, unknown> = {
      [traktType]: [
        {
          title,
          ids: { tmdb: mediaId },
        },
      ],
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

    if (!response.ok) {
      console.error('Error response from Trakt.tv:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    return data.added && (data.added.movies > 0 || data.added.shows > 0);
  } catch (error) {
    console.error('Error adding to Trakt watchlist:', error);
    return false;
  }
};
