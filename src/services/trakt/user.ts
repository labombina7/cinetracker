
import { TRAKT_API_URL, getTraktHeaders } from './config';

// Get user info
export const getUserInfo = async (): Promise<any> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) return null;

  try {
    const response = await fetch(`${TRAKT_API_URL}/users/me`, {
      headers: getTraktHeaders(),
      credentials: 'omit'  // Añadido para evitar envío automático de cookies
    });

    if (!response.ok) {
      console.error('Error response from Trakt.tv:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error data:', errorData);
      
      // If unauthorized, clear token
      if (response.status === 401) {
        localStorage.removeItem('trakt_token');
      }
      
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};
