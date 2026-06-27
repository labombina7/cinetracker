
import { TRAKT_API_URL, getTraktHeaders } from './config';
import { authenticatedFetch } from './client';

export interface TraktUser {
  username: string;
  name?: string;
  location?: string;
  movies?: { watched: number };
  shows?: { watched: number };
}

export const getUserInfo = async (): Promise<TraktUser | null> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) return null;

  try {
    const response = await authenticatedFetch(`${TRAKT_API_URL}/users/me`, {
      headers: getTraktHeaders(),
      credentials: 'omit',
    });

    if (!response.ok) {
      console.error('Error response from Trakt.tv:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};
