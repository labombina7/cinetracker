
import { TRAKT_API_URL, getClientId, getTraktHeaders } from './config';

// Add media to watchlist
export const addToWatchlist = async (mediaId: number, mediaType: 'movie' | 'tv', title: string, releaseDate?: string): Promise<boolean> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) {
    console.log('No Trakt token found - skipping watchlist addition');
    return false;
  }

  try {
    const clientId = getClientId();
    if (!clientId) {
      throw new Error('No se ha configurado un Client ID para Trakt.tv');
    }
    
    // Convert TMDB media type to Trakt media type
    const traktType = mediaType === 'movie' ? 'movies' : 'shows';
    
    // Format the body according to Trakt API requirements
    const body: any = {
      [traktType]: [
        {
          title,
          ids: {
            tmdb: mediaId
          }
        }
      ]
    };

    // If we have a year, add it
    if (releaseDate && releaseDate.length >= 4) {
      body[traktType][0].year = parseInt(releaseDate.substring(0, 4));
    }

    console.log(`Adding to Trakt watchlist:`, body);

    const response = await fetch(`${TRAKT_API_URL}/sync/watchlist`, {
      method: 'POST',
      headers: getTraktHeaders(),
      body: JSON.stringify(body),
      credentials: 'omit'  // Añadido para evitar envío automático de cookies
    });

    if (!response.ok) {
      console.error('Error response from Trakt.tv:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error data:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Trakt watchlist response:', data);
    return data.added && (data.added.movies > 0 || data.added.shows > 0);
  } catch (error) {
    console.error('Error adding to Trakt watchlist:', error);
    return false;
  }
};
