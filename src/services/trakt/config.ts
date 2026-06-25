
// Trakt.tv API configuration and utilities

export const TRAKT_API_URL = 'https://api.trakt.tv';

// Get stored client ID or use default
export const getClientId = (): string => {
  return localStorage.getItem('trakt_client_id') || '';
};

// Get stored client secret (if any)
export const getClientSecret = (): string => {
  return localStorage.getItem('trakt_client_secret') || '';
};

// Get the redirect URI
export const getRedirectUri = (): string => {
  return window.location.origin + '/trakt-redirect.html';
};

// Función para actualizar los headers de las peticiones a Trakt
export const getTraktHeaders = (withAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': getClientId()
  };
  
  if (withAuth) {
    const token = localStorage.getItem('trakt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Check if user is authenticated and client ID is set
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('trakt_token') && !!getClientId();
};

// Check if client credentials are configured
export const hasClientCredentials = (): boolean => {
  return !!getClientId();
};
