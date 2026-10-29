
// Trakt.tv API configuration and utilities

export const TRAKT_API_URL = 'https://api.trakt.tv';

// Get stored client ID or use default
export const getClientId = (): string => {
  return localStorage.getItem('trakt_client_id') || '';
};

// Las apps de desarrollo de Trakt solo admiten redirecciones a localhost, así que
// la redirect URI es fija aunque la app se sirva desde otro dominio (NAS)
const TRAKT_REDIRECT_URI: string =
  import.meta.env.VITE_TRAKT_REDIRECT_URI || 'http://localhost:8084/trakt-redirect.html';

// Get the redirect URI
export const getRedirectUri = (): string => {
  return TRAKT_REDIRECT_URI;
};

// Fuera de localhost, Trakt redirige a una página que no existe en este dispositivo:
// el usuario debe copiar la URL resultante y pegarla en la app
export const isManualAuthFlow = (): boolean => {
  return new URL(getRedirectUri()).origin !== window.location.origin;
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
